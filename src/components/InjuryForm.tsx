'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import type { Player } from '@/lib/types';

export default function InjuryForm({ players, onDone }: { players: Pick<Player, 'id' | 'first_name' | 'last_name'>[]; onDone?: () => void }) {
  const router = useRouter();
  const [data, setData] = useState({
    player_id: players[0]?.id ?? '',
    injury_type: '', body_part: '',
    severity: 'moderate' as 'minor' | 'moderate' | 'severe',
    injury_date: new Date().toISOString().split('T')[0],
    expected_recovery_days: 14,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/injuries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return setError(j.error || 'Failed to save');
    }
    onDone?.();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Select label="Player" required value={data.player_id} onChange={(e) => setData({ ...data, player_id: e.target.value })}>
        {players.map((p) => (
          <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
        ))}
      </Select>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Injury type" required placeholder="e.g. Muscle strain" value={data.injury_type} onChange={(e) => setData({ ...data, injury_type: e.target.value })} />
        <Select label="Body part" required value={data.body_part} onChange={(e) => setData({ ...data, body_part: e.target.value })}>
          <option value="">Select…</option>
          {['Left Ankle','Right Ankle','Left Knee','Right Knee','Left Thigh','Right Thigh','Left Calf','Right Calf','Back','Shoulder','Head','Chest','Hip','Groin'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Select label="Severity" value={data.severity} onChange={(e) => setData({ ...data, severity: e.target.value as any })}>
          <option value="minor">Minor</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </Select>
        <Input label="Injury date" type="date" required value={data.injury_date} onChange={(e) => setData({ ...data, injury_date: e.target.value })} />
        <Input label="Expected recovery (days)" type="number" min={1} required value={data.expected_recovery_days} onChange={(e) => setData({ ...data, expected_recovery_days: Number(e.target.value) })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="label">Notes</label>
        <textarea className="input-base min-h-[80px]" value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} />
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
      <Button type="submit" loading={loading}>Record injury</Button>
    </form>
  );
}
