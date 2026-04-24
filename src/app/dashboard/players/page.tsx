'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PlayerCard from '@/components/PlayerCard';
import Button from '@/components/Button';
import { Plus, Users, Download, Filter, Search } from 'lucide-react';
import type { Player, Team } from '@/lib/types';

export default function PlayersPage() {
  const supabase = createClient();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterPos, setFilterPos] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    (async () => {
      const [pR, tR] = await Promise.all([
        supabase.from('players').select('*').order('last_name'),
        supabase.from('teams').select('*').order('name'),
      ]);
      setPlayers((pR.data ?? []) as Player[]);
      setTeams((tR.data ?? []) as Team[]);
      setLoading(false);
    })();
  }, []);

  const filtered = players.filter(p => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (filterTeam && p.team_id !== filterTeam) return false;
    if (filterPos && p.position !== filterPos) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  function exportTeamCSV() {
    const teamPlayers = filterTeam ? players.filter(p => p.team_id === filterTeam) : players;
    const teamName = filterTeam ? (teams.find(t => t.id === filterTeam)?.name ?? 'All') : 'All';
    const headers = ['First Name','Last Name','Position','Age Group','Jersey #','Date of Birth','Height (cm)','Weight (kg)','Nationality','Status','Notes'];
    const rows = teamPlayers.map(p => [
      p.first_name, p.last_name, p.position, p.age_group ?? '',
      p.jersey_number ?? '', p.date_of_birth, p.height_cm ?? '',
      p.weight_kg ?? '', p.nationality ?? '', p.status, p.notes ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${teamName}-players.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-header">Players</h1>
          <p className="section-sub">{players.length} total · {players.filter(p => p.status === 'fit').length} fit</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportTeamCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg card border text-sm font-semibold hover:bg-brand-50 transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <Download size={14} /> Export {filterTeam ? 'Team' : 'All'} CSV
          </button>
          <Link href="/dashboard/players/new"><Button><Plus size={16} /> Add Player</Button></Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search size={14} style={{ color: 'var(--text-secondary)' }} />
          <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Search player…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ color: 'var(--text-primary)' }} />
        </div>
        <select className="input-base text-sm w-auto" value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
          <option value="">All teams</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select className="input-base text-sm w-auto" value={filterPos} onChange={e => setFilterPos(e.target.value)}>
          <option value="">All positions</option>
          {['GK','DEF','MID','FWD'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="input-base text-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All status</option>
          {['fit','injured','recovering','inactive','suspended'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || filterTeam || filterPos || filterStatus) && (
          <button onClick={() => { setSearch(''); setFilterTeam(''); setFilterPos(''); setFilterStatus(''); }}
            className="text-xs font-semibold text-brand-600 hover:underline">Clear</button>
        )}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card h-32 animate-pulse" style={{ background: 'var(--bg-soft)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <Users size={40} className="mx-auto text-brand-300 mb-3" />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {players.length === 0 ? 'No players yet' : 'No players match filters'}
          </p>
          {players.length === 0 && (
            <Link href="/dashboard/players/new" className="inline-block mt-4">
              <Button><Plus size={15} /> Add First Player</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Showing {filtered.length} of {players.length} players</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => <PlayerCard key={p.id} p={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
