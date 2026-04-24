import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { session_id, player_id, attended, individual_notes } = await req.json();
  const { data, error } = await supabase.from('session_players').upsert({
    session_id, player_id, attended: attended ?? true, individual_notes: individual_notes || null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
