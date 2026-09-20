import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { groupId, isMonitored } = body;

    if (!groupId) {
      return NextResponse.json({ error: 'groupId is required' }, { status: 400 });
    }

    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await (supabase.from('user_monitored_groups') as any)
      .upsert(
        {
          user_id: userId,
          group_id: groupId,
          is_monitored: isMonitored,
        },
        { onConflict: 'user_id,group_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, monitoring: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to toggle monitor' }, { status: 500 });
  }
}
