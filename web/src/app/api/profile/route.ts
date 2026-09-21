import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Fallback default mock profile if unauthenticated
      return NextResponse.json({
        profile: {
          user_id: 'guest',
          full_name: 'Student User',
          college_name: 'Engineering College',
          degree: 'B.Tech',
          branch: 'CSE',
          graduation_year: 2026,
          cgpa: 8.42,
          percentage: 86.5,
          active_backlogs: 0,
          history_backlogs: 0,
          skills: ['Java', 'Spring Boot', 'TypeScript', 'Next.js', 'PostgreSQL'],
        },
      });
    }

    const { data: profile, error } = await (supabase.from('student_profiles') as any)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const userId = user?.id || body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await (supabase.from('student_profiles') as any)
      .upsert(
        {
          user_id: userId,
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
