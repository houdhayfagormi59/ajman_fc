import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const body = await req.json();
  const allowed = [
    'first_name','last_name','age_group','position','phone_number','whatsapp_number',
    'email','club_origin','notes','photo_url','photo_bucket_path','status',
    'contacted_date','trial_date',
    'scout_tech_ball_control','scout_tech_passing','scout_tech_shooting','scout_tech_dribbling',
    'scout_phy_speed','scout_phy_strength','scout_phy_endurance','scout_phy_agility',
    'scout_tac_positioning','scout_tac_awareness','scout_tac_decision',
    'scout_psy_confidence','scout_psy_leadership','scout_psy_composure','scout_psy_work_ethic',
    'scout_overall_rating','scout_recommendation',
  ];
  const payload: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) payload[k] = body[k];

  const { data, error } = await supabase.from('recruitment').update(payload).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { error } = await supabase.from('recruitment').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
