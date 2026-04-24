'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import type { Player } from '@/lib/types';

export default function PerformanceForm({ players, onDone }: { players: Pick<Player, 'id' | 'first_name' | 'last_name'>[]; onDone?: () => void }) {
  const router = useRouter();
  const [data, setData] = useState({
    player_id: players[0]?.id ?? '',
    match_date: new Date().toISOString().split('T')[0],
    opponent: '',
    minutes_played: 90,
    goals: 0, assists: 0,
    passes_completed: 0, passes_attempted: 0,
    tackles: 0, shots: 0, shots_on_target: 0,
    rating: 7, notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch('/api/performances', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    setLoading(false);
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error || 'Failed');
    onDone?.();
    router.refresh();
  }

  const nums = ['minutes_played','goals','assists','passes_completed','passes_attempted','tackles','shots','shots_on_target'];
  const upd = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData({ ...data, [k]: nums.includes(k as string) ? Number(e.target.value) : k === 'rating' ? Number(e.target.value) : e.target.value });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Select label="Player" required value={data.player_id} onChange={(e) => setData({ ...data, player_id: e.target.value })}>
        {players.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
      </Select>
      <div className="grid md:grid-cols-3 gap-4">
        <Input label="Match date" type="date" required value={data.match_date} onChange={upd('match_date') as any} />
        <Input label="Opponent" required value={data.opponent} onChange={upd('opponent') as any} placeholder="e.g. Al Ain FC" />
        <Input label="Minutes played" type="number" min={0} max={120} value={data.minutes_played} onChange={upd('minutes_played') as any} />
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <Input label="Goals" type="number" min={0} value={data.goals} onChange={upd('goals') as any} />
        <Input label="Assists" type="number" min={0} value={data.assists} onChange={upd('assists') as any} />
        <Input label="Passes completed" type="number" min={0} value={data.passes_completed} onChange={upd('passes_completed') as any} />
        <Input label="Passes attempted" type="number" min={0} value={data.passes_attempted} onChange={upd('passes_attempted') as any} />
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <Input label="Tackles" type="number" min={0} value={data.tackles} onChange={upd('tackles') as any} />
        <Input label="Shots" type="number" min={0} value={data.shots} onChange={upd('shots') as any} />
        <Input label="Shots on target" type="number" min={0} value={data.shots_on_target} onChange={upd('shots_on_target') as any} />
        <Input label="Rating (0-10)" type="number" min={0} max={10} step={0.1} value={data.rating} onChange={upd('rating') as any} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="label">Notes</label>
        <textarea className="input-base min-h-[80px]" value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} />
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
      <Button type="submit" loading={loading}>Save performance</Button>
    </form>
  );
}
