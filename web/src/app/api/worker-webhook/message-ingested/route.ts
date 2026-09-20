import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { extractPlacementInsight } from '@/lib/ai/extractor';
import { computeMessageHash } from '@/lib/business/deduplication';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-worker-secret');
    const expectedSecret = process.env.TELEGRAM_WORKER_SECRET || 'placemint_super_secret_worker_token_2026';

    if (authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized worker request' }, { status: 401 });
    }

    const payload = await request.json();
    const { group_telegram_id, telegram_message_id, sender_name, message_text, message_timestamp } = payload;

    if (!group_telegram_id || !message_text) {
      return NextResponse.json({ error: 'Missing required message parameters' }, { status: 400 });
    }

    // 1. Find group UUID by telegram_id
    const { data: group } = await (supabaseAdmin.from('telegram_groups') as any)
      .select('id')
      .eq('telegram_id', group_telegram_id)
      .single();

    if (!group) {
      return NextResponse.json({ error: 'Group not found in registry' }, { status: 404 });
    }

    const messageHash = computeMessageHash(message_text);

    // 2. Ingest into telegram_messages
    const { data: storedMessage, error: msgError } = await (supabaseAdmin.from('telegram_messages') as any)
      .upsert(
        {
          group_id: group.id,
          telegram_message_id,
          sender_name: sender_name || 'TPO Desk',
          message_text,
          message_timestamp: message_timestamp || new Date().toISOString(),
          message_hash: messageHash,
          has_links: /https?:\/\//i.test(message_text),
        },
        { onConflict: 'group_id,telegram_message_id' }
      )
      .select()
      .single();

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 400 });
    }

    // 3. Trigger Dual AI extraction
    const insight = await extractPlacementInsight(message_text, message_timestamp);

    if (insight.is_placement_related) {
      // Find all students monitoring this group
      const { data: monitoredUsers } = await (supabaseAdmin.from('user_monitored_groups') as any)
        .select('user_id')
        .eq('group_id', group.id)
        .eq('is_monitored', true);

      if (monitoredUsers && monitoredUsers.length > 0) {
        const insightsToInsert = monitoredUsers.map((u: any) => ({
          user_id: u.user_id,
          group_id: group.id,
          source_message_id: storedMessage.id,
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
        }));

        await (supabaseAdmin.from('ai_insights') as any).insert(insightsToInsert);
      }
    }

    return NextResponse.json({
      success: true,
      message_id: storedMessage.id,
      is_placement_related: insight.is_placement_related,
      company: insight.company_name,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Worker webhook failed' }, { status: 500 });
  }
}
