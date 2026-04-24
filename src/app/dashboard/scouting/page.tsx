export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import { Plus, Target, Star, Filter, Search, TrendingUp, User } from 'lucide-react';
import type { Recruitment } from '@/lib/types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  interested: { label: 'Interested', color: 'pill-slate' },
  contacted: { label: 'Contacted', color: 'pill-blue' },
  trial: { label: 'Trial', color: 'pill-yellow' },
  signed: { label: 'Signed', color: 'pill-green' },
  rejected: { label: 'Rejected', color: 'pill-red' },
  not_interested: { label: 'Not Interested', color: 'pill-slate' },
};

const KANBAN_COLS = ['interested', 'contacted', 'trial', 'signed'];

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Not rated</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={11} className={s <= Math.round(rating / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
      ))}
      <span className="ml-1 text-xs font-bold text-brand-600">{rating.toFixed(1)}</span>
    </div>
  );
}

export default async function ScoutingPage() {
  const supabase = createClient();
  const { data } = await supabase.from('recruitment').select('*').order('created_at', { ascending: false });
  const players = (data ?? []) as Recruitment[];

  const byStatus = (status: string) => players.filter(p => p.status === status);
  const totalValue = players.reduce((s, p) => s + (p.scout_overall_rating ?? 0), 0);
  const avgRating = players.length > 0 ? (totalValue / players.filter(p => p.scout_overall_rating).length).toFixed(1) : '—';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-header">Scouting & Recruitment</h1>
          <p className="section-sub">Player database, pipeline & AI-powered scouting reports</p>
        </div>
        <Link href="/dashboard/scouting/new"><Button><Plus size={16} /> Scout Player</Button></Link>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KANBAN_COLS.map(status => {
          const conf = STATUS_CONFIG[status];
          const count = byStatus(status).length;
          return (
            <div key={status} className="card p-4 text-center gradient-brand-soft">
              <div className="text-2xl font-extrabold text-brand-600">{count}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>{conf.label}</div>
            </div>
          );
        })}
      </div>

      {players.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Target size={48} />}
            title="No scouted players"
            description="Start building your recruitment pipeline."
            action={<Link href="/dashboard/scouting/new"><Button><Plus size={16} /> Scout Player</Button></Link>}
          />
        </div>
      ) : (
        <>
          {/* Kanban Board */}
          <div>
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp size={15} className="text-brand-600" /> Recruitment Pipeline
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-x-auto">
              {KANBAN_COLS.map(status => {
                const conf = STATUS_CONFIG[status];
                const colPlayers = byStatus(status);
                return (
                  <div key={status} className="kanban-col min-w-[160px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{conf.label}</span>
                      <span className="text-xs font-bold text-brand-600">{colPlayers.length}</span>
                    </div>
                    {colPlayers.map(p => (
                      <Link key={p.id} href={`/dashboard/scouting/${p.id}`}
                        className="card p-2.5 block card-hover animate-slide-in">
                        <div className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                          {p.first_name} {p.last_name}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {p.position} · {p.age_group}
                        </div>
                        {p.scout_overall_rating && (
                          <div className="mt-1">
                            <RatingStars rating={p.scout_overall_rating} />
                          </div>
                        )}
                        {p.club_origin && (
                          <div className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                            📍 {p.club_origin}
                          </div>
                        )}
                      </Link>
                    ))}
                    {colPlayers.length === 0 && (
                      <div className="text-center py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>Empty</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full table */}
          <div className="card p-4">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <User size={15} className="text-brand-600" /> Full Scouting Database
            </h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Player</th><th>Position</th><th>Age Group</th>
                    <th>Club Origin</th><th>Status</th><th>Overall Rating</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="font-semibold">{p.first_name} {p.last_name}</div>
                        {p.nationality && <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.nationality}</div>}
                      </td>
                      <td><span className="pill-slate">{p.position || '—'}</span></td>
                      <td>{p.age_group || '—'}</td>
                      <td>{p.club_origin || '—'}</td>
                      <td><span className={STATUS_CONFIG[p.status]?.color || 'pill-slate'}>{STATUS_CONFIG[p.status]?.label || p.status}</span></td>
                      <td><RatingStars rating={p.scout_overall_rating} /></td>
                      <td>
                        <Link href={`/dashboard/scouting/${p.id}`}
                          className="text-xs font-semibold text-brand-600 hover:underline">View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signed players */}
          {byStatus('signed').length > 0 && (
            <div className="card p-4 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
              <h2 className="font-bold text-sm mb-2 text-emerald-700 dark:text-emerald-300">
                ✅ Signed Players ({byStatus('signed').length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {byStatus('signed').map(p => (
                  <Link key={p.id} href={`/dashboard/scouting/${p.id}`}
                    className="pill-green hover:opacity-80 transition">
                    {p.first_name} {p.last_name} · {p.position}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
