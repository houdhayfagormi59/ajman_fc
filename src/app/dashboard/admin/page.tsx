'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { Shield, Users, Eye, BarChart3, Activity, Search, UserCheck, ChevronDown, Building2, Trash2, Crown } from 'lucide-react';
import type { Coach, Player, Team, Injury, Performance } from '@/lib/types';
import { STAFF_ROLE_CATEGORIES, getRoleCategory } from '@/lib/staffRoles';

interface CoachFull extends Coach {
  _players: number; _teams: number; _injuries: number; _performances: number; staff_role?: string | null;
}

function RoleBadge({ role }: { role?: string | null }) {
  if (!role) return <span className="pill-slate text-[10px]">No role set</span>;
  const cat = getRoleCategory(role);
  const colorMap: Record<string, string> = {
    'Coaching Staff': 'pill-orange',
    'Medical Staff': 'pill-red',
    'Performance & Fitness': 'pill-green',
    'Analysis & Data': 'pill-blue',
    'Scouting & Recruitment': 'pill-blue',
    'Club Management': 'pill-slate',
    'Youth Academy': 'pill-green',
    'Elite / Modern Roles': 'pill-blue',
    'Support Staff': 'pill-yellow',
  };
  const cls = cat ? (colorMap[cat.category] || 'pill-slate') : 'pill-slate';
  return <span className={`${cls} text-[10px] flex items-center gap-1`}>{cat?.emoji} {role}</span>;
}

export default function AdminPanel() {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState<CoachFull[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [coachPlayers, setCoachPlayers] = useState<Player[]>([]);
  const [coachTeams, setCoachTeams] = useState<Team[]>([]);
  const [coachInjuries, setCoachInjuries] = useState<Injury[]>([]);
  const [coachPerf, setCoachPerf] = useState<Performance[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'staff'|'overview'>('staff');
  const [currentUserId, setCurrentUserId] = useState('');

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setCurrentUserId(user.id);

    const { data: coach } = await supabase.from('coaches').select('*').eq('id', user.id).single();
    if (!coach || coach.role !== 'admin') { setIsAdmin(false); setLoading(false); return; }
    setIsAdmin(true);

    const [coachesR, playersR, teamsR, injuriesR, perfR] = await Promise.all([
      supabase.from('coaches').select('*').order('created_at', { ascending: false }),
      supabase.from('players').select('id,coach_id'),
      supabase.from('teams').select('id,coach_id'),
      supabase.from('injuries').select('id,coach_id').eq('status', 'active'),
      supabase.from('performances').select('id,coach_id'),
    ]);

    const enriched = ((coachesR.data ?? []) as Coach[]).map(c => ({
      ...c,
      _players: (playersR.data ?? []).filter(p => p.coach_id === c.id).length,
      _teams: (teamsR.data ?? []).filter(t => t.coach_id === c.id).length,
      _injuries: (injuriesR.data ?? []).filter(i => i.coach_id === c.id).length,
      _performances: (perfR.data ?? []).filter(p => p.coach_id === c.id).length,
    }));
    setCoaches(enriched);
    setLoading(false);
  }

  async function viewCoach(id: string) {
    setSelectedCoach(id);
    setDetailLoading(true);
    const [p, t, i, perf] = await Promise.all([
      supabase.from('players').select('*').eq('coach_id', id).order('last_name'),
      supabase.from('teams').select('*').eq('coach_id', id),
      supabase.from('injuries').select('*').eq('coach_id', id).eq('status', 'active'),
      supabase.from('performances').select('*').eq('coach_id', id).order('match_date', { ascending: false }).limit(15),
    ]);
    setCoachPlayers((p.data ?? []) as Player[]);
    setCoachTeams((t.data ?? []) as Team[]);
    setCoachInjuries((i.data ?? []) as Injury[]);
    setCoachPerf((perf.data ?? []) as Performance[]);
    setDetailLoading(false);
  }

  async function toggleRole(coachId: string, current: string) {
    if (coachId === currentUserId) { alert("You cannot change your own admin role."); return; }
    const next = current === 'admin' ? 'coach' : 'admin';
    if (!confirm(`Change this user's role to "${next}"?`)) return;
    await supabase.from('coaches').update({ role: next }).eq('id', coachId);
    load();
  }

  async function deleteCoach(coachId: string, name: string) {
    if (coachId === currentUserId) { alert("You cannot delete your own account from here."); return; }
    if (!confirm(`Remove "${name}" from the system? This cannot be undone.`)) return;
    await supabase.from('coaches').delete().eq('id', coachId);
    if (selectedCoach === coachId) setSelectedCoach(null);
    load();
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="card p-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Loading admin panel…</div>;

  if (!isAdmin) return (
    <div className="card p-12 text-center animate-fade-in-up">
      <Shield size={48} className="mx-auto mb-3 text-slate-300" />
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Access Required</h2>
      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
        You need admin privileges. Ask an existing admin to upgrade your account.
      </p>
      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs" style={{ color: 'var(--text-secondary)' }}>
        Or run in Supabase SQL editor:<br />
        <code className="font-mono text-brand-600">UPDATE public.coaches SET role = 'admin' WHERE email = 'your@email.com';</code>
      </div>
    </div>
  );

  // Filters
  const filteredCoaches = coaches.filter(c => {
    const matchSearch = !search || `${c.full_name} ${c.email} ${c.staff_role || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || (c.staff_role && getRoleCategory(c.staff_role)?.category === filterCategory);
    return matchSearch && matchCat;
  });

  const selectedData = coaches.find(c => c.id === selectedCoach);

  // Stats by category
  const statsByCategory = STAFF_ROLE_CATEGORIES.map(cat => ({
    ...cat,
    count: coaches.filter(c => c.staff_role && cat.roles.includes(c.staff_role)).length,
  })).filter(c => c.count > 0);

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-12 h-12 rounded-2xl gradient-brand text-white flex items-center justify-center shadow-glow-orange">
          <Shield size={22} />
        </div>
        <div className="flex-1">
          <h1 className="section-header">Admin Panel</h1>
          <p className="section-sub">Staff directory, roles, permissions & club overview</p>
        </div>
        <span className="pill-red font-bold">ADMIN</span>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 gradient-brand-soft text-center">
          <div className="text-2xl font-extrabold text-brand-600">{coaches.length}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Staff</div>
        </div>
        <div className="card p-4 gradient-brand-soft text-center">
          <div className="text-2xl font-extrabold text-brand-600">{coaches.reduce((s,c) => s+c._players, 0)}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Players</div>
        </div>
        <div className="card p-4 gradient-brand-soft text-center">
          <div className="text-2xl font-extrabold text-brand-600">{coaches.filter(c => c.role === 'admin').length}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Admins</div>
        </div>
        <div className="card p-4 gradient-brand-soft text-center">
          <div className="text-2xl font-extrabold text-red-600">{coaches.reduce((s,c) => s+c._injuries, 0)}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active Injuries</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 card p-1 w-fit">
        {([['staff','👥 Staff Directory'],['overview','📊 Club Overview']] as const).map(([k,l]) => (
          <button key={k} onClick={() => setActiveTab(k as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab===k?'gradient-brand text-white shadow-glow-orange':'hover:bg-brand-50 dark:hover:bg-slate-700'}`}
            style={{ color: activeTab===k?undefined:'var(--text-secondary)' }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── TAB: STAFF DIRECTORY ── */}
      {activeTab === 'staff' && (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Left: staff list */}
          <div className="lg:col-span-2 space-y-3">
            {/* Search & filter */}
            <div className="card p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Search size={14} style={{ color: 'var(--text-secondary)' }} />
                <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Search name, email or role…"
                  value={search} onChange={e => setSearch(e.target.value)} style={{ color: 'var(--text-primary)' }} />
                {search && <button onClick={() => setSearch('')} className="text-xs text-brand-600">×</button>}
              </div>
              <select className="input-base text-sm" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="">All departments</option>
                {STAFF_ROLE_CATEGORIES.map(c => <option key={c.category} value={c.category}>{c.emoji} {c.category}</option>)}
              </select>
            </div>

            <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {filteredCoaches.length} of {coaches.length} staff members
            </div>

            {/* Staff cards */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin pr-0.5">
              {filteredCoaches.length === 0 ? (
                <div className="card p-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No staff found</div>
              ) : filteredCoaches.map(c => {
                const cat = c.staff_role ? getRoleCategory(c.staff_role) : null;
                const isSelected = selectedCoach === c.id;
                const isMe = c.id === currentUserId;
                return (
                  <div key={c.id}
                    onClick={() => viewCoach(c.id)}
                    className={`card p-3 cursor-pointer transition ${isSelected ? 'border-brand-500 shadow-glow-orange' : 'card-hover'}`}
                    style={isSelected ? { borderColor: '#EA580C' } : {}}>
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${isSelected ? 'gradient-brand text-white shadow-glow-orange' : 'gradient-brand-soft border'}`}
                        style={!isSelected ? { borderColor: 'var(--border)', color: 'var(--text-primary)' } : {}}>
                        {c.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{c.full_name}</span>
                          {isMe && <span className="text-[9px] px-1.5 py-0.5 rounded-full gradient-brand text-white font-bold">YOU</span>}
                          {c.role === 'admin' && <Crown size={11} className="text-yellow-500" />}
                        </div>
                        <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.email}</div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <RoleBadge role={c.staff_role} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                      <span>👥 {c._players} players</span>
                      <span>🏆 {c._teams} teams</span>
                      <span>🏥 {c._injuries} injuries</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: staff detail */}
          <div className="lg:col-span-3 space-y-4">
            {!selectedCoach ? (
              <div className="card p-12 text-center">
                <Eye size={36} className="mx-auto mb-3 text-brand-200" />
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Select a staff member</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Click any card on the left to view their details</p>
              </div>
            ) : detailLoading ? (
              <div className="card p-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
            ) : selectedData ? (
              <>
                {/* Profile card */}
                <div className="card p-5 gradient-brand-soft">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white font-extrabold text-xl shadow-glow-orange flex-shrink-0">
                      {selectedData.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>{selectedData.full_name}</h2>
                        {selectedData.role === 'admin' && <Crown size={16} className="text-yellow-500" />}
                        {selectedData.id === currentUserId && <span className="pill-blue text-[10px]">You</span>}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedData.email}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <RoleBadge role={selectedData.staff_role} />
                        <Badge variant={selectedData.role === 'admin' ? 'danger' : 'neutral'}>
                          {selectedData.role === 'admin' ? '🛡 Admin' : '👤 Coach'}
                        </Badge>
                        {selectedData.club_name && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <Building2 size={11} /> {selectedData.club_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role category info */}
                  {selectedData.staff_role && getRoleCategory(selectedData.staff_role) && (
                    <div className={`mt-3 p-2.5 rounded-xl ${getRoleCategory(selectedData.staff_role)!.bg}`}>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-base">{getRoleCategory(selectedData.staff_role)!.emoji}</span>
                        <div>
                          <div className={`font-bold ${getRoleCategory(selectedData.staff_role)!.color}`}>
                            {getRoleCategory(selectedData.staff_role)!.category}
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>Department</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[
                      { label: 'Players', val: coachPlayers.length, color: 'text-brand-600' },
                      { label: 'Teams', val: coachTeams.length, color: 'text-blue-600' },
                      { label: 'Injuries', val: coachInjuries.length, color: 'text-red-600' },
                      { label: 'Matches', val: coachPerf.length, color: 'text-emerald-600' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="card p-2 text-center">
                        <div className={`text-xl font-extrabold ${color}`}>{val}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Admin actions */}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => toggleRole(selectedCoach!, selectedData.role)}
                      disabled={selectedData.id === currentUserId}
                      className="flex-1 py-2 rounded-lg card border text-xs font-bold hover:bg-brand-50 dark:hover:bg-slate-700 transition disabled:opacity-40"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                      <Crown size={11} className="inline mr-1" />
                      {selectedData.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button onClick={() => deleteCoach(selectedCoach!, selectedData.full_name)}
                      disabled={selectedData.id === currentUserId}
                      className="py-2 px-3 rounded-lg border border-red-200 dark:border-red-800 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-40">
                      <Trash2 size={12} className="inline mr-1" />Remove
                    </button>
                  </div>
                </div>

                {/* Players table */}
                {coachPlayers.length > 0 && (
                  <div className="card p-4">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Users size={14} className="text-brand-600" /> Players ({coachPlayers.length})
                    </h3>
                    <div className="max-h-48 overflow-y-auto scrollbar-thin">
                      <table className="data-table">
                        <thead><tr><th>Name</th><th>Pos</th><th>Age Group</th><th>Status</th></tr></thead>
                        <tbody>
                          {coachPlayers.map(p => (
                            <tr key={p.id}>
                              <td className="font-semibold">{p.first_name} {p.last_name}</td>
                              <td><span className="pill-slate text-[10px]">{p.position}</span></td>
                              <td>{p.age_group || '—'}</td>
                              <td><Badge variant={p.status}>{p.status}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Teams */}
                {coachTeams.length > 0 && (
                  <div className="card p-4">
                    <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Teams</h3>
                    <div className="flex flex-wrap gap-2">
                      {coachTeams.map(t => (
                        <span key={t.id} className="pill-orange">{t.name} {t.age_group ? `(${t.age_group})` : ''}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ── TAB: CLUB OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* By department */}
          <div className="card p-4">
            <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Staff by Department</h2>
            {statsByCategory.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No staff have roles assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {statsByCategory.map(({ category, emoji, color, count }) => {
                  const pct = Math.round((count / coaches.length) * 100);
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-1.5">
                          <span>{emoji}</span>
                          <span className={`font-semibold ${color}`}>{category}</span>
                        </div>
                        <span className="font-bold text-xs" style={{ color: 'var(--text-secondary)' }}>{count} staff ({pct}%)</span>
                      </div>
                      <div className="progress-bar h-2">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full staff list by department */}
          {STAFF_ROLE_CATEGORIES.map(({ category, emoji, color, bg, roles }) => {
            const deptStaff = coaches.filter(c => c.staff_role && roles.includes(c.staff_role));
            if (deptStaff.length === 0) return null;
            return (
              <div key={category} className="card p-4">
                <div className={`flex items-center gap-2 mb-3 font-bold text-sm`}>
                  <span>{emoji}</span>
                  <span className={color}>{category}</span>
                  <span className="ml-auto pill-slate text-[10px]">{deptStaff.length} member{deptStaff.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {deptStaff.map(c => (
                    <div key={c.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${bg} cursor-pointer hover:opacity-90 transition`}
                      onClick={() => { setActiveTab('staff'); viewCoach(c.id); setSelectedCoach(c.id); }}>
                      <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs truncate flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                          {c.full_name}
                          {c.role === 'admin' && <Crown size={10} className="text-yellow-500 flex-shrink-0" />}
                        </div>
                        <div className={`text-[10px] font-semibold ${color}`}>{c.staff_role}</div>
                      </div>
                      <div className="text-right text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {c._players > 0 && <div>{c._players} players</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* No role staff */}
          {coaches.filter(c => !c.staff_role).length > 0 && (
            <div className="card p-4">
              <div className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>⚠️ No Role Assigned ({coaches.filter(c => !c.staff_role).length})</div>
              <div className="flex flex-wrap gap-2">
                {coaches.filter(c => !c.staff_role).map(c => (
                  <span key={c.id} className="pill-slate">{c.full_name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
