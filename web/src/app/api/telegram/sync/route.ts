import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { scrapeTelegramChannel } from '@/lib/telegram/channel-scraper';
import { extractPlacementInsight } from '@/lib/ai/extractor';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    let { data: { user } } = await supabase.auth.getUser();

    // Fallback to first registered user if background sync without cookie
    if (!user) {
      const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
      if (userData?.users && userData.users.length > 0) {
        user = userData.users[0] as any;
      }
    }

    const currentUserId = user?.id || '8646b47c-acfd-4f5d-ae91-6b7313d0ed40';

    // Fetch all monitored groups
    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('telegram_groups')
      .select('*');

    if (groupsError) {
      return NextResponse.json({ error: groupsError.message }, { status: 400 });
    }

    const groupList: any[] = groups || [];
    let totalMessagesFetched = 0;
    let totalInsightsExtracted = 0;

    for (const group of groupList) {
      if (!group.username) continue;

      const cleanUsername = group.username
        .replace(/^@/, '')
        .replace(/^(https?:\/\/)?(www\.)?t\.me\/(s\/)?/i, '')
        .split('/')[0]
        .split('?')[0]
        .trim();

      if (!cleanUsername) continue;

      try {
        const scraped = await scrapeTelegramChannel(cleanUsername);

        // Update real member count and clean username/title if needed
        await (supabaseAdmin.from('telegram_groups') as any)
          .update({
            username: cleanUsername,
            total_members: scraped.total_members || group.total_members,
            title: scraped.title && scraped.title !== `@${cleanUsername}` ? scraped.title : group.title,
            last_message_at: scraped.messages[0]?.date || new Date().toISOString(),
          })
          .eq('id', group.id);

        // Process recent messages
        for (const msg of scraped.messages.slice(0, 15)) {
          totalMessagesFetched++;

          const msgHash = crypto
            .createHash('sha256')
            .update(`${group.id}:${msg.message_id}:${msg.text}`)
            .digest('hex');

          // 1. Save to telegram_messages
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

          // 2. Run AI extraction pipeline
          try {
            const insight = await extractPlacementInsight(msg.text, msg.date);
            if (insight && insight.is_placement_related) {
              // Deduplicate insight per group + company + role
              const { data: existingInsights } = await (supabaseAdmin.from('ai_insights') as any)
                .select('id')
                .eq('group_id', group.id)
                .eq('company_name', insight.company_name)
                .limit(1);

              if (existingInsights && existingInsights.length > 0) {
                // Update source_message_id if missing
                if (savedMsg?.id) {
                  await (supabaseAdmin.from('ai_insights') as any)
                    .update({ source_message_id: savedMsg.id })
                    .eq('id', existingInsights[0].id);
                }
                continue;
              }

              totalInsightsExtracted++;

              // Save to ai_insights
              const { data: savedInsight, error: insErr } = await (supabaseAdmin.from('ai_insights') as any).insert({
                user_id: currentUserId,
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
                console.error('[Sync] ai_insights insert error:', insErr);
              }

              // Save to companies if company name exists
              if (insight.company_name && insight.company_name !== 'Unknown Recruiter' && insight.company_name !== 'Recruiter') {
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

              // Save to deadlines if valid future deadline
              if (currentUserId && insight.registration_deadline) {
                const deadlineTime = new Date(insight.registration_deadline).getTime();
                if (deadlineTime > Date.now()) {
                  await (supabaseAdmin.from('deadlines') as any).insert({
                    user_id: currentUserId,
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
          } catch (aiErr) {
            console.warn('[Sync] AI parse error for message:', aiErr);
          }
        }
      } catch (scrapeErr) {
        console.warn(`[Sync] Failed to scrape channel ${group.username}:`, scrapeErr);
      }
    }

    return NextResponse.json({
      success: true,
      channels_synced: groupList.length,
      messages_fetched: totalMessagesFetched,
      insights_extracted: totalInsightsExtracted,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
  }
}
