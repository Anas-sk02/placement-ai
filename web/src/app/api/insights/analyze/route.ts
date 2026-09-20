import { NextResponse } from 'next/server';
import { extractPlacementInsight } from '@/lib/ai/extractor';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, messageTimestamp, groupId, messageId } = body;

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

    // Save to Supabase if groupId is provided
    if (groupId) {
      const supabase = createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await (supabase.from('ai_insights') as any)
        .insert({
          user_id: user?.id || '00000000-0000-0000-0000-000000000000',
          group_id: groupId,
          source_message_id: messageId || null,
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
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ insight: data });
      }
    }

    return NextResponse.json({ insight });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
