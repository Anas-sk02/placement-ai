import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { scrapeTelegramChannel } from '@/lib/telegram/channel-scraper';
import { extractPlacementInsight } from '@/lib/ai/extractor';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Query discovered groups using admin to avoid any RLS limitation
    const { data: groups, error } = await supabaseAdmin
      .from('telegram_groups')
      .select(`
        id,
        telegram_id,
        title,
        username,
        chat_type,
        total_members,
        last_message_at,
        last_discovered_at
      `)
      .order('last_discovered_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ groups: groups || [] });
    }

    // Query user's monitoring preferences
    const { data: monitored } = await (supabaseAdmin.from('user_monitored_groups') as any)
      .select('group_id, is_monitored')
      .eq('user_id', user.id);

    const monitoredMap = new Map<string, boolean>();
    (monitored || []).forEach((m: any) => {
      monitoredMap.set(m.group_id, m.is_monitored);
    });

    const enrichedGroups = (groups || []).map((g: any) => ({
      ...g,
      is_monitored: monitoredMap.has(g.id) ? monitoredMap.get(g.id) : true,
    }));

    return NextResponse.json({ groups: enrichedGroups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { title, username, chat_type = 'CHANNEL' } = body;

    if (!title && !username) {
      return NextResponse.json({ error: 'Title or username is required' }, { status: 400 });
    }

    const cleanUsername = (username || '')
      .replace(/^@/, '')
      .replace(/^(https?:\/\/)?(www\.)?t\.me\/(s\/)?/i, '')
      .split('/')[0]
      .split('?')[0]
      .trim();

    // 1. Try to scrape real channel data and messages
    let realTitle = title ? title.trim() : `@${cleanUsername}`;
    let realMembers = 500;
    let recentMessages: any[] = [];

    if (cleanUsername) {
      try {
        const scraped = await scrapeTelegramChannel(cleanUsername);
        if (scraped.title && !title) {
          realTitle = scraped.title;
        }
        if (scraped.total_members > 0) {
          realMembers = scraped.total_members;
        }
        recentMessages = scraped.messages || [];
      } catch (err) {
        console.warn('[Telegram Add] Public scraping fallback:', err);
      }
    }

    // Generate a negative 64-bit Telegram ID from username
    let tgId = -1000000000000 - Math.floor(Math.random() * 899999999);
    if (cleanUsername) {
      let hash = 0;
      for (let i = 0; i < cleanUsername.length; i++) {
        hash = (hash << 5) - hash + cleanUsername.charCodeAt(i);
        hash |= 0;
      }
      tgId = -1000000000000 - Math.abs(hash);
    }

    // Upsert into telegram_groups
    const { data: group, error: groupErr } = await (supabaseAdmin.from('telegram_groups') as any)
      .upsert(
        {
          telegram_id: tgId,
          title: realTitle,
          username: cleanUsername || null,
          chat_type: chat_type,
          total_members: realMembers,
          last_message_at: recentMessages[0]?.date || new Date().toISOString(),
          last_discovered_at: new Date().toISOString(),
        },
        { onConflict: 'telegram_id' }
      )
      .select()
      .single();

    if (groupErr) {
      return NextResponse.json({ error: groupErr.message }, { status: 400 });
    }

    // Attach to user_monitored_groups
    if (user) {
      await (supabaseAdmin.from('user_monitored_groups') as any).upsert(
        {
          user_id: user.id,
          group_id: group.id,
          is_monitored: true,
          auto_analyze: true,
        },
        { onConflict: 'user_id,group_id' }
      );
    }

    // Process and extract recent messages in background / immediately
    let insightsCreated = 0;
    for (const msg of recentMessages.slice(0, 15)) {
      try {
        const msgHash = crypto
          .createHash('sha256')
          .update(`${group.id}:${msg.message_id}:${msg.text}`)
          .digest('hex');

        // Save message
        const { data: savedMsg } = await (supabaseAdmin.from('telegram_messages') as any)
          .upsert(
            {
              group_id: group.id,
              telegram_message_id: msg.message_id,
              message_text: msg.text,
              message_timestamp: msg.date,
              message_hash: msgHash,
              has_links: msg.has_link,
            },
            { onConflict: 'group_id,telegram_message_id' }
          )
          .select()
          .single();

        // Run AI Extraction
        const insight = await extractPlacementInsight(msg.text, msg.date);
        if (insight && insight.is_placement_related) {
          const { data: existingInsights } = await (supabaseAdmin.from('ai_insights') as any)
            .select('id')
            .eq('group_id', group.id)
            .eq('company_name', insight.company_name)
            .limit(1);

          if (existingInsights && existingInsights.length > 0) {
            if (savedMsg?.id) {
              await (supabaseAdmin.from('ai_insights') as any)
                .update({ source_message_id: savedMsg.id })
                .eq('id', existingInsights[0].id);
            }
            continue;
          }

          insightsCreated++;

          const { data: savedInsight, error: insErr } = await (supabaseAdmin.from('ai_insights') as any).insert({
            user_id: user?.id || '8646b47c-acfd-4f5d-ae91-6b7313d0ed40',
            group_id: group.id,
            source_message_id: savedMsg?.id || null,
            company_name: insight.company_name,
            role_title: insight.role_title,
            opportunity_type: insight.opportunity_type || 'JOB',
            batch_year: insight.batch_year,
            salary_or_stipend: insight.salary_or_stipend,
            min_cgpa: insight.min_cgpa,
            eligibility_raw: insight.eligibility_raw,
            deadline_timestamp: insight.registration_deadline,
            application_url: insight.application_url,
            action_required: insight.action_required,
            urgency: insight.urgency || 'MEDIUM',
            confidence_score: insight.confidence_score || 0.95,
            extraction_provider: insight.extraction_provider || 'RULE_FALLBACK',
          }).select().single();

          if (insErr) {
            console.error('[Groups Add] ai_insights insert error:', insErr);
          }

          // Upsert company
          if (insight.company_name && insight.company_name !== 'Recruiter') {
            await (supabaseAdmin.from('companies') as any).upsert(
              {
                name: insight.company_name,
                domain: `${insight.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                typical_ctc: insight.salary_or_stipend || 'Competitive',
                min_cgpa: insight.min_cgpa || 7.0,
                hiring_frequency: 'Campus Drive',
                roles: insight.role_title ? [insight.role_title] : ['Software Engineer'],
              },
              { onConflict: 'name' }
            );
          }

          // Register deadline if future
          if (user && insight.registration_deadline) {
            const deadlineTime = new Date(insight.registration_deadline).getTime();
            if (deadlineTime > Date.now()) {
              await (supabaseAdmin.from('deadlines') as any).insert({
                user_id: user.id,
                insight_id: savedInsight?.id || null,
                company_name: insight.company_name,
                title: `${insight.company_name} Application Deadline`,
                deadline_at: insight.registration_deadline,
                action_url: insight.application_url || null,
                status: 'UPCOMING',
              });
            }
          }
        }
      } catch (err) {
        console.warn('[Telegram Add] Error parsing message:', err);
      }
    }

    return NextResponse.json({
      success: true,
      group: {
        ...group,
        total_members: realMembers,
        is_monitored: true,
      },
      messages_analyzed: recentMessages.length,
      insights_created: insightsCreated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add Telegram channel' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('telegram_groups').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete channel' }, { status: 500 });
  }
}

