import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { calculateReminders } from '@/lib/business/reminder-scheduler';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    let { data: { user } } = await supabase.auth.getUser();

    const targetUserId = user?.id || '8646b47c-acfd-4f5d-ae91-6b7313d0ed40';

    const { data: deadlines, error } = await (supabaseAdmin.from('deadlines') as any)
      .select('*')
      .eq('user_id', targetUserId)
      .order('deadline_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ deadlines: deadlines || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    let { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { title, company_name, deadline_at, action_url, insight_id, offsets = [24, 6, 1] } = body;

    const userId = user?.id || '8646b47c-acfd-4f5d-ae91-6b7313d0ed40';

    if (!title || !deadline_at) {
      return NextResponse.json({ error: 'Title and deadline_at are required' }, { status: 400 });
    }

    const { data: deadline, error: deadlineError } = await (supabaseAdmin.from('deadlines') as any)
      .insert({
        user_id: userId,
        insight_id: insight_id || null,
        title,
        company_name: company_name || 'Placement Recruiter',
        deadline_at: new Date(deadline_at).toISOString(),
        action_url: action_url || null,
        status: 'UPCOMING',
      })
      .select()
      .single();

    if (deadlineError) {
      return NextResponse.json({ error: deadlineError.message }, { status: 400 });
    }

    // Schedule Reminders
    const remindersToInsert = calculateReminders(deadline_at, offsets).map((rem) => ({
      user_id: userId,
      deadline_id: deadline.id,
      scheduled_for: rem.scheduled_for,
      offset_hours: rem.offset_hours,
      status: 'PENDING' as const,
    }));

    if (remindersToInsert.length > 0) {
      await (supabaseAdmin.from('reminders') as any).insert(remindersToInsert);
    }

    return NextResponse.json({ deadline, scheduled_reminders: remindersToInsert.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create deadline' }, { status: 500 });
  }
}
