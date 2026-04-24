import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bucket = req.nextUrl.searchParams.get('bucket');
  const path = req.nextUrl.searchParams.get('path');

  if (!bucket || !path) {
    return NextResponse.json({ error: 'Missing bucket or path' }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, new Uint8Array(buffer), { upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
