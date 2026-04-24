'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Radar, Star, Target, TrendingUp } from 'lucide-react';

function RatingBar({ label, value }: { label: string; value: number | null }) {
  const pct = value ? (value / 10) * 100 : 0;
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f97316' : pct >= 30 ? '#eab308' : '#ef4444';
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 truncate flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-7 text-right font-bold flex-shrink-0" style={{ color: color || 'var(--text-secondary)' }}>{value ?? '—'}</span>
    </div>
  );
}

export default function PlayerAnalyticsPage() {
  const supabase = createClient();
  const [players, setPlayers] = useState<any[]>([]);
  const [evals, setEvals] = useState<any[]>([]);
  const [perfs, setPerfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [pR, eR, perfR] = await Promise.all([
        supabase.from('players').select('*').order('last_name'),
        supabase.from('evaluations').select('*').order('evaluation_date', { ascending: false }),
        supabase.from('performances').select('*'),
      ]);
      setPlayers(pR.data ?? []);
      setEvals(eR.data ?? []);
      setPerfs(perfR.data ?? []);
      setLoading(false);
    })();
  }, []);

  const playersWithEvals = players.filter(p => evals.some(e => e.player_id === p.id));
  const playersWithout = players.filter(p => !evals.some(e => e.player_id === p.id));

  const positionAverages = ['GK','DEF','MID','FWD'].map(pos => {
    const posP = players.filter(p => p.position === pos);
    const posE = evals.filter(e => posP.some(p => p.id === e.player_id));
    if (posE.length === 0) return null;
    const avg = (field: string) => {
      const vals = posE.map((e: any) => e[field]).filter(Boolean);
      return vals.length ? (vals.reduce((s: number, v: number) => s + v, 0) / vals.length).toFixed(1) : '—';
    };
    return { pos, count: posP.length, tech: avg('tech_passing'), tac: avg('tac_positioning'), phy: avg('phy_speed'), men: avg('men_confidence') };
  }).filter(Boolean);

  if (loading) return (
    <div className="space-y-4">
      <div className="section-header">Player KPI Tracker</div>
      <div className="grid md:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="card h-48 animate-pulse" style={{ background: 'var(--bg-soft)' }} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="section-header">Player KPI Tracker</h1>
        <p className="section-sub">Individual performance analytics and evaluation scores</p>
      </div>

      {/* Position averages */}
      {positionAverages.length > 0 && (
        <div className="card p-4">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={15} className="text-brand-600" /> Squad Averages by Position
          </h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Position</th><th>Players</th><th>Technical</th><th>Tactical</th><th>Physical</th><th>Mental</th></tr>
              </thead>
              <tbody>
                {positionAverages.map(pa => (
                  <tr key={pa!.pos}>
                    <td><span className="pill-orange">{pa!.pos}</span></td>
                    <td>{pa!.count}</td>
                    {[pa!.tech, pa!.tac, pa!.phy, pa!.men].map((val, i) => (
                      <td key={i}>
                        <div className="flex items-center gap-1.5">
                          <div className="progress-bar w-12">
                            <div className="progress-fill" style={{ width: `${parseFloat(val as string) * 10}%` }} />
                          </div>
                          <span className="text-xs font-bold text-brand-600">{val}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center gradient-brand-soft">
          <div className="text-2xl font-extrabold text-brand-600">{players.length}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total players</div>
        </div>
        <div className="card p-3 text-center gradient-brand-soft">
          <div className="text-2xl font-extrabold text-emerald-600">{playersWithEvals.length}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Evaluated</div>
        </div>
        <div className="card p-3 text-center gradient-brand-soft">
          <div className="text-2xl font-extrabold text-yellow-600">{playersWithout.length}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pending eval</div>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="card p-8 text-center">
          <Radar size={40} className="text-brand-200 mx-auto mb-3" />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No players yet</p>
          <Link href="/dashboard/players" className="text-brand-600 text-sm hover:underline">Add players →</Link>
        </div>
      ) : (
        <>
          {playersWithEvals.length > 0 && (
            <div>
              <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Star size={14} className="text-brand-600" /> Evaluated Players ({playersWithEvals.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playersWithEvals.map(p => {
                  const latestEval = evals.find(e => e.player_id === p.id);
                  const pPerfs = perfs.filter(perf => perf.player_id === p.id);
                  const scoreVals = [latestEval?.tech_first_touch, latestEval?.tech_passing, latestEval?.tech_shooting, latestEval?.tech_dribbling, latestEval?.tac_positioning, latestEval?.tac_decision_making, latestEval?.tac_game_reading, latestEval?.phy_speed, latestEval?.phy_strength, latestEval?.phy_endurance, latestEval?.men_concentration, latestEval?.men_confidence, latestEval?.men_teamwork].filter(Boolean) as number[];
                  const ovr = scoreVals.length ? Math.round((scoreVals.reduce((s,v) => s+v,0) / (scoreVals.length * 10)) * 100) : 0;
                  const ovrColor = ovr >= 75 ? '#10b981' : ovr >= 60 ? '#f97316' : ovr >= 45 ? '#eab308' : '#ef4444';
                  return (
                    <Link key={p.id} href={`/dashboard/reports/${p.id}`} className="card p-4 card-hover block">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{p.first_name} {p.last_name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="pill-orange text-[10px]">{p.position}</span>
                            {p.age_group && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.age_group}</span>}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-extrabold" style={{ color: ovrColor }}>{ovr}</div>
                          <div className="text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>OVR</div>
                        </div>
                      </div>
                      <div className="flex gap-3 mb-3 text-center">
                        {[
                          { label: 'G', val: pPerfs.reduce((s, pf) => s+(pf.goals||0),0), color: 'text-emerald-600' },
                          { label: 'A', val: pPerfs.reduce((s, pf) => s+(pf.assists||0),0), color: 'text-blue-600' },
                          { label: 'M', val: pPerfs.length, color: 'text-brand-600' },
                        ].map(({ label, val, color }) => (
                          <div key={label}><div className={`font-bold text-sm ${color}`}>{val}</div><div className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{label}</div></div>
                        ))}
                      </div>
                      {latestEval && (
                        <div className="space-y-1.5">
                          <RatingBar label="Technical" value={Math.round(([latestEval.tech_first_touch, latestEval.tech_passing, latestEval.tech_shooting, latestEval.tech_dribbling].filter(Boolean) as number[]).reduce((s,v)=>s+v,0)/4)} />
                          <RatingBar label="Tactical" value={Math.round(([latestEval.tac_positioning, latestEval.tac_decision_making, latestEval.tac_game_reading].filter(Boolean) as number[]).reduce((s,v)=>s+v,0)/3)} />
                          <RatingBar label="Physical" value={Math.round(([latestEval.phy_speed, latestEval.phy_strength, latestEval.phy_endurance].filter(Boolean) as number[]).reduce((s,v)=>s+v,0)/3)} />
                          <RatingBar label="Mental" value={Math.round(([latestEval.men_concentration, latestEval.men_confidence, latestEval.men_teamwork].filter(Boolean) as number[]).reduce((s,v)=>s+v,0)/3)} />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {playersWithout.length > 0 && (
            <div>
              <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Target size={14} className="text-yellow-500" /> Pending Evaluation ({playersWithout.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {playersWithout.map(p => (
                  <Link key={p.id} href={`/dashboard/reports/${p.id}`}
                    className="card p-3 card-hover flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{p.first_name} {p.last_name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.position} · {p.age_group}</div>
                    </div>
                    <span className="pill-yellow text-[10px]">Needs eval →</span>
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
