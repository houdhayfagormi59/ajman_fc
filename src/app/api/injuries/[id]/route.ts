import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const body = await req.json();
  const allowed = ['status', 'actual_return_date', 'notes'];
  const payload: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) payload[k] = body[k];

  const { data: injury, error } = await supabase.from('injuries').update(payload).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (payload.status === 'recovered' && injury) {
    const { data: active } = await supabase
      .from('injuries')
      .select('id')
      .eq('player_id', injury.player_id)
      .eq('status', 'active');
    if (!active || active.length === 0) {
      await supabase.from('players').update({ status: 'fit' }).eq('id', injury.player_id);
    }
  }

  return NextResponse.json(injury);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { error } = await supabase.from('injuries').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
