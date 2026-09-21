import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { scrapeTelegramChannel } from '@/lib/telegram/channel-scraper';
import { extractPlacementInsight } from '@/lib/ai/extractor';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

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

      try {
        const scraped = await scrapeTelegramChannel(group.username);

        // Update real member count and title if needed
        await (supabaseAdmin.from('telegram_groups') as any)
          .update({
            total_members: scraped.total_members || group.total_members,
            title: group.title || scraped.title,
            last_message_at: scraped.messages[0]?.date || new Date().toISOString(),
          })
          .eq('id', group.id);

        // Process recent messages
        for (const msg of scraped.messages.slice(0, 10)) {
          totalMessagesFetched++;

          // 1. Save to telegram_messages
          const { data: savedMsg } = await (supabaseAdmin.from('telegram_messages') as any)
            .upsert(
              {
                group_id: group.id,
                telegram_message_id: msg.message_id,
                raw_text: msg.text,
                sent_at: msg.date,
                has_media: msg.has_link,
              },
              { onConflict: 'group_id,telegram_message_id' }
            )
            .select()
            .single();

          // 2. Run AI extraction pipeline
          try {
            const insight = await extractPlacementInsight(msg.text, msg.date);
            if (insight && insight.is_placement_related) {
              totalInsightsExtracted++;

              // Save to ai_insights
              const { data: savedInsight } = await (supabaseAdmin.from('ai_insights') as any).insert({
                user_id: user?.id || null,
                group_id: group.id,
                source_message_id: savedMsg?.id || null,
                company_name: insight.company_name,
                role_title: insight.role_title,
                opportunity_type: insight.opportunity_type,
                batch_year: insight.batch_year,
                salary_or_stipend: insight.salary_or_stipend,
                min_cgpa: insight.min_cgpa,
                eligibility_raw: insight.eligibility_raw,
                deadline_timestamp: insight.registration_deadline,
                application_url: insight.application_url,
                action_required: insight.action_required,
                urgency: insight.urgency,
                confidence_score: insight.confidence_score,
                extraction_provider: insight.extraction_provider,
                raw_message_text: msg.text,
                group_name: group.title,
              }).select().single();

              // Save to companies if company name exists
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

              // Save to deadlines if valid future deadline
              if (user && insight.registration_deadline) {
                const deadlineTime = new Date(insight.registration_deadline).getTime();
                if (deadlineTime > Date.now()) {
                  await (supabaseAdmin.from('deadlines') as any).insert({
                    user_id: user.id,
                    insight_id: savedInsight?.id || null,
                    company_name: insight.company_name,
                    title: `${insight.company_name} Registration Deadline`,
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
