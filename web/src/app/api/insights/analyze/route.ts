import { NextResponse } from 'next/server';
import { extractPlacementInsight } from '@/lib/ai/extractor';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawText = body.rawText || body.raw_text;
    const messageTimestamp = body.messageTimestamp || body.message_timestamp;
    const groupId = body.groupId || body.group_id;
    const groupName = body.groupName || body.group_name || 'Placement Ingestion Desk';
    const messageId = body.messageId || body.message_id;

    if (!rawText) {
      return NextResponse.json({ error: 'rawText is required' }, { status: 400 });
    }

    const insight = await extractPlacementInsight(rawText, messageTimestamp);

    if (!insight.is_placement_related) {
      return NextResponse.json({
        is_placement_related: false,
        message: 'Notice is general chatter or non-placement announcement',
      });
    }

    // Save to Supabase ai_insights
    const supabase = createServerSupabaseClient();
    let { data: { user } } = await supabase.auth.getUser();

    let targetGroupId = groupId;
    if (!targetGroupId) {
      const { data: grps } = await (supabaseAdmin.from('telegram_groups') as any).select('id').limit(1);
      targetGroupId = grps?.[0]?.id;
    }

    const { data: saved, error } = await (supabaseAdmin.from('ai_insights') as any)
      .insert({
        user_id: user?.id || '8646b47c-acfd-4f5d-ae91-6b7313d0ed40',
        group_id: targetGroupId,
        source_message_id: messageId || null,
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
      })
      .select()
      .single();

    if (!error && saved) {
      return NextResponse.json({
        insight: {
          ...saved,
          group_name: groupName,
          raw_message_text: rawText,
        },
      });
    }

    return NextResponse.json({
      insight: {
        ...insight,
        group_name: groupName,
        raw_message_text: rawText,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
