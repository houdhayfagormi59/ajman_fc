export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import PlayerForm from '@/components/PlayerForm';

export default async function NewPlayerPage() {
  const supabase = createClient();
  const { data } = await supabase.from('teams').select('*').order('name');

  return (
    <div className="max-w-3xl animate-fade-in-up">
      <h1 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>Add Player</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Create a new player profile</p>
      <div className="card p-6"><PlayerForm teams={data ?? []} /></div>
    </div>
  );
}
