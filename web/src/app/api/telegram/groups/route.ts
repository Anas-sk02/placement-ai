import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Query discovered groups using admin to avoid any RLS limitation
    const { data: groups, error } = await supabaseAdmin
      .from('telegram_groups')
      .select(`
        id,
        telegram_id,
        title,
        username,
        chat_type,
        total_members,
        last_message_at,
        last_discovered_at
      `)
      .order('last_discovered_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ groups: groups || [] });
    }

    // Query user's monitoring preferences
    const { data: monitored } = await (supabaseAdmin.from('user_monitored_groups') as any)
      .select('group_id, is_monitored')
      .eq('user_id', user.id);

    const monitoredMap = new Map<string, boolean>();
    (monitored || []).forEach((m: any) => {
      monitoredMap.set(m.group_id, m.is_monitored);
    });

    const enrichedGroups = (groups || []).map((g: any) => ({
      ...g,
      is_monitored: monitoredMap.has(g.id) ? monitoredMap.get(g.id) : true,
    }));

    return NextResponse.json({ groups: enrichedGroups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { title, username, chat_type = 'CHANNEL', total_members } = body;

    if (!title && !username) {
      return NextResponse.json({ error: 'Title or username is required' }, { status: 400 });
    }

    const cleanUsername = (username || '')
      .replace(/^@/, '')
      .replace(/^https?:\/\/t\.me\//, '')
      .trim();

    // Generate a deterministic or randomized negative 64-bit Telegram ID
    let tgId = -1000000000000 - Math.floor(Math.random() * 899999999);
    if (cleanUsername) {
      let hash = 0;
      for (let i = 0; i < cleanUsername.length; i++) {
        hash = (hash << 5) - hash + cleanUsername.charCodeAt(i);
        hash |= 0;
      }
      tgId = -1000000000000 - Math.abs(hash);
    }

    const groupTitle = title ? title.trim() : `@${cleanUsername}`;

    // Upsert into telegram_groups
    const { data: group, error: groupErr } = await (supabaseAdmin.from('telegram_groups') as any)
      .upsert(
        {
          telegram_id: tgId,
          title: groupTitle,
          username: cleanUsername || null,
          chat_type: chat_type,
          total_members: total_members || Math.floor(Math.random() * 700) + 300,
          last_message_at: new Date().toISOString(),
          last_discovered_at: new Date().toISOString(),
        },
        { onConflict: 'telegram_id' }
      )
      .select()
      .single();

    if (groupErr) {
      return NextResponse.json({ error: groupErr.message }, { status: 400 });
    }

    // Attach to user_monitored_groups if user is logged in
    if (user) {
      await (supabaseAdmin.from('user_monitored_groups') as any).upsert(
        {
          user_id: user.id,
          group_id: group.id,
          is_monitored: true,
          auto_analyze: true,
        },
        { onConflict: 'user_id,group_id' }
      );
    }

    return NextResponse.json({
      success: true,
      group: {
        ...group,
        is_monitored: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add Telegram channel' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('telegram_groups').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete channel' }, { status: 500 });
  }
}

