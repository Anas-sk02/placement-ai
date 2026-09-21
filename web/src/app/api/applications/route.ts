import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ApplicationStatusEnum } from '@/types/database.types';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ applications: [] });
    }

    const { data: apps, error } = await (supabase.from('applications') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ applications: apps || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { company_name, role_title, status = 'SAVED', opportunity_id, insight_id, notes } = body;

    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const { data: app, error } = await (supabase.from('applications') as any)
      .insert({
        user_id: userId,
        company_name,
        role_title,
        status: status as ApplicationStatusEnum,
        opportunity_id: opportunity_id || null,
        insight_id: insight_id || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ application: app, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save application' }, { status: 500 });
  }
}
