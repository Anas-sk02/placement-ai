import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const DEFAULT_USER_ID = '8646b47c-acfd-4f5d-ae91-6b7313d0ed40';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Valid message is required' }, { status: 400 });
    }

    // 1. Identify User
    let userId = DEFAULT_USER_ID;
    try {
      const supabase = createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        userId = user.id;
      }
    } catch {
      // Fallback to default user
    }

    // 2. Fetch Live Context from Database via Admin client to bypass RLS limits
    const [profileRes, insightsRes, deadlinesRes, appsRes] = await Promise.all([
      (supabaseAdmin.from('student_profiles') as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      (supabaseAdmin.from('ai_insights') as any)
        .select('company_name, role_title, opportunity_type, salary_or_stipend, min_cgpa, allowed_branches, batch_year, deadline_timestamp, application_url, action_required, urgency, group_name, created_at')
        .order('created_at', { ascending: false })
        .limit(25),
      (supabaseAdmin.from('deadlines') as any)
        .select('title, company_name, deadline_at, status, action_url')
        .order('deadline_at', { ascending: true })
        .limit(10),
      (supabaseAdmin.from('applications') as any)
        .select('company_name, role_title, status, applied_date, salary_or_stipend')
        .order('applied_date', { ascending: false })
        .limit(10),
    ]);

    const profile = profileRes.data || {
      full_name: 'Hasan',
      degree: 'B.Tech',
      branch: 'CSE',
      graduation_year: 2026,
      cgpa: 8.42,
      active_backlogs: 0,
      skills: ['React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'SQL', 'Data Structures', 'Algorithms'],
    };

    const insights = insightsRes.data || [];
    const deadlines = deadlinesRes.data || [];
    const applications = appsRes.data || [];

    const studentSummary = `
- Name: ${profile.full_name || 'Hasan'}
- Degree & Branch: ${profile.degree || 'B.Tech'} in ${profile.branch || 'CSE'}
- Target Batch: ${profile.graduation_year || 2026}
- CGPA: ${profile.cgpa ?? 8.42} (Backlogs: ${profile.active_backlogs ?? 0})
- Key Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'Software Engineering, Full Stack, DSA'}
- Current Applications In-Flight: ${applications.length > 0 ? applications.map((a: any) => `${a.company_name} (${a.role_title} - Stage: ${a.status})`).join(', ') : 'None yet'}
`.trim();

    const noticesSummary = insights.length > 0
      ? insights.map((ins: any, idx: number) => {
          const dl = ins.deadline_timestamp ? new Date(ins.deadline_timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Closing soon / Not specified';
          const branches = Array.isArray(ins.allowed_branches) ? ins.allowed_branches.join(', ') : 'All Branches';
          return `${idx + 1}. [${ins.company_name}] (${ins.role_title || 'Role not specified'})
   - Type: ${ins.opportunity_type || 'JOB'} | CTC/Stipend: ${ins.salary_or_stipend || 'Competitive'}
   - Cutoff: Min CGPA ${ins.min_cgpa ?? 'None'} | Allowed: ${branches} | Batch: ${ins.batch_year || '2025/2026'}
   - Deadline: ${dl}
   - Action: ${ins.action_required || 'Register on portal'} | URL: ${ins.application_url || 'N/A'}
   - Source Channel: ${ins.group_name || 'Telegram'}`;
        }).join('\n\n')
      : 'No notices currently synced in database.';

    const deadlinesSummary = deadlines.length > 0
      ? deadlines.map((d: any) => `- ${d.company_name} - ${d.title} (Deadline: ${new Date(d.deadline_at).toLocaleString('en-IN')}, Status: ${d.status})`).join('\n')
      : 'No active tracked deadlines.';

    const systemInstruction = `You are "PlaceMint AI", an intelligent, highly supportive campus placement and career copilot for college engineering students.

YOUR ROLES & CAPABILITIES:
1. Grounded Notice Intelligence: Help the student explore active recruitment opportunities, verify eligibility (comparing their exact CGPA of ${profile.cgpa ?? 8.42} and ${profile.branch ?? 'CSE'} branch), and find application links.
2. Deadline Tracking: Alert the student about approaching application and test deadlines.
3. Interview & Technical Preparation: When asked about roadmaps, DSA, System Design, Core CS (OS, DBMS, CN, OOPs), or company-specific hiring patterns (e.g. Amazon, Google, Goldman Sachs, TCS, Microsoft, Uber, etc.), provide structured, actionable, high-yield guidance.
4. Resume & Application Strategy: Provide cold email templates, ATS resume bullet points, and project suggestions tailored to their skills.

GROUNDING & TONE RULES:
- When discussing specific open drives, use the provided active Telegram notices and deadlines list below. Include clickable links if available in the notice.
- Format responses cleanly with Markdown (bold highlights, clear bullet points, neat sections).
- If the student asks about something general (like preparation, interview questions, DSA tips), give thorough, top-tier advice.
- Always be encouraging, concise, professional, and friendly. Address the student by their name (${profile.full_name || 'Hasan'}).

=== STUDENT PROFILE ===
${studentSummary}

=== LIVE RECRUITMENT NOTICES FROM TELEGRAM CHANNELS ===
${noticesSummary}

=== UPCOMING TRACKED DEADLINES ===
${deadlinesSummary}
`;

    // 3. Call Gemini AI (gemini-2.5-flash)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemInstruction,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1200,
          },
        });

        // Format history for Gemini chat
        const formattedHistory: any[] = [];
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          for (const item of conversationHistory.slice(-6)) {
            const role = (item.sender === 'user' || item.role === 'user') ? 'user' : 'model';
            const text = item.text || item.content || '';
            if (text && typeof text === 'string') {
              formattedHistory.push({
                role,
                parts: [{ text }],
              });
            }
          }
        }

        // Start chat with history
        const chat = model.startChat({
          history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const replyText = result.response?.text();

        if (replyText) {
          const sources: string[] = ['Student Profile', 'Verified Telegram Channels'];
          if (deadlines.length > 0) sources.push('Deadline Tracker');

          return NextResponse.json({
            reply: replyText,
            sources,
          });
        }
      } catch (err: any) {
        console.warn('[PlaceMint AI Assistant] Gemini 2.5 Flash error, running fallback synthesis:', err?.message || err);
      }
    }

    // 4. Grounded Fallback Synthesizer if API key is missing or offline
    const lower = message.toLowerCase();
    let fallbackReply = '';
    const studentCgpa = profile.cgpa ?? 8.42;

    if (lower.includes('eligible') || lower.includes('qualify') || lower.includes('cutoff')) {
      const eligibleList = insights.filter((i: any) => !i.min_cgpa || studentCgpa >= i.min_cgpa);
      fallbackReply = `Hello **${profile.full_name || 'Hasan'}**! Based on your profile (**${profile.branch || 'CSE'}, ${studentCgpa} CGPA**), here are your eligible opportunities:\n\n` +
        eligibleList.map((i: any) => `• **${i.company_name}** (${i.role_title || 'Software Engineer'}) — **${i.salary_or_stipend || 'Competitive'}** (Cutoff: ${i.min_cgpa ? `${i.min_cgpa} CGPA` : 'No Cutoff'})\n  🔗 Apply: ${i.application_url || 'Via TPO Portal'}`).join('\n\n');
    } else if (lower.includes('deadline') || lower.includes('urgent') || lower.includes('today')) {
      fallbackReply = deadlines.length > 0
        ? `⏰ **Your Upcoming Tracked Deadlines**:\n\n` + deadlines.map((d: any) => `• **${d.company_name}**: ${d.title}\n  📅 Deadline: **${new Date(d.deadline_at).toLocaleString('en-IN')}**`).join('\n\n')
        : `You currently have **0 pending deadlines** expiring soon! Everything is on schedule.`;
    } else if (lower.includes('prep') || lower.includes('roadmap') || lower.includes('interview') || lower.includes('dsa')) {
      fallbackReply = `### 🚀 Placement Preparation Roadmap for ${profile.full_name || 'Hasan'}\n\n` +
        `1. **Data Structures & Algorithms**: Focus on Arrays, HashMaps, Trees, Graphs, and Dynamic Programming (20-30 problems each on LeetCode/GFG).\n` +
        `2. **Core CS Subjects**: Revise **OS** (Process scheduling, Deadlocks), **DBMS** (SQL Queries, Normalization, Indexing), and **Computer Networks** (TCP/UDP, HTTP/HTTPS).\n` +
        `3. **Projects & System Design**: Be ready to explain architecture, API design, and DB schemas of your ${profile.skills?.slice(0, 3).join(', ') || 'Full-Stack'} projects.\n` +
        `4. **Mock Tests & Timing**: Practice with timed 60-min coding tests to match actual Online Assessment conditions.`;
    } else {
      fallbackReply = `Hello **${profile.full_name || 'Hasan'}**! I am your **PlaceMint AI Placement Copilot**.\n\n` +
        `I have indexed **${insights.length} active notices** and **${deadlines.length} tracked deadlines** from your connected channels.\n\n` +
        `Feel free to ask me:\n` +
        `• *"Which high-CTC drives am I eligible for?"*\n` +
        `• *"What deadlines are approaching this week?"*\n` +
        `• *"How do I prepare for technical interviews?"*\n` +
        `• *"Give me resume tips for software engineering roles."*`;
    }

    return NextResponse.json({
      reply: fallbackReply,
      sources: ['Student Profile', 'Placement Database'],
    });
  } catch (err: any) {
    console.error('[Assistant Chat API Error]:', err);
    return NextResponse.json({ error: err.message || 'Assistant request failed' }, { status: 500 });
  }
}
