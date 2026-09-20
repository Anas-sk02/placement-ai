import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const urgency = searchParams.get('urgency');

    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('ai_insights')
      .select('*')
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

    return NextResponse.json({ insights: insights || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
