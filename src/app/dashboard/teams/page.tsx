'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/Button';
import { Plus, Award, Pencil, Trash2, Users, Shield, X, Save } from 'lucide-react';
import type { Team } from '@/lib/types';
import { AGE_GROUPS } from '@/lib/types';

export default function TeamsPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState({ name: '', age_group: '', division: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data: teamsData } = await supabase.from('teams').select('*').order('name');
    const teams = (teamsData ?? []) as Team[];
    setTeams(teams);

    // Load player counts for each team
    if (teams.length > 0) {
      const counts: Record<string, number> = {};
      await Promise.all(teams.map(async (t) => {
        const { count } = await supabase.from('players').select('id', { count: 'exact', head: true }).eq('team_id', t.id);
        counts[t.id] = count ?? 0;
      }));
      setPlayerCounts(counts);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(team: Team) {
    setEditingTeam(team);
    setEditForm({ name: team.name, age_group: team.age_group ?? '', division: team.division ?? '' });
  }

  async function saveEdit() {
    if (!editingTeam || !editForm.name.trim()) return;
    setSaving(true);
    await supabase.from('teams').update({
      name: editForm.name.trim(),
      age_group: editForm.age_group || null,
      division: editForm.division || null,
    }).eq('id', editingTeam.id);
    setSaving(false);
    setEditingTeam(null);
    load();
  }

  async function deleteTeam(id: string, name: string) {
    if (!confirm(`Delete team "${name}"? This will unassign all players from this team but will NOT delete the players.`)) return;
    setDeleting(id);
    await supabase.from('teams').delete().eq('id', id);
    setDeleting(null);
    load();
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-header">Teams</h1>
          <p className="section-sub">Manage your squads and age groups</p>
        </div>
        <Link href="/dashboard/teams/new"><Button><Plus size={16} /> New Team</Button></Link>
      </div>

      {/* Edit Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-md p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Edit Team</h2>
              <button onClick={() => setEditingTeam(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label block mb-1">Team Name *</label>
                <input className="input-base" value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label block mb-1">Age Group</label>
                <select className="input-base" value={editForm.age_group}
                  onChange={e => setEditForm(f => ({ ...f, age_group: e.target.value }))}>
                  <option value="">Select…</option>
                  {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label block mb-1">Division / League</label>
                <input className="input-base" value={editForm.division} placeholder="e.g. UAE Pro League"
                  onChange={e => setEditForm(f => ({ ...f, division: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button onClick={saveEdit} loading={saving} className="flex-1">
                <Save size={15} /> Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setEditingTeam(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card h-36 animate-pulse" style={{ background: 'var(--bg-soft)' }} />)}
        </div>
      ) : teams.length === 0 ? (
        <div className="card p-10 text-center">
          <Award size={40} className="mx-auto text-brand-300 mb-3" />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No teams yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Create your first team to start organising players.</p>
          <Link href="/dashboard/teams/new" className="inline-block mt-4">
            <Button><Plus size={15} /> Create First Team</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="card p-5 card-hover group flex flex-col">
              {/* Team header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-glow-orange">
                  {team.logo_url
                    ? <img src={team.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                    : <Shield size={22} className="text-white" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>{team.name}</h3>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {team.age_group || 'No age group'}{team.division ? ` · ${team.division}` : ''}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                  <Users size={13} />
                  <span>{playerCounts[team.id] ?? 0} players</span>
                </div>
                {team.formation && (
                  <span className="pill-slate text-[10px]">{team.formation}</span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-auto pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <Link href={`/dashboard/team-profile?team=${team.id}`} className="flex-1">
                  <button className="w-full text-xs font-semibold py-1.5 px-3 rounded-lg gradient-brand text-white hover:opacity-90 transition">
                    View Profile
                  </button>
                </Link>
                <button
                  onClick={() => startEdit(team)}
                  className="flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg card border hover:bg-brand-50 dark:hover:bg-slate-700 transition"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => deleteTeam(team.id, team.name)}
                  disabled={deleting === team.id}
                  className="flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50">
                  <Trash2 size={12} /> {deleting === team.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
