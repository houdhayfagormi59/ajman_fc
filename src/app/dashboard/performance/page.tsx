export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { BarChart3, TrendingUp, Users, Star, Zap, Target } from 'lucide-react';
import PerformanceChart from '@/components/PerformanceChart';

export default async function PerformancePage() {
  const supabase = createClient();
  const [perfR, playersR, teamsR] = await Promise.all([
    supabase.from('performances')
      .select('*, players(first_name, last_name, position, team_id)')
      .order('match_date', { ascending: false })
      .limit(100),
    supabase.from('players').select('id,first_name,last_name,position,team_id'),
    supabase.from('teams').select('id,name'),
  ]);

  const perfs = perfR.data ?? [];
  const players = playersR.data ?? [];
  const teams = teamsR.data ?? [];

  // Aggregate by player
  const playerStats = players.map(p => {
    const pPerfs = perfs.filter(perf => perf.player_id === p.id);
    if (pPerfs.length === 0) return null;
    const avgRating = pPerfs.reduce((s, perf) => s + (perf.rating ?? 0), 0) / pPerfs.length;
    const totalGoals = pPerfs.reduce((s, perf) => s + (perf.goals ?? 0), 0);
    const totalAssists = pPerfs.reduce((s, perf) => s + (perf.assists ?? 0), 0);
    const totalMinutes = pPerfs.reduce((s, perf) => s + (perf.minutes_played ?? 0), 0);
    const passAcc = pPerfs.filter(perf => perf.passes_attempted > 0).length > 0
      ? Math.round(pPerfs.reduce((s, perf) => s + (perf.passes_completed / Math.max(perf.passes_attempted, 1)), 0) / pPerfs.filter(perf => perf.passes_attempted > 0).length * 100)
      : null;
    return {
      player: p, matches: pPerfs.length, avgRating: parseFloat(avgRating.toFixed(1)),
      totalGoals, totalAssists, totalMinutes, passAcc,
    };
  }).filter(Boolean).sort((a, b) => (b!.avgRating ?? 0) - (a!.avgRating ?? 0));

  // Team averages
  const teamPerfs = teams.map(t => {
    const tPerfs = perfs.filter(perf => {
      const player = players.find(p => p.id === perf.player_id);
      return player?.team_id === t.id;
    });
    if (tPerfs.length === 0) return null;
    return {
      team: t,
      avgRating: parseFloat((tPerfs.reduce((s, p) => s + (p.rating ?? 0), 0) / tPerfs.length).toFixed(1)),
      totalGoals: tPerfs.reduce((s, p) => s + (p.goals ?? 0), 0),
      matches: new Set(tPerfs.map(p => p.match_date)).size,
    };
  }).filter(Boolean);

  // Top performers
  const topScorers = [...playerStats].sort((a, b) => (b!.totalGoals ?? 0) - (a!.totalGoals ?? 0)).slice(0, 5);
  const topRated = playerStats.slice(0, 5);

  // Chart data — last 10 matches
  const matchDates = [...new Set(perfs.map(p => p.match_date))].sort().slice(-10);
  const chartData = matchDates.map(date => {
    const dayPerfs = perfs.filter(p => p.match_date === date);
    const avg = dayPerfs.length ? dayPerfs.reduce((s, p) => s + (p.rating ?? 0), 0) / dayPerfs.length : 0;
    return { date: date.slice(5), rating: parseFloat(avg.toFixed(1)), count: dayPerfs.length };
  });

  function RatingBar({ rating }: { rating: number }) {
    return (
      <div className="flex items-center gap-2">
        <div className="progress-bar flex-1" style={{ width: 60 }}>
          <div className="progress-fill" style={{ width: `${(rating / 10) * 100}%` }} />
        </div>
        <span className="text-xs font-bold text-brand-600 w-6">{rating}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-header">Performance Hub</h1>
          <p className="section-sub">Match statistics, player ratings & team analytics</p>
        </div>
        <Link href="/dashboard/player-analytics"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-semibold shadow-glow-orange hover:opacity-90 transition">
          <Zap size={15} /> Player KPI Tracker
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 gradient-brand-soft text-center">
          <div className="text-2xl font-extrabold text-brand-600">{perfs.length}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Performance records</div>
        </div>
        <div className="card p-4 gradient-brand-soft text-center">
          <div className="text-2xl font-extrabold text-brand-600">
            {perfs.length ? (perfs.reduce((s, p) => s + (p.rating ?? 0), 0) / perfs.length).toFixed(1) : '—'}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Overall avg rating</div>
        </div>
        <div className="card p-4 gradient-brand-soft text-center">
          <div className="text-2xl font-extrabold text-brand-600">{perfs.reduce((s, p) => s + (p.goals ?? 0), 0)}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total goals</div>
        </div>
        <div className="card p-4 gradient-brand-soft text-center">
          <div className="text-2xl font-extrabold text-brand-600">{perfs.reduce((s, p) => s + (p.assists ?? 0), 0)}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total assists</div>
        </div>
      </div>

      {/* Team Performance */}
      {teamPerfs.length > 0 && (
        <div className="card p-4">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users size={15} className="text-brand-600" /> Team Performance Breakdown
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamPerfs.map((tp) => (
              <div key={tp!.team.id} className="card p-3 gradient-brand-soft">
                <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{tp!.team.name}</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-center">
                    <div className="text-xl font-extrabold text-brand-600">{tp!.avgRating}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-extrabold text-emerald-600">{tp!.totalGoals}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Goals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-extrabold text-blue-600">{tp!.matches}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Matches</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Trend Chart */}
      {chartData.length > 0 && (
        <div className="card p-4">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={15} className="text-brand-600" /> Squad Average Rating Trend
          </h2>
          <PerformanceChart data={chartData} />
        </div>
      )}

      {/* Top performers tables */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Rated */}
        <div className="card p-4">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Star size={15} className="text-brand-600" /> Top Rated Players
          </h2>
          {topRated.length === 0
            ? <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No data yet.</p>
            : (
              <div className="space-y-2">
                {topRated.map((ps, i) => (
                  <Link key={ps!.player.id} href={`/dashboard/players/${ps!.player.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-700 transition">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-600' : 'bg-slate-300'
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {ps!.player.first_name} {ps!.player.last_name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ps!.player.position} · {ps!.matches} matches</div>
                    </div>
                    <RatingBar rating={ps!.avgRating} />
                  </Link>
                ))}
              </div>
            )}
        </div>

        {/* Top Scorers */}
        <div className="card p-4">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Target size={15} className="text-brand-600" /> Top Goal Contributions
          </h2>
          {topScorers.length === 0
            ? <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No data yet.</p>
            : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Player</th><th>G</th><th>A</th><th>G+A</th><th>Mins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topScorers.map((ps, i) => (
                      <tr key={ps!.player.id}>
                        <td className="font-bold text-brand-600">{i + 1}</td>
                        <td>
                          <Link href={`/dashboard/players/${ps!.player.id}`}
                            className="font-semibold hover:text-brand-600">
                            {ps!.player.first_name} {ps!.player.last_name}
                          </Link>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ps!.player.position}</div>
                        </td>
                        <td className="font-bold text-emerald-600">{ps!.totalGoals}</td>
                        <td className="font-bold text-blue-600">{ps!.totalAssists}</td>
                        <td className="font-bold text-orange-600">{ps!.totalGoals + ps!.totalAssists}</td>
                        <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ps!.totalMinutes}'</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

      {/* Full player performance table */}
      {playerStats.length > 0 && (
        <div className="card p-4">
          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Full Squad Performance Table</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Player</th><th>Pos</th><th>Matches</th><th>Goals</th><th>Assists</th>
                  <th>Pass Acc</th><th>Minutes</th><th>Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((ps) => (
                  <tr key={ps!.player.id}>
                    <td>
                      <Link href={`/dashboard/players/${ps!.player.id}`} className="font-semibold hover:text-brand-600 transition">
                        {ps!.player.first_name} {ps!.player.last_name}
                      </Link>
                    </td>
                    <td><span className="pill-slate text-[10px]">{ps!.player.position}</span></td>
                    <td>{ps!.matches}</td>
                    <td className="font-semibold text-emerald-600">{ps!.totalGoals}</td>
                    <td className="font-semibold text-blue-600">{ps!.totalAssists}</td>
                    <td>{ps!.passAcc !== null ? `${ps!.passAcc}%` : '—'}</td>
                    <td>{ps!.totalMinutes}'</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-16">
                          <div className="progress-fill" style={{ width: `${(ps!.avgRating / 10) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-brand-600">{ps!.avgRating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {perfs.length === 0 && (
        <div className="card p-8 text-center">
          <BarChart3 size={48} className="text-brand-300 mx-auto mb-3" />
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>No performance data yet</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Add performance records from individual player profiles.</p>
        </div>
      )}
    </div>
  );
}
