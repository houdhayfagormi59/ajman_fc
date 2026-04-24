'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import PhotoUpload from '@/components/PhotoUpload';
import type { Player, AgeGroup } from '@/lib/types';

const ageGroups: AgeGroup[] = ['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','U20','U21','U22','U23','Senior'];

export default function PlayerForm({ initial, teams }: { initial?: Player; teams?: any[] }) {
  const router = useRouter();
  const [data, setData] = useState({
    first_name: initial?.first_name ?? '', last_name: initial?.last_name ?? '',
    date_of_birth: initial?.date_of_birth ?? '', position: initial?.position ?? 'MID',
    team_id: initial?.team_id ?? '', age_group: initial?.age_group ?? 'U13',
    jersey_number: initial?.jersey_number ?? '', height_cm: initial?.height_cm ?? '',
    weight_kg: initial?.weight_kg ?? '', nationality: initial?.nationality ?? '',
    whatsapp_number: initial?.whatsapp_number ?? '', status: initial?.status ?? 'fit',
    notes: initial?.notes ?? '', photo_url: initial?.photo_url ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null);

    const url = initial ? `/api/players/${initial.id}` : '/api/players';
    const method = initial ? 'PATCH' : 'POST';

    const payload = {
      ...data,
      team_id: data.team_id || null,
      jersey_number: data.jersey_number ? Number(data.jersey_number) : null,
      height_cm: data.height_cm ? Number(data.height_cm) : null,
      weight_kg: data.weight_kg ? Number(data.weight_kg) : null,
      nationality: data.nationality || null,
      whatsapp_number: data.whatsapp_number || null,
      photo_url: data.photo_url || null,
      notes: data.notes || null,
    };

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setLoading(false);
    if (!res.ok) { const j = await res.json().catch(() => ({})); return setError(j.error || 'Failed'); }
    const saved = await res.json();
    router.push(`/dashboard/players/${initial ? initial.id : saved.id}`); router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PhotoUpload
        label="Player Photo"
        preview={data.photo_url || undefined}
        onFile={() => {}}
        onBase64={(b64) => setData((d) => ({ ...d, photo_url: b64 }))}
        onClear={() => setData((d) => ({ ...d, photo_url: '' }))}
      />
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="First name" required value={data.first_name} onChange={(e) => setData({ ...data, first_name: e.target.value })} />
        <Input label="Last name" required value={data.last_name} onChange={(e) => setData({ ...data, last_name: e.target.value })} />
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <Input label="Date of birth" type="date" required value={data.date_of_birth} onChange={(e) => setData({ ...data, date_of_birth: e.target.value })} />
        <Select label="Position" required value={data.position} onChange={(e) => setData({ ...data, position: e.target.value })}>
          <option value="GK">Goalkeeper</option><option value="DEF">Defender</option>
          <option value="MID">Midfielder</option><option value="FWD">Forward</option>
        </Select>
        <Select label="Age group" value={data.age_group} onChange={(e) => setData({ ...data, age_group: e.target.value })}>
          <option value="">Select</option>
          {ageGroups.map((ag) => <option key={ag} value={ag}>{ag}</option>)}
        </Select>
        {teams && <Select label="Team" value={data.team_id} onChange={(e) => setData({ ...data, team_id: e.target.value })}>
          <option value="">Select team</option>
          {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>}
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <Input label="Jersey #" type="number" min={1} max={99} value={data.jersey_number} onChange={(e) => setData({ ...data, jersey_number: e.target.value })} />
        <Input label="Height (cm)" type="number" value={data.height_cm} onChange={(e) => setData({ ...data, height_cm: e.target.value })} />
        <Input label="Weight (kg)" type="number" value={data.weight_kg} onChange={(e) => setData({ ...data, weight_kg: e.target.value })} />
        <Input label="Nationality" value={data.nationality} onChange={(e) => setData({ ...data, nationality: e.target.value })} />
      </div>
      <Input label="WhatsApp" value={data.whatsapp_number} onChange={(e) => setData({ ...data, whatsapp_number: e.target.value })} placeholder="+971..." />
      <Select label="Status" value={data.status} onChange={(e) => setData({ ...data, status: e.target.value })}>
        <option value="fit">Fit</option><option value="injured">Injured</option>
        <option value="recovering">Recovering</option><option value="inactive">Inactive</option>
      </Select>
      <div className="flex flex-col gap-1.5">
        <label className="label">Notes</label>
        <textarea className="input-base min-h-[80px]" value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} />
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{initial ? 'Save changes' : 'Create player'}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
