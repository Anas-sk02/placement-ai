import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { data: profile, error } = await (supabase.from('student_profiles') as any)
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!profile) {
      const meta = user.user_metadata || {};
      const newProfile = {
        user_id: user.id,
        full_name: meta.full_name || user.email?.split('@')[0] || 'Student',
        college_name: meta.college_name || 'Engineering College',
        degree: meta.degree || 'B.Tech',
        branch: meta.branch || 'CSE',
        graduation_year: meta.graduation_year || 2026,
        cgpa: 8.0,
        percentage: 80.0,
        active_backlogs: 0,
        history_backlogs: 0,
        skills: ['Java', 'Python', 'Web Development'],
        updated_at: new Date().toISOString(),
      };

      await (supabase.from('student_profiles') as any).upsert(newProfile, { onConflict: 'user_id' });
      return NextResponse.json({ profile: newProfile, authenticated: true });
    }

    return NextResponse.json({ profile, authenticated: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await (supabase.from('student_profiles') as any)
      .upsert(
        {
          user_id: user.id,
          full_name: body.full_name,
          college_name: body.college_name,
          degree: body.degree,
          branch: body.branch,
          graduation_year: body.graduation_year,
          cgpa: body.cgpa,
          percentage: body.percentage,
          active_backlogs: body.active_backlogs,
          history_backlogs: body.history_backlogs,
          skills: body.skills || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile: data, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
  }
}
