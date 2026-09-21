import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ApplicationStatusEnum } from '@/types/database.types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, notes, applied_at, assessment_date, interview_date } = body;

    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (status) updatePayload.status = status as ApplicationStatusEnum;
    if (notes !== undefined) updatePayload.notes = notes;
    if (applied_at !== undefined) updatePayload.applied_at = applied_at;
    if (assessment_date !== undefined) updatePayload.assessment_date = assessment_date;
    if (interview_date !== undefined) updatePayload.interview_date = interview_date;

    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('applications') as any)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ application: data, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();
    const { error } = await (supabase.from('applications') as any).delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete application' }, { status: 500 });
  }
}
