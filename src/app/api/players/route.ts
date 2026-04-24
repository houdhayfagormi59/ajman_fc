import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('players').select('*').order('last_name');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase.from('players').insert({
    coach_id: user.id,
    team_id: body.team_id || null,
    first_name: body.first_name,
    last_name: body.last_name,
    date_of_birth: body.date_of_birth,
    position: body.position,
    age_group: body.age_group || null,
    jersey_number: body.jersey_number,
    height_cm: body.height_cm,
    weight_kg: body.weight_kg,
    nationality: body.nationality || null,
    whatsapp_number: body.whatsapp_number || null,
    photo_url: body.photo_url || null,
    photo_bucket_path: body.photo_bucket_path || null,
    status: body.status || 'fit',
    notes: body.notes || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
