'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import PhotoUpload from '@/components/PhotoUpload';
import type { Recruitment, AgeGroup } from '@/lib/types';

const ageGroups: AgeGroup[] = ['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','U20','U21','U22','U23','Senior'];
const positions = ['GK', 'DEF', 'MID', 'FWD'] as const;
const statuses = ['interested', 'contacted', 'trial', 'signed', 'rejected', 'not_interested'] as const;

export default function RecruitmentForm({ initial }: { initial?: Recruitment }) {
  const router = useRouter();
  const [data, setData] = useState({
    first_name: initial?.first_name ?? '',
    last_name: initial?.last_name ?? '',
    age_group: initial?.age_group ?? '' as AgeGroup | '',
    position: initial?.position ?? '' as typeof positions[number] | '',
    phone_number: initial?.phone_number ?? '',
    whatsapp_number: initial?.whatsapp_number ?? '',
    email: initial?.email ?? '',
    club_origin: initial?.club_origin ?? '',
    status: initial?.status ?? 'interested',
    contacted_date: initial?.contacted_date ?? '',
    trial_date: initial?.trial_date ?? '',
    notes: initial?.notes ?? '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let photo_url = initial?.photo_url ?? null;
    let photo_bucket_path = initial?.photo_bucket_path ?? null;

    if (file) {
      const bucket = 'recruitment_photos';
      const path = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await (async () => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`/api/upload?bucket=${bucket}&path=${path}`, {
          method: 'POST',
          body: formData,
        });
        return { error: !res.ok ? 'Upload failed' : null };
      })();
      if (uploadError) { setLoading(false); return setError('Photo upload failed'); }
      photo_bucket_path = path;
      photo_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    }

    const url = initial ? `/api/recruitment/${initial.id}` : '/api/recruitment';
    const method = initial ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, photo_url, photo_bucket_path }),
    });

    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return setError(j.error || 'Failed');
    }
    router.push('/dashboard/scouting');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="First name" required value={data.first_name} onChange={(e) => setData({ ...data, first_name: e.target.value })} />
        <Input label="Last name" required value={data.last_name} onChange={(e) => setData({ ...data, last_name: e.target.value })} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Select label="Age group" value={data.age_group} onChange={(e) => setData({ ...data, age_group: e.target.value as AgeGroup })}>
          <option value="">Select age group</option>
          {ageGroups.map((ag) => (
            <option key={ag} value={ag}>{ag}</option>
          ))}
        </Select>
        <Select label="Position" value={data.position} onChange={(e) => setData({ ...data, position: e.target.value as any })}>
          <option value="">Select position</option>
          {positions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
        <Input label="Club origin" value={data.club_origin} onChange={(e) => setData({ ...data, club_origin: e.target.value })} placeholder="Current club" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Phone number" value={data.phone_number} onChange={(e) => setData({ ...data, phone_number: e.target.value })} />
        <Input label="WhatsApp number" value={data.whatsapp_number} onChange={(e) => setData({ ...data, whatsapp_number: e.target.value })} />
      </div>

      <Input label="Email" type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />

      <div className="grid md:grid-cols-2 gap-4">
        <Select label="Status" value={data.status} onChange={(e) => setData({ ...data, status: e.target.value as any })}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </Select>
        <Input label="Contacted date" type="date" value={data.contacted_date} onChange={(e) => setData({ ...data, contacted_date: e.target.value })} />
      </div>

      <Input label="Trial date" type="date" value={data.trial_date} onChange={(e) => setData({ ...data, trial_date: e.target.value })} />

      <PhotoUpload onFile={setFile} preview={initial?.photo_url || undefined} />

      <div className="flex flex-col gap-1.5">
        <label className="label">Notes</label>
        <textarea className="input-base min-h-[100px]" value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} placeholder="Scout notes, strengths, weaknesses..." />
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{initial ? 'Save changes' : 'Add prospect'}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
