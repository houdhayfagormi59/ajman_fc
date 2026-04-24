import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('performances').select('*').order('match_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase.from('performances').insert({
    player_id: body.player_id,
    coach_id: user.id,
    match_date: body.match_date,
    opponent: body.opponent,
    minutes_played: Number(body.minutes_played) || 0,
    goals: Number(body.goals) || 0,
    assists: Number(body.assists) || 0,
    passes_completed: Number(body.passes_completed) || 0,
    passes_attempted: Number(body.passes_attempted) || 0,
    tackles: Number(body.tackles) || 0,
    shots: Number(body.shots) || 0,
    shots_on_target: Number(body.shots_on_target) || 0,
    rating: body.rating != null ? Number(body.rating) : null,
    notes: body.notes || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
