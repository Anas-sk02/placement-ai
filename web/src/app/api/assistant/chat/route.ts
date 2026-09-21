import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch live context from database (Profile, Notices, Deadlines)
    const { data: profile } = await (supabase.from('student_profiles') as any)
      .select('*')
      .eq('user_id', user?.id || '00000000-0000-0000-0000-000000000000')
      .single();

    const { data: insights } = await (supabase.from('ai_insights') as any)
      .select('company_name, role_title, opportunity_type, salary_or_stipend, min_cgpa, batch_year, deadline_timestamp, application_url, action_required, urgency')
      .order('created_at', { ascending: false })
      .limit(15);

    const { data: deadlines } = await (supabase.from('deadlines') as any)
      .select('title, company_name, deadline_at, status')
      .order('deadline_at', { ascending: true })
      .limit(10);

    const studentSummary = profile
      ? `Student Profile: Name: ${profile.full_name}, Degree: ${profile.degree || 'B.Tech'}, Branch: ${profile.branch || 'CSE'}, Batch: ${profile.graduation_year || 2026}, CGPA: ${profile.cgpa || 8.42}, Active Backlogs: ${profile.active_backlogs || 0}, Skills: ${(profile.skills || []).join(', ')}.`
      : `Student Profile: B.Tech CSE, 2026 Batch, 8.42 CGPA, 0 backlogs.`;

    const noticeContext = (insights && insights.length > 0)
      ? insights.map((ins: any, idx: number) => `Notice #${idx+1}: [${ins.company_name}] Role: ${ins.role_title || 'Software Engineer'}, Type: ${ins.opportunity_type}, CTC: ${ins.salary_or_stipend || 'Competitive'}, Min CGPA: ${ins.min_cgpa ?? 'None'}, Batch: ${ins.batch_year || '2026'}, Deadline: ${ins.deadline_timestamp || 'Closing soon'}, Apply URL: ${ins.application_url || 'N/A'}, Action: ${ins.action_required || 'Register'}`).join('\n')
      : `No placement notices have been ingested or synced yet.`;

    const deadlinesContext = (deadlines && deadlines.length > 0)
      ? deadlines.map((d: any) => `Deadline: ${d.company_name} - ${d.title} (At: ${d.deadline_at}, Status: ${d.status})`).join('\n')
      : `No upcoming deadlines currently tracked.`;

    const systemPrompt = `You are the PlaceMint Grounded AI Placement Assistant.
Your mission is to provide concise, 100% accurate, highly actionable placement guidance to the student based STRICTLY on their student profile and the provided college Telegram recruitment notices and deadlines.

RULES:
1. Always ground your answers in the provided notices. Do NOT invent companies, packages, or cutoffs that are not listed.
2. If comparing student eligibility, check their actual CGPA and branch against the notice criteria.
3. Be encouraging, precise, and format responses cleanly with markdown bullet points.
4. When mentioning a company with an active application link, include the link.
5. If no notices exist, guide the user to connect their college Telegram group or paste/ingest notices in the Insights tab.

CURRENT CONTEXT:
${studentSummary}

ACTIVE NOTICES STORED FROM TELEGRAM:
${noticeContext}

TRACKED APPLICATION DEADLINES:
${deadlinesContext}
`;

    // 2. Call Gemini API if available
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: systemPrompt,
          generationConfig: { temperature: 0.2 },
        });

        const chat = model.startChat();
        const result = await chat.sendMessage(message);
        const replyText = result.response?.text();

        if (replyText) {
          return NextResponse.json({
            reply: replyText,
            sources: ['Student Profile', 'Active Synced Notices'],
          });
        }
      } catch (err) {
        console.warn('Gemini chat error, using grounded fallback synthesizer:', err);
      }
    }

    // 3. Grounded Fallback Synthesizer
    let fallbackReply = '';
    const lower = message.toLowerCase();

    if (!insights || insights.length === 0) {
      fallbackReply = `Welcome to **PlaceMint AI**! You currently do not have any recruitment notices or deadlines synced yet.\n\nTo get started:\n1. **Connect Telegram**: Go to the **Telegram Channels** tab to connect your college placement group.\n2. **Ingest Notices**: Go to **Placement Notices** and click **"+ Ingest Notice with AI"** to analyze any TPO update.\n\nOnce synced, I will automatically calculate your branch and CGPA eligibility across all hiring drives!`;
    } else if (lower.includes('eligible') || lower.includes('qualify') || lower.includes('cutoff')) {
      const studentCgpa = profile?.cgpa || 8.0;
      const eligibleList = insights.filter((i: any) => !i.min_cgpa || studentCgpa >= i.min_cgpa);
      fallbackReply = `Based on your profile (**${profile?.branch || 'Engineering'}, ${studentCgpa} CGPA**), here are your eligible opportunities:\n\n` +
        eligibleList.map((i: any) => `• **${i.company_name}** (${i.role_title || 'Software Engineer'}) — CTC: ${i.salary_or_stipend || 'Competitive'} (Cutoff: ${i.min_cgpa ?? 'None'})`).join('\n');
    } else if (lower.includes('deadline') || lower.includes('urgent') || lower.includes('today')) {
      fallbackReply = (deadlines && deadlines.length > 0)
        ? `🔥 **Upcoming Deadlines**:\n\n` + deadlines.map((d: any) => `• **${d.company_name}**: ${d.title} (At: ${new Date(d.deadline_at).toLocaleString()})`).join('\n')
        : `You have no urgent deadlines expiring right now!`;
    } else {
      fallbackReply = `You have **${insights.length} active placement notice(s)** synced. You can ask me about eligible companies, cutoffs, interview rounds, or test preparation!`;
    }

    return NextResponse.json({
      reply: fallbackReply,
      sources: ['Student Profile', 'Placement Database'],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Assistant request failed' }, { status: 500 });
  }
}
