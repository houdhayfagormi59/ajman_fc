import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addDays } from '@/lib/utils';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('injuries').select('*, player:players(first_name,last_name)').order('injury_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const expected_return_date = addDays(body.injury_date, Number(body.expected_recovery_days));

  const { data, error } = await supabase.from('injuries').insert({
    player_id: body.player_id,
    coach_id: user.id,
    injury_type: body.injury_type,
    body_part: body.body_part,
    severity: body.severity,
    injury_date: body.injury_date,
    expected_recovery_days: Number(body.expected_recovery_days),
    expected_return_date,
    notes: body.notes || null,
    status: 'active',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from('players').update({ status: 'injured' }).eq('id', body.player_id);

  return NextResponse.json(data);
}
