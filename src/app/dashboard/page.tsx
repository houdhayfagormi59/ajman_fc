export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/StatCard';
import PieChart from '@/components/PieChart';
import Badge from '@/components/Badge';
import { Users, Activity, TrendingUp, Heart, Shield, Calendar, Target, Zap, BarChart3, Brain } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function DashboardHome() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [playersR, teamsR, injuriesR, sessionsR, perfR, recruitmentR, evalR] = await Promise.all([
    supabase.from('players').select('id,status,first_name,last_name,position,team_id,age_group,created_at'),
    supabase.from('teams').select('id,name,age_group'),
    supabase.from('injuries').select('id,severity,status,body_part,player_id').eq('status', 'active'),
    supabase.from('sessions').select('id,title,session_date,focus_area,intensity_level').order('session_date', { ascending: false }).limit(6),
    supabase.from('performances').select('id,rating,match_date,team_id,goals,assists').order('match_date', { ascending: false }).limit(20),
    supabase.from('recruitment').select('id,status'),
    supabase.from('evaluations').select('id,player_id,evaluation_date').order('evaluation_date', { ascending: false }).limit(5),
  ]);

  const players = playersR.data ?? [];
  const teams = teamsR.data ?? [];
  const injuries = injuriesR.data ?? [];
  const sessions = sessionsR.data ?? [];
  const performances = perfR.data ?? [];
  const recruits = recruitmentR.data ?? [];

  const fit = players.filter((p) => p.status === 'fit').length;
  const injured = players.filter((p) => p.status === 'injured').length;
  const avgRating = performances.length
    ? (performances.reduce((s, p) => s + (p.rating ?? 0), 0) / performances.length).toFixed(1) : '—';

  const totalGoals = performances.reduce((s, p) => s + (p.goals ?? 0), 0);
  const totalAssists = performances.reduce((s, p) => s + (p.assists ?? 0), 0);

  const injuryData = [
    { name: 'Minor', value: injuries.filter((i) => i.severity === 'minor').length },
    { name: 'Moderate', value: injuries.filter((i) => i.severity === 'moderate').length },
    { name: 'Severe', value: injuries.filter((i) => i.severity === 'severe').length },
  ].filter((d) => d.value > 0);

  const playersByTeam = teams.map((t) => ({
    name: t.name || t.age_group || 'Unknown', value: players.filter((p) => p.team_id === t.id).length,
  })).filter((d) => d.value > 0);
  const unassigned = players.filter((p) => !p.team_id).length;
  if (unassigned > 0) playersByTeam.push({ name: 'Unassigned', value: unassigned });

  const statusData = [
    { name: 'Fit', value: fit },
    { name: 'Injured', value: injured },
    { name: 'Recovering', value: players.filter((p) => p.status === 'recovering').length },
    { name: 'Inactive', value: players.filter((p) => p.status === 'inactive').length },
  ].filter((d) => d.value > 0);

  const recentPlayers = [...players].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 5);

  const positionBreakdown = [
    { pos: 'GK', count: players.filter(p => p.position === 'GK').length, color: '#f59e0b' },
    { pos: 'DEF', count: players.filter(p => p.position === 'DEF').length, color: '#3b82f6' },
    { pos: 'MID', count: players.filter(p => p.position === 'MID').length, color: '#10b981' },
    { pos: 'FWD', count: players.filter(p => p.position === 'FWD').length, color: '#ef4444' },
  ];

  const availabilityRate = players.length > 0 ? Math.round((fit / players.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-header">Command Center</h1>
          <p className="section-sub">Elite football management — real-time overview</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/dashboard/ai-analyzer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-semibold shadow-glow-orange hover:opacity-90 transition">
            <Brain size={15} /> AI Analyzer
          </Link>
          <Link href="/dashboard/sessions/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg card border text-sm font-semibold hover:bg-brand-50 transition"
            style={{ color: 'var(--text-primary)' }}>
            <Calendar size={15} /> New Session
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Players" value={players.length} icon={<Users size={18} />} accent />
        <StatCard label="Available" value={`${availabilityRate}%`} icon={<Heart size={18} />} hint={`${fit} fit`} />
        <StatCard label="Teams" value={teams.length} icon={<Shield size={18} />} />
        <StatCard label="Active Injuries" value={injuries.length} icon={<Activity size={18} />} />
        <StatCard label="Avg Rating" value={avgRating} icon={<TrendingUp size={18} />} />
        <StatCard label="Sessions" value={sessions.length} icon={<Calendar size={18} />} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Players by Team</h2>
          <PieChart data={playersByTeam} />
        </div>
        <div className="card p-4">
          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Availability Status</h2>
          <PieChart data={statusData} colors={['#16a34a','#dc2626','#eab308','#94a3b8']} />
        </div>
        <div className="card p-4">
          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Injury Severity</h2>
          {injuryData.length > 0
            ? <PieChart data={injuryData} colors={['#eab308','#f97316','#dc2626']} />
            : <div className="h-32 flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="pill-green">✓ No active injuries</span>
              </div>
          }
        </div>
      </div>

      {/* Position Breakdown */}
      <div className="card p-4">
        <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Squad Composition by Position</h2>
        <div className="grid grid-cols-4 gap-3">
          {positionBreakdown.map(({ pos, count, color }) => (
            <div key={pos} className="text-center">
              <div className="text-2xl font-extrabold" style={{ color }}>{count}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {pos === 'GK' ? 'Goalkeepers' : pos === 'DEF' ? 'Defenders' : pos === 'MID' ? 'Midfielders' : 'Forwards'}
              </div>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${players.length ? (count / players.length) * 100 : 0}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Players */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Players</h2>
            <Link href="/dashboard/players" className="text-xs text-brand-600 hover:underline">View all →</Link>
          </div>
          {recentPlayers.length === 0
            ? <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No players yet.</p>
            : (
              <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {recentPlayers.map((p) => (
                  <li key={p.id}>
                    <Link href={`/dashboard/players/${p.id}`}
                      className="flex items-center justify-between py-2.5 hover:bg-brand-50 dark:hover:bg-slate-700 -mx-2 px-2 rounded-lg transition">
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{p.first_name} {p.last_name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.position} · {p.age_group}</div>
                      </div>
                      <Badge variant={p.status as any}>{p.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
        </section>

        {/* Recent Sessions */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Training Sessions</h2>
            <Link href="/dashboard/sessions" className="text-xs text-brand-600 hover:underline">View all →</Link>
          </div>
          {sessions.length === 0
            ? <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No sessions yet.</p>
            : (
              <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {sessions.map((s) => (
                  <li key={s.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.focus_area}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.intensity_level && (
                        <span className={`pill ${s.intensity_level >= 8 ? 'pill-red' : s.intensity_level >= 5 ? 'pill-yellow' : 'pill-green'}`}>
                          RPE {s.intensity_level}
                        </span>
                      )}
                      <div className="text-xs text-brand-700 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded flex items-center gap-1">
                        <Calendar size={11} /> {formatDate(s.session_date)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </section>
      </div>

      {/* Stats Row */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="card p-4 gradient-brand-soft">
          <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Recent Goals</div>
          <div className="text-3xl font-extrabold text-brand-600">{totalGoals}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Last {performances.length} matches tracked</div>
        </div>
        <div className="card p-4 gradient-brand-soft">
          <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Assists</div>
          <div className="text-3xl font-extrabold text-brand-600">{totalAssists}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Combined across all players</div>
        </div>
        <div className="card p-4 gradient-brand-soft">
          <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Recruitment Pipeline</div>
          <div className="text-3xl font-extrabold text-brand-600">{recruits.length}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {recruits.filter(r => r.status === 'signed').length} signed · {recruits.filter(r => r.status === 'trial').length} on trial
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card p-4">
        <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Quick Access</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/dashboard/season-planner', label: 'Season Planner', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
            { href: '/dashboard/principles', label: 'Game Principles', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
            { href: '/dashboard/match-analysis', label: 'Match Analysis', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
            { href: '/dashboard/scouting', label: 'Scouting Board', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
            { href: '/dashboard/reports', label: 'Generate Reports', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
          ].map(({ href, label, color }) => (
            <Link key={href} href={href}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80 ${color}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
