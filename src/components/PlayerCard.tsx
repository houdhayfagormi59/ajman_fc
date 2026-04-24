import Link from 'next/link';
import Badge from '@/components/Badge';
import type { Player } from '@/lib/types';
import { ageFromDOB } from '@/lib/utils';

export default function PlayerCard({ p }: { p: Player }) {
  return (
    <Link href={`/dashboard/players/${p.id}`} className="card p-4 card-hover flex gap-3 items-center group">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center text-xl overflow-hidden shrink-0 border" style={{ borderColor: 'var(--border)' }}>
        {p.photo_url ? <img src={p.photo_url} alt={p.first_name} className="w-full h-full object-cover" /> : '⚽'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate group-hover:text-brand-600 transition" style={{ color: 'var(--text-primary)' }}>{p.first_name} {p.last_name}</div>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {p.position} · {p.age_group || 'N/A'} · Age {ageFromDOB(p.date_of_birth)}
          {p.jersey_number ? ` · #${p.jersey_number}` : ''}
        </div>
        <div className="mt-1"><Badge variant={p.status}>{p.status}</Badge></div>
      </div>
    </Link>
  );
}
