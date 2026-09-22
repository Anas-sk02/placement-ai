import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const urgency = searchParams.get('urgency');

    let query = supabaseAdmin
      .from('ai_insights')
      .select(`
        *,
        telegram_groups (
          title,
          username
        ),
        telegram_messages (
          message_text,
          message_timestamp
        )
      `)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false });

    if (type && type !== 'ALL') {
      query = query.eq('opportunity_type', type as any);
    }
    if (urgency) {
      query = query.eq('urgency', urgency as any);
    }

    const { data: insights, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const formatted = (insights || []).map((ins: any) => ({
      ...ins,
      group_name:
        ins.telegram_groups?.title ||
        (ins.telegram_groups?.username ? `@${ins.telegram_groups.username}` : 'Telegram Channel'),
      raw_message_text:
        ins.telegram_messages?.message_text ||
        ins.eligibility_raw ||
        `${ins.company_name} placement opportunity announced on ${ins.telegram_groups?.title || 'Telegram'}`,
    }));

    return NextResponse.json({ insights: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
