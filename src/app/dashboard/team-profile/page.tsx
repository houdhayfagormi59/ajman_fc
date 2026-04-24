'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Select from '@/components/Select';
import Badge from '@/components/Badge';
import PieChart from '@/components/PieChart';
import PhotoUpload from '@/components/PhotoUpload';
import { Shield, TrendingUp, Users, Target, Activity, BarChart3, Zap, Calendar, Award } from 'lucide-react';
import { analyzeTeamStyle } from '@/lib/football-principles';
import type { Team, Player, Performance } from '@/lib/types';

export default function TeamProfilePage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamLogo, setTeamLogo] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'performance' | 'load'>('overview');

  async function loadTeams() {
    setLoading(true);
    const { data } = await supabase.from('teams').select('*').order('name');
    setTeams((data ?? []) as Team[]);
    setLoading(false);
  }

  async function loadTeamData(teamId: string) {
    const [p, perf, sess] = await Promise.all([
      supabase.from('players').select('*').eq('team_id', teamId),
      supabase.from('performances').select('*').eq('team_id', teamId).order('match_date', { ascending: false }),
      supabase.from('sessions').select('*').eq('team_id', teamId).order('session_date', { ascending: false }).limit(20),
    ]);
    setPlayers((p.data ?? []) as Player[]);
    setPerformances((perf.data ?? []) as Performance[]);
    setSessions(sess.data ?? []);
    const team = teams.find((t) => t.id === teamId);
    setTeamLogo(team?.logo_url || '');
  }

  useEffect(() => { loadTeams(); }, []);
  useEffect(() => { if (selectedId) loadTeamData(selectedId); }, [selectedId]);

  async function saveTeamLogo(b64: string) {
    setTeamLogo(b64);
    if (selectedId) {
      await supabase.from('teams').update({ logo_url: b64 }).eq('id', selectedId);
    }
  }

  const team = teams.find((t) => t.id === selectedId);
  const style = analyzeTeamStyle(performances, players);

  const posData = [
    { name: 'GK', value: players.filter((p) => p.position === 'GK').length },
    { name: 'DEF', value: players.filter((p) => p.position === 'DEF').length },
    { name: 'MID', value: players.filter((p) => p.position === 'MID').length },
    { name: 'FWD', value: players.filter((p) => p.position === 'FWD').length },
  ].filter((d) => d.value > 0);

  const statusData = [
    { name: 'Fit', value: players.filter((p) => p.status === 'fit').length },
    { name: 'Injured', value: players.filter((p) => p.status === 'injured').length },
    { name: 'Recovering', value: players.filter((p) => p.status === 'recovering').length },
    { name: 'Inactive', value: players.filter((p) => p.status === 'inactive').length },
  ].filter((d) => d.value > 0);

  const avgRating = performances.length
    ? (performances.reduce((s, p) => s + (p.rating ?? 0), 0) / performances.length).toFixed(1) : '—';
  const totalGoals = performances.reduce((s, p) => s + (p.goals ?? 0), 0);
  const totalAssists = performances.reduce((s, p) => s + (p.assists ?? 0), 0);
  const fitRate = players.length > 0 ? Math.round((players.filter(p => p.status === 'fit').length / players.length) * 100) : 0;

  const avgIntensity = sessions.filter(s => s.intensity_level).length > 0
    ? (sessions.reduce((s, sess) => s + (sess.intensity_level ?? 0), 0) / sessions.filter(s => s.intensity_level).length).toFixed(1)
    : '—';

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h1 className="section-header">Team Profile</h1>
        <p className="section-sub">Squad overview, playing style, performance analytics & load management</p>
      </div>

      <div className="card p-4">
        <Select label="Select Team" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Choose a team…</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.age_group})</option>)}
        </Select>
      </div>

      {selectedId && team && (
        <>
          {/* Team header */}
          <div className="card p-6 gradient-brand-soft">
            <div className="flex items-center gap-5 flex-wrap">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-300 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center text-4xl overflow-hidden border-2" style={{ borderColor: 'var(--border)' }}>
                {teamLogo ? <img src={teamLogo} alt="" className="w-full h-full object-cover" /> : <Shield size={32} className="text-brand-600" />}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{team.name}</h2>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{team.age_group} · {team.division || 'No division set'}</div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="pill-orange">{players.length} players</span>
                  <span className="pill-green">{performances.length} match records</span>
                  <span className="pill-blue">{sessions.length} sessions</span>
                  <span className={fitRate >= 85 ? 'pill-green' : fitRate >= 70 ? 'pill-yellow' : 'pill-red'}>
                    {fitRate}% available
                  </span>
                </div>
              </div>
              <PhotoUpload label="Team Logo" onFile={() => {}} onBase64={saveTeamLogo} preview={teamLogo || undefined} onClear={() => saveTeamLogo('')} />
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-3 text-center gradient-brand-soft">
              <div className="text-xl font-extrabold text-brand-600">{avgRating}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg match rating</div>
            </div>
            <div className="card p-3 text-center gradient-brand-soft">
              <div className="text-xl font-extrabold text-emerald-600">{totalGoals}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Goals scored</div>
            </div>
            <div className="card p-3 text-center gradient-brand-soft">
              <div className="text-xl font-extrabold text-blue-600">{totalAssists}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Assists</div>
            </div>
            <div className="card p-3 text-center gradient-brand-soft">
              <div className="text-xl font-extrabold text-purple-600">{avgIntensity !== '—' ? `${avgIntensity}/10` : '—'}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg training intensity</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 card p-1 w-fit overflow-x-auto">
            {([['overview', 'Overview'], ['players', 'Squad'], ['performance', 'Performance'], ['load', 'Training Load']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex-shrink-0 ${activeTab === key ? 'gradient-brand text-white shadow-glow-orange' : 'hover:bg-brand-50 dark:hover:bg-slate-700'}`}
                style={{ color: activeTab === key ? undefined : 'var(--text-secondary)' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="card p-4"><h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Position Breakdown</h3><PieChart data={posData} /></div>
                <div className="card p-4"><h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Availability Status</h3><PieChart data={statusData} colors={['#16a34a','#dc2626','#eab308','#94a3b8']} /></div>
                <div className="card p-4">
                  <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Playing Style Analysis</h3>
                  {style ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-brand-600" />
                        <span className="font-bold text-sm text-brand-600">{style.label}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{style.description}</p>
                      <div className="space-y-1.5 mt-2">
                        {style.strengths?.map((s: string) => (
                          <div key={s} className="flex items-center gap-1.5 text-xs">
                            <span className="text-emerald-500">✓</span>
                            <span style={{ color: 'var(--text-primary)' }}>{s}</span>
                          </div>
                        ))}
                        {style.weaknesses?.map((w: string) => (
                          <div key={w} className="flex items-center gap-1.5 text-xs">
                            <span className="text-red-500">✗</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add performance records to generate style analysis.</p>
                  )}
                </div>
              </div>

              {/* Recent matches */}
              {performances.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Recent Match Results</h3>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr><th>Date</th><th>Opponent</th><th>Goals</th><th>Assists</th><th>Avg Rating</th><th>Minutes</th></tr>
                      </thead>
                      <tbody>
                        {[...new Set(performances.map(p => p.match_date))].slice(0,6).map(date => {
                          const dayPerfs = performances.filter(p => p.match_date === date);
                          const opp = dayPerfs[0]?.opponent || '—';
                          const goals = dayPerfs.reduce((s, p) => s + (p.goals ?? 0), 0);
                          const assists = dayPerfs.reduce((s, p) => s + (p.assists ?? 0), 0);
                          const avgR = (dayPerfs.reduce((s, p) => s + (p.rating ?? 0), 0) / dayPerfs.length).toFixed(1);
                          const mins = dayPerfs.reduce((s, p) => s + (p.minutes_played ?? 0), 0);
                          return (
                            <tr key={date}>
                              <td className="text-xs">{date}</td>
                              <td className="font-medium">{opp}</td>
                              <td className="font-bold text-emerald-600">{goals}</td>
                              <td className="font-bold text-blue-600">{assists}</td>
                              <td><span className="font-bold text-brand-600">{avgR}</span></td>
                              <td>{mins}'</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Squad */}
          {activeTab === 'players' && (
            <div className="card p-4">
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Squad List</h3>
              {players.length === 0 ? (
                <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No players assigned to this team.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {['GK','DEF','MID','FWD'].map(pos => {
                    const posPlayers = players.filter(p => p.position === pos);
                    if (posPlayers.length === 0) return null;
                    return (
                      <div key={pos}>
                        <div className="label mb-2">{pos === 'GK' ? 'Goalkeepers' : pos === 'DEF' ? 'Defenders' : pos === 'MID' ? 'Midfielders' : 'Forwards'}</div>
                        {posPlayers.map(p => (
                          <div key={p.id} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                            <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                              {p.jersey_number ?? '?'}
                            </div>
                            <div className="flex-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {p.first_name} {p.last_name}
                            </div>
                            <Badge variant={p.status as any}>{p.status}</Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Performance */}
          {activeTab === 'performance' && (
            <div className="card p-4">
              {performances.length === 0
                ? <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No performance data for this team yet.</p>
                : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Matches tracked', value: new Set(performances.map(p => p.match_date)).size },
                        { label: 'Total goals', value: totalGoals },
                        { label: 'Total assists', value: totalAssists },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center">
                          <div className="text-2xl font-extrabold text-brand-600">{value}</div>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr><th>Player</th><th>Pos</th><th>Matches</th><th>Goals</th><th>Assists</th><th>Avg Rating</th></tr>
                        </thead>
                        <tbody>
                          {players.map(p => {
                            const pp = performances.filter(perf => perf.player_id === p.id);
                            if (pp.length === 0) return null;
                            const avgR = (pp.reduce((s, perf) => s + (perf.rating ?? 0), 0) / pp.length).toFixed(1);
                            return (
                              <tr key={p.id}>
                                <td className="font-semibold">{p.first_name} {p.last_name}</td>
                                <td><span className="pill-slate text-[10px]">{p.position}</span></td>
                                <td>{pp.length}</td>
                                <td className="font-bold text-emerald-600">{pp.reduce((s, perf) => s + (perf.goals ?? 0), 0)}</td>
                                <td className="font-bold text-blue-600">{pp.reduce((s, perf) => s + (perf.assists ?? 0), 0)}</td>
                                <td><span className="font-bold text-brand-600">{avgR}</span></td>
                              </tr>
                            );
                          }).filter(Boolean)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Training Load */}
          {activeTab === 'load' && (
            <div className="space-y-4">
              <div className="card p-4">
                <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Training Load Overview</h3>
                {sessions.length === 0
                  ? <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No sessions for this team yet.</p>
                  : (
                    <div className="space-y-3">
                      {/* Load chart */}
                      <div className="relative h-24">
                        <div className="absolute inset-0 flex items-end gap-1">
                          {sessions.slice(0, 20).reverse().map((s, i) => {
                            const h = s.intensity_level ? (s.intensity_level / 10) * 100 : 40;
                            return (
                              <div key={i} className="flex-1 rounded-t transition-all"
                                style={{
                                  height: `${h}%`,
                                  background: h >= 80 ? '#ef4444' : h >= 60 ? '#f97316' : h >= 40 ? '#eab308' : '#10b981'
                                }}
                                title={`${s.title} — RPE ${s.intensity_level ?? '?'}/10`}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Low (&lt;4)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Medium (4–6)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> High (6–8)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Very High (8+)</span>
                      </div>

                      {/* Recent sessions */}
                      <div className="overflow-x-auto">
                        <table className="data-table">
                          <thead>
                            <tr><th>Date</th><th>Session</th><th>Focus</th><th>Duration</th><th>Intensity</th></tr>
                          </thead>
                          <tbody>
                            {sessions.slice(0, 10).map(s => (
                              <tr key={s.id}>
                                <td className="text-xs">{s.session_date}</td>
                                <td className="font-semibold">{s.title}</td>
                                <td><span className="pill-slate text-[10px]">{s.focus_area?.replace(/_/g, ' ')}</span></td>
                                <td>{s.duration_minutes}min</td>
                                <td>
                                  {s.intensity_level
                                    ? <span className={`pill text-[10px] ${s.intensity_level >= 8 ? 'pill-red' : s.intensity_level >= 6 ? 'pill-orange' : 'pill-yellow'}`}>
                                        RPE {s.intensity_level}
                                      </span>
                                    : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </>
      )}

      {!selectedId && (
        <div className="card p-8 text-center">
          <Shield size={48} className="text-brand-300 mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select a team above to view its full profile</p>
        </div>
      )}
    </div>
  );
}
