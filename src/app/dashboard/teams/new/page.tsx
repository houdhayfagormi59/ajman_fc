'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import type { AgeGroup } from '@/lib/types';

const ageGroups: AgeGroup[] = ['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','U20','U21','U22','U23','Senior'];

export default function NewTeamPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: '', age_group: '' as AgeGroup | '', division: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!res.ok) return setError('Failed to create team');
    router.push('/dashboard/teams');
    router.refresh();
  }

  return (
    <div className="max-w-2xl animate-fade-in-up">
      <h1 className="text-3xl font-extrabold text-brand-800 mb-1">New team</h1>
      <p className="text-sm text-slate-600 mb-5">Create a new squad or age group</p>
      <div className="card p-6 space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Team name"
            required
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="e.g. U13 Boys, Senior A, etc."
          />
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Age group"
              value={data.age_group}
              onChange={(e) => setData({ ...data, age_group: e.target.value as AgeGroup })}
            >
              <option value="">Select age group</option>
              {ageGroups.map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </Select>
            <Input
              label="Division"
              value={data.division}
              onChange={(e) => setData({ ...data, division: e.target.value })}
              placeholder="e.g. Premier, First, etc."
            />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Create team</Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
