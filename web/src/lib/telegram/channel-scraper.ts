/**
 * PlaceMint Telegram Public Channel Scraper
 * Fetches real channel information and recent messages directly from Telegram Web Preview (https://t.me/s/<channel>)
 * Works for any public Telegram channel without requiring MTProto phone/OTP login.
 */

export interface ScrapedTelegramMessage {
  message_id: number;
  post_id: string;
  text: string;
  date: string;
  has_link: boolean;
}

export interface ScrapedTelegramChannel {
  username: string;
  title: string;
  description: string;
  total_members: number;
  members_raw: string;
  avatar_url?: string;
  messages: ScrapedTelegramMessage[];
}

export function parseMemberCount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ').trim().toLowerCase();
  
  // Example: "14.2k subscribers", "1.5m members", "25.5K"
  const kmMatch = cleaned.match(/([\d\.,]+)\s*([km])\b/i);
  if (kmMatch) {
    let num = parseFloat(kmMatch[1].replace(/,/g, ''));
    if (kmMatch[2].toLowerCase() === 'k') num *= 1000;
    if (kmMatch[2].toLowerCase() === 'm') num *= 1000000;
    return Math.round(num);
  }

  // Example: "12 450 subscribers", "540 subscribers", "1,200 members"
  const subMatch = cleaned.match(/([\d\s,\.]+)\s*(subscribers?|members?)/i);
  if (subMatch) {
    const digits = subMatch[1].replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  const digitsOnly = cleaned.replace(/[^\d]/g, '');
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}

function cleanHtmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export async function scrapeTelegramChannel(username: string): Promise<ScrapedTelegramChannel> {
  const cleanUsername = username
    .replace(/^@/, '')
    .replace(/^https?:\/\/t\.me\/(s\/)?/, '')
    .split('/')[0]
    .split('?')[0]
    .trim();

  if (!cleanUsername) {
    throw new Error('Invalid Telegram channel username');
  }

  const sUrl = `https://t.me/s/${cleanUsername}`;
  const directUrl = `https://t.me/${cleanUsername}`;

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  // Fetch both sUrl (messages stream) and directUrl (exact profile & subscriber count) in parallel
  const [sRes, directRes] = await Promise.allSettled([
    fetch(sUrl, { headers, cache: 'no-store' }),
    fetch(directUrl, { headers, cache: 'no-store' }),
  ]);

  let html = '';
  if (sRes.status === 'fulfilled' && sRes.value.ok) {
    html = await sRes.value.text();
  }

  let directHtml = '';
  if (directRes.status === 'fulfilled' && directRes.value.ok) {
    directHtml = await directRes.value.text();
  }

  const fullHtml = html + '\n' + directHtml;

  // 1. Extract Title
  let title = '';
  const titleMatch =
    directHtml.match(/<meta property="og:title" content="([^"]+)">/i) ||
    directHtml.match(/<div class="tgme_page_title"[^>]*><span[^>]*>(.*?)<\/span><\/div>/i) ||
    html.match(/<meta property="og:title" content="([^"]+)">/i);

  if (titleMatch) {
    title = cleanHtmlToText(titleMatch[1]);
  }

  // 2. Extract Description
  let description = '';
  const descMatch =
    directHtml.match(/<meta property="og:description" content="([^"]+)">/i) ||
    directHtml.match(/<div class="tgme_page_description"[^>]*>(.*?)<\/div>/i) ||
    html.match(/<meta property="og:description" content="([^"]+)">/i);

  if (descMatch) {
    description = cleanHtmlToText(descMatch[1]);
  }

  // 3. Extract Exact Members Count
  let membersRaw = '';
  let totalMembers = 0;

  // Try direct page first (e.g. <div class="tgme_page_extra">155 276 subscribers</div>)
  const directExtraMatch = directHtml.match(/<div class="tgme_page_extra"[^>]*>(.*?)<\/div>/i);
  if (directExtraMatch) {
    membersRaw = cleanHtmlToText(directExtraMatch[1]);
    totalMembers = parseMemberCount(membersRaw);
  }

  // Fallback to counter on s page
  if (totalMembers === 0) {
    const sCounterMatch = html.match(
      /<div class="tgme_channel_info_counter"[^>]*><span class="counter_value"[^>]*>(.*?)<\/span>\s*<span class="counter_type"[^>]*>(.*?)<\/span><\/div>/i
    );
    if (sCounterMatch) {
      membersRaw = `${cleanHtmlToText(sCounterMatch[1])} ${cleanHtmlToText(sCounterMatch[2])}`;
      totalMembers = parseMemberCount(membersRaw);
    }
  }

  // Fallback title if not found
  if (!title) {
    title = `@${cleanUsername}`;
  }

  // 4. Extract Recent Messages from s page
  const messages: ScrapedTelegramMessage[] = [];
  const msgBlockRegex =
    /<div class="tgme_widget_message\s+([^"]*)"\s+data-post="([^"]+)"[\s\S]*?(?=<div class="tgme_widget_message\s+|<\/body>|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = msgBlockRegex.exec(html)) !== null) {
    const blockContent = match[0];
    const postId = match[2];
    const messageNum = parseInt(postId.split('/')[1] || '0', 10);

    const textMatch = blockContent.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const rawText = textMatch ? cleanHtmlToText(textMatch[1]) : '';

    const dateMatch = blockContent.match(/<time datetime="([^"]+)"/i);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString();

    if (rawText && rawText.length >= 10) {
      messages.push({
        message_id: messageNum || Date.now(),
        post_id: postId,
        text: rawText,
        date,
        has_link: rawText.includes('http://') || rawText.includes('https://'),
      });
    }
  }

  return {
    username: cleanUsername,
    title,
    description,
    total_members: totalMembers,
    members_raw: membersRaw,
    messages,
  };
}
