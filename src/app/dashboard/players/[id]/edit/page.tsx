export const dynamic = "force-dynamic";
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PlayerForm from '@/components/PlayerForm';
import type { Player } from '@/lib/types';

export default async function EditPlayer({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.from('players').select('*').eq('id', params.id).single();
  if (error || !data) notFound();
  const player = data as Player;

  return (
    <div className="max-w-3xl animate-fade-in-up">
      <h1 className="text-3xl font-extrabold text-brand-800 mb-1">Edit player</h1>
      <p className="text-sm text-slate-600 mb-5">{player.first_name} {player.last_name}</p>
      <div className="card p-6"><PlayerForm initial={player} /></div>
    </div>
  );
}
