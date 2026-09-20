import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DeadlineStatusEnum } from '@/types/database.types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const status = body.status as DeadlineStatusEnum;

    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('deadlines') as any)
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ deadline: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update deadline' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();
    const { error } = await (supabase.from('deadlines') as any).delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete deadline' }, { status: 500 });
  }
}
