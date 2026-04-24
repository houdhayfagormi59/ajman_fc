'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Film, Plus, Tag, Brain, X, Save, Trash2, ChevronRight, BarChart3 } from 'lucide-react';
import Button from '@/components/Button';

type MatchEvent = { id: string; time: number; type: string; player: string; description: string; side: 'home'|'away'; };
type Match = {
  id: string; title: string; match_date: string; opponent: string;
  home_score: number; away_score: number; competition: string;
  events: MatchEvent[]; ai_summary: string | null; tags: string[];
  coach_notes: string; formation: string; opponent_formation: string; possession: number;
  created_at: string;
};

const EVENT_TYPES = [
  { type: 'goal', label: '⚽ Goal', color: 'bg-emerald-500' },
  { type: 'assist', label: '🎯 Assist', color: 'bg-blue-500' },
  { type: 'shot', label: '🚀 Shot', color: 'bg-yellow-500' },
  { type: 'save', label: '🧤 Save', color: 'bg-purple-500' },
  { type: 'corner', label: '🚩 Corner', color: 'bg-orange-400' },
  { type: 'free_kick', label: '🥅 Free Kick', color: 'bg-teal-500' },
  { type: 'pressing', label: '⚡ Press', color: 'bg-red-400' },
  { type: 'transition', label: '↔ Transition', color: 'bg-indigo-500' },
  { type: 'yellow_card', label: '🟨 Yellow Card', color: 'bg-yellow-400' },
  { type: 'red_card', label: '🟥 Red Card', color: 'bg-red-600' },
  { type: 'substitution', label: '🔄 Sub', color: 'bg-slate-400' },
  { type: 'tactical', label: '🧠 Tactical', color: 'bg-brand-500' },
  { type: 'var', label: '📺 VAR', color: 'bg-slate-600' },
  { type: 'chance', label: '🎰 Big Chance', color: 'bg-pink-500' },
];

const FORMATIONS = ['4-3-3','4-4-2','4-2-3-1','3-5-2','5-3-2','4-5-1','3-4-3','4-1-4-1'];

export default function MatchAnalysisPage() {
  const supabase = createClient();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Match | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline'|'tactical'|'stats'|'ai'>('timeline');
  const [addingEvent, setAddingEvent] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({ time: 0, type: 'goal', player: '', description: '', side: 'home' as const });
  const [newMatch, setNewMatch] = useState({
    title: '', opponent: '', match_date: new Date().toISOString().split('T')[0],
    competition: '', home_score: 0, away_score: 0,
    formation: '4-3-3', opponent_formation: '4-4-2', possession: 50, coach_notes: '',
  });

  useEffect(() => { loadMatches(); }, []);

  async function loadMatches() {
    const { data } = await supabase.from('video_analyses')
      .select('*').eq('tags', null).order('created_at', { ascending: false });
    // Use video_analyses table with match_date for match storage
    const { data: matches } = await supabase.from('video_analyses')
      .select('*').order('created_at', { ascending: false });
    setMatches((matches ?? []).map(m => ({
      id: m.id, title: m.title,
      match_date: m.match_date ?? m.created_at?.split('T')[0],
      opponent: m.opponent ?? 'Unknown',
      home_score: parseInt((m.tags ?? [])[0] ?? '0') || 0,
      away_score: parseInt((m.tags ?? [])[1] ?? '0') || 0,
      competition: (m.tags ?? [])[2] ?? '',
      formation: (m.tags ?? [])[3] ?? '4-3-3',
      opponent_formation: (m.tags ?? [])[4] ?? '4-4-2',
      possession: parseInt((m.tags ?? [])[5] ?? '50') || 50,
      coach_notes: m.ai_summary ? '' : '',
      events: Array.isArray(m.annotations) ? m.annotations : [],
      ai_summary: m.ai_summary,
      tags: m.tags ?? [],
      created_at: m.created_at,
    })));
  }

  async function createMatch() {
    if (!newMatch.title || !newMatch.opponent) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const tags = [
      String(newMatch.home_score), String(newMatch.away_score),
      newMatch.competition, newMatch.formation,
      newMatch.opponent_formation, String(newMatch.possession),
    ];
    const { data } = await supabase.from('video_analyses').insert({
      coach_id: user.id, title: newMatch.title, opponent: newMatch.opponent,
      match_date: newMatch.match_date, tags, annotations: [],
      ai_summary: newMatch.coach_notes || null,
    }).select().single();
    if (data) {
      const match: Match = {
        id: data.id, title: data.title, match_date: data.match_date,
        opponent: data.opponent ?? '', home_score: newMatch.home_score,
        away_score: newMatch.away_score, competition: newMatch.competition,
        formation: newMatch.formation, opponent_formation: newMatch.opponent_formation,
        possession: newMatch.possession, coach_notes: newMatch.coach_notes,
        events: [], ai_summary: data.ai_summary, tags: data.tags ?? [],
        created_at: data.created_at,
      };
      setMatches(ms => [match, ...ms]);
      setSelected(match);
    }
    setSaving(false);
    setShowNewForm(false);
  }

  async function addEvent() {
    if (!selected || !newEvent.player) return;
    const ev: MatchEvent = { ...newEvent, id: Math.random().toString(36).slice(2) };
    const updated = { ...selected, events: [...selected.events, ev].sort((a,b) => a.time - b.time) };
    await supabase.from('video_analyses').update({ annotations: updated.events }).eq('id', selected.id);
    setSelected(updated);
    setMatches(ms => ms.map(m => m.id === updated.id ? updated : m));
    setAddingEvent(false);
    setNewEvent({ time: 0, type: 'goal', player: '', description: '', side: 'home' });
  }

  async function deleteMatch(id: string) {
    if (!confirm('Delete this match analysis?')) return;
    await supabase.from('video_analyses').delete().eq('id', id);
    setMatches(ms => ms.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  async function generateAI() {
    if (!selected) return;
    setAiLoading(true);
    const evStr = selected.events.length > 0
      ? selected.events.map(e => `${e.time}' — ${e.type}: ${e.player} — ${e.description} [${e.side}]`).join('\n')
      : 'No events tagged yet';
    const context = `Match: ${selected.title}\nDate: ${selected.match_date}\nResult: ${selected.home_score}-${selected.away_score} vs ${selected.opponent}\nCompetition: ${selected.competition}\nFormation: ${selected.formation} vs ${selected.opponent_formation}\nPossession: ${selected.possession}%\n\nEvents:\n${evStr}`;
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'match_analysis',
          systemPrompt: 'You are a professional football match analyst. Analyse the match data and events. Provide: 1) Match Summary 2) Tactical Analysis 3) Key Moments 4) What Worked Well 5) Areas to Improve 6) Training Focus for Next Week. Be specific and professional.',
          context,
        }),
      });
      const data = await res.json();
      const summary = data.result || 'AI unavailable — add GEMINI_API_KEY to .env.local';
      await supabase.from('video_analyses').update({ ai_summary: summary }).eq('id', selected.id);
      setSelected(s => s ? { ...s, ai_summary: summary } : s);
    } catch { }
    setAiLoading(false);
  }

  const fh = selected?.events.filter(e => e.time <= 45) ?? [];
  const sh = selected?.events.filter(e => e.time > 45) ?? [];
  const resultColor = selected ? (selected.home_score > selected.away_score ? 'text-emerald-600' : selected.home_score < selected.away_score ? 'text-red-600' : 'text-yellow-600') : '';

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-header">Match Analysis</h1>
          <p className="section-sub">Real match data, event tagging & AI tactical reports</p>
        </div>
        <Button onClick={() => setShowNewForm(true)}><Plus size={15} /> Add Match</Button>
      </div>

      {/* New Match Form */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="card w-full max-w-xl p-6 my-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>New Match Analysis</h2>
              <button onClick={() => setShowNewForm(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label block mb-1">Match Title *</label>
                  <input className="input-base text-sm" placeholder="Ajman FC vs Al Ain" value={newMatch.title}
                    onChange={e => setNewMatch(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="label block mb-1">Opponent *</label>
                  <input className="input-base text-sm" placeholder="Al Ain FC" value={newMatch.opponent}
                    onChange={e => setNewMatch(f => ({ ...f, opponent: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label block mb-1">Date</label>
                  <input type="date" className="input-base text-sm" value={newMatch.match_date}
                    onChange={e => setNewMatch(f => ({ ...f, match_date: e.target.value }))} />
                </div>
                <div>
                  <label className="label block mb-1">Competition</label>
                  <input className="input-base text-sm" placeholder="UAE Pro League" value={newMatch.competition}
                    onChange={e => setNewMatch(f => ({ ...f, competition: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label block mb-1">Our Score</label>
                  <input type="number" min={0} max={30} className="input-base text-sm" value={newMatch.home_score}
                    onChange={e => setNewMatch(f => ({ ...f, home_score: parseInt(e.target.value)||0 }))} />
                </div>
                <div>
                  <label className="label block mb-1">Opponent Score</label>
                  <input type="number" min={0} max={30} className="input-base text-sm" value={newMatch.away_score}
                    onChange={e => setNewMatch(f => ({ ...f, away_score: parseInt(e.target.value)||0 }))} />
                </div>
                <div>
                  <label className="label block mb-1">Possession %</label>
                  <input type="number" min={0} max={100} className="input-base text-sm" value={newMatch.possession}
                    onChange={e => setNewMatch(f => ({ ...f, possession: parseInt(e.target.value)||50 }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label block mb-1">Our Formation</label>
                  <select className="input-base text-sm" value={newMatch.formation}
                    onChange={e => setNewMatch(f => ({ ...f, formation: e.target.value }))}>
                    {FORMATIONS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label block mb-1">Opponent Formation</label>
                  <select className="input-base text-sm" value={newMatch.opponent_formation}
                    onChange={e => setNewMatch(f => ({ ...f, opponent_formation: e.target.value }))}>
                    {FORMATIONS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label block mb-1">Initial Coach Notes</label>
                <textarea className="input-base text-sm min-h-[70px]" placeholder="Quick notes from the match…"
                  value={newMatch.coach_notes} onChange={e => setNewMatch(f => ({ ...f, coach_notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={createMatch} loading={saving} className="flex-1"><Save size={14} /> Create Match</Button>
              <Button variant="secondary" onClick={() => setShowNewForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Match list */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Matches ({matches.length})</h2>
          {matches.length === 0 ? (
            <div className="card p-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              No matches yet.<br/>Click "Add Match" to start.
            </div>
          ) : matches.map(m => {
            const hs = parseInt(m.tags?.[0]??'0')||m.home_score;
            const as_ = parseInt(m.tags?.[1]??'0')||m.away_score;
            const win = hs > as_; const loss = hs < as_;
            return (
              <div key={m.id}
                className={`card p-3 cursor-pointer card-hover transition ${selected?.id===m.id?'border-brand-500 shadow-glow-orange':''}`}
                style={selected?.id===m.id?{borderColor:'#EA580C'}:{}}
                onClick={() => setSelected(m)}>
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{m.title}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{m.match_date}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-extrabold ${win?'text-emerald-600':loss?'text-red-600':'text-yellow-600'}`}>{hs}-{as_}</span>
                    <button onClick={e => { e.stopPropagation(); deleteMatch(m.id); }} className="text-slate-400 hover:text-red-500 ml-1">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                {m.events.length > 0 && <div className="text-[9px] mt-1 text-brand-500">{m.events.length} events tagged</div>}
                {m.ai_summary && <div className="text-[9px] text-emerald-500">✓ AI analysed</div>}
              </div>
            );
          })}
        </div>

        {/* Match detail */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="card p-12 text-center">
              <Film size={48} className="text-brand-200 mx-auto mb-3" />
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Select a match or add a new one</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Click "Add Match" to create your first match analysis</p>
              <Button onClick={() => setShowNewForm(true)} className="mt-4"><Plus size={14} /> Add Match</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Match header */}
              <div className="card p-5 gradient-brand-soft">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-xs font-bold text-brand-600 uppercase tracking-wide">{selected.competition||'Match'} · {selected.match_date}</div>
                    <div className="text-xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>{selected.title}</div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="pill-orange">{selected.formation}</span>
                      <span className="pill-slate">vs {selected.opponent_formation}</span>
                      <span className="pill-blue">{selected.possession}% poss.</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black">
                      <span className={selected.home_score > selected.away_score ? 'text-emerald-600' : 'text-red-600'}>{selected.home_score}</span>
                      <span className="text-2xl mx-2" style={{ color: 'var(--text-secondary)' }}>—</span>
                      <span className={selected.away_score > selected.home_score ? 'text-emerald-600' : 'text-red-600'}>{selected.away_score}</span>
                    </div>
                    <div className="text-xs font-bold mt-0.5">
                      {selected.home_score > selected.away_score ? '✅ WIN' : selected.home_score < selected.away_score ? '❌ LOSS' : '🤝 DRAW'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 card p-1 w-fit overflow-x-auto">
                {(['timeline','tactical','stats','ai'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0 capitalize ${activeTab===tab?'gradient-brand text-white shadow-glow-orange':'hover:bg-brand-50 dark:hover:bg-slate-700'}`}
                    style={{ color: activeTab===tab?undefined:'var(--text-secondary)' }}>
                    {tab === 'ai' ? '🤖 AI Analysis' : tab.charAt(0).toUpperCase()+tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Timeline */}
              {activeTab === 'timeline' && (
                <div className="card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Event Timeline</h3>
                    <button onClick={() => setAddingEvent(!addingEvent)}
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg gradient-brand text-white">
                      <Tag size={11} /> Tag Event
                    </button>
                  </div>

                  {addingEvent && (
                    <div className="card p-3 gradient-brand-soft space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="label block mb-1">Minute</label>
                          <input type="number" className="input-base text-sm" placeholder="0-120" min={0} max={120}
                            value={newEvent.time} onChange={e => setNewEvent(n => ({...n, time: parseInt(e.target.value)||0}))} />
                        </div>
                        <div>
                          <label className="label block mb-1">Event Type</label>
                          <select className="input-base text-sm" value={newEvent.type}
                            onChange={e => setNewEvent(n => ({...n, type: e.target.value}))}>
                            {EVENT_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input className="input-base text-sm col-span-1" placeholder="Player name"
                          value={newEvent.player} onChange={e => setNewEvent(n => ({...n, player: e.target.value}))} />
                        <input className="input-base text-sm col-span-1" placeholder="Description"
                          value={newEvent.description} onChange={e => setNewEvent(n => ({...n, description: e.target.value}))} />
                        <select className="input-base text-sm" value={newEvent.side}
                          onChange={e => setNewEvent(n => ({...n, side: e.target.value as any}))}>
                          <option value="home">Our Team</option>
                          <option value="away">Opponent</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={addEvent} className="px-3 py-1.5 rounded-lg gradient-brand text-white text-xs font-bold">Save</button>
                        <button onClick={() => setAddingEvent(false)} className="px-3 py-1.5 rounded-lg card text-xs" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Timeline bar */}
                  <div className="relative h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <div className="absolute inset-y-0 left-0 gradient-brand rounded-full" style={{ width: `${selected.possession}%`, opacity: 0.3 }} />
                    <div className="absolute inset-y-0 left-[50%] w-px bg-slate-400" />
                    {selected.events.map(ev => {
                      const col = EVENT_TYPES.find(t => t.type === ev.type)?.color || 'bg-slate-400';
                      return (
                        <div key={ev.id}
                          className={`absolute top-1 bottom-1 w-2 rounded-full ${col} ${ev.side==='home'?'top-1':'bottom-1'}`}
                          style={{ left: `${Math.min((ev.time/90)*100, 99)}%`, transform:'translateX(-50%)' }}
                          title={`${ev.time}' ${ev.player} — ${ev.type}`} />
                      );
                    })}
                    <span className="absolute left-1 top-0.5 text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>1'</span>
                    <span className="absolute left-[50%] top-0.5 text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>HT</span>
                    <span className="absolute right-1 top-0.5 text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>90'</span>
                  </div>

                  {/* Events list */}
                  {selected.events.length === 0 ? (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No events tagged yet. Click "Tag Event" to add match events.</p>
                  ) : (
                    <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
                      {fh.length > 0 && <div className="label">First Half</div>}
                      {fh.map(ev => (
                        <div key={ev.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${ev.side==='home'?'gradient-brand-soft':'bg-slate-50 dark:bg-slate-800'}`}>
                          <span className="font-bold text-brand-600 w-8 flex-shrink-0">{ev.time}'</span>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_TYPES.find(t=>t.type===ev.type)?.color||'bg-slate-400'}`} />
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{EVENT_TYPES.find(t=>t.type===ev.type)?.label||ev.type}</span>
                          <span className="text-brand-600">{ev.player}</span>
                          <span className="flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{ev.description}</span>
                          <span className={ev.side==='home'?'pill-green':'pill-red'}>{ev.side==='home'?'US':'OPP'}</span>
                        </div>
                      ))}
                      {fh.length > 0 && sh.length > 0 && (
                        <div className="flex items-center gap-2 py-1">
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                          <span className="text-[10px] font-bold pill-slate">HALF TIME</span>
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                        </div>
                      )}
                      {sh.length > 0 && <div className="label">Second Half</div>}
                      {sh.map(ev => (
                        <div key={ev.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${ev.side==='home'?'gradient-brand-soft':'bg-slate-50 dark:bg-slate-800'}`}>
                          <span className="font-bold text-brand-600 w-8 flex-shrink-0">{ev.time}'</span>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_TYPES.find(t=>t.type===ev.type)?.color||'bg-slate-400'}`} />
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{EVENT_TYPES.find(t=>t.type===ev.type)?.label||ev.type}</span>
                          <span className="text-brand-600">{ev.player}</span>
                          <span className="flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{ev.description}</span>
                          <span className={ev.side==='home'?'pill-green':'pill-red'}>{ev.side==='home'?'US':'OPP'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tactical */}
              {activeTab === 'tactical' && (
                <div className="card p-4">
                  <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Tactical View — {selected.formation}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Pitch */}
                    <div className="aspect-[2/3] pitch-bg rounded-xl relative overflow-hidden">
                      <div className="absolute inset-3 border border-white/20 rounded" />
                      <div className="absolute top-1/2 left-3 right-3 h-px bg-white/20" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20" />
                      {/* Possession bar */}
                      <div className="absolute bottom-2 left-3 right-3 h-2 rounded bg-white/20">
                        <div className="h-full gradient-brand rounded" style={{ width: `${selected.possession}%` }} />
                      </div>
                      <div className="absolute bottom-5 left-3 text-[9px] text-white/70 font-bold">US {selected.possession}%</div>
                      <div className="absolute bottom-5 right-3 text-[9px] text-white/70 font-bold">{100-selected.possession}% OPP</div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="label mb-2">Match Stats</div>
                        {[
                          { label: 'Our Goals', us: selected.home_score, them: selected.away_score },
                          { label: 'Possession', us: selected.possession, them: 100-selected.possession, pct: true },
                          { label: 'Our Events', us: selected.events.filter(e=>e.side==='home').length, them: selected.events.filter(e=>e.side==='away').length },
                        ].map(({ label, us, them, pct }) => (
                          <div key={label} className="mb-2">
                            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                              <span className="font-semibold text-brand-600">{us}{pct?'%':''}</span>
                              <span>{label}</span>
                              <span>{them}{pct?'%':''}</span>
                            </div>
                            <div className="flex h-1.5 rounded overflow-hidden gap-0.5">
                              <div className="gradient-brand rounded-l" style={{ width: `${us/(us+them||1)*100}%` }} />
                              <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-r" />
                            </div>
                          </div>
                        ))}
                      </div>
                      {selected.coach_notes && (
                        <div>
                          <div className="label mb-1">Coach Notes</div>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selected.coach_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              {activeTab === 'stats' && (
                <div className="card p-4">
                  <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Match Statistics</h3>
                  <div className="grid grid-cols-3 gap-3 text-center mb-4">
                    <div className="card p-3 gradient-brand-soft">
                      <div className="text-2xl font-extrabold text-brand-600">{selected.events.filter(e=>e.type==='goal'&&e.side==='home').length}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Goals</div>
                    </div>
                    <div className="card p-3 gradient-brand-soft">
                      <div className="text-2xl font-extrabold text-blue-600">{selected.possession}%</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Possession</div>
                    </div>
                    <div className="card p-3 gradient-brand-soft">
                      <div className="text-2xl font-extrabold text-purple-600">{selected.events.filter(e=>e.type==='shot'&&e.side==='home').length}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Shots</div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead><tr><th>Event Type</th><th>Our Team</th><th>Opponent</th></tr></thead>
                      <tbody>
                        {EVENT_TYPES.filter(et => selected.events.some(e => e.type === et.type)).map(et => (
                          <tr key={et.type}>
                            <td>{et.label}</td>
                            <td className="font-bold text-brand-600">{selected.events.filter(e=>e.type===et.type&&e.side==='home').length}</td>
                            <td className="font-bold text-slate-600">{selected.events.filter(e=>e.type===et.type&&e.side==='away').length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AI */}
              {activeTab === 'ai' && (
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>🤖 AI Match Analysis</h3>
                    <Button size="sm" onClick={generateAI} loading={aiLoading}>
                      {aiLoading ? 'Analysing…' : '⚡ Generate / Refresh'}
                    </Button>
                  </div>
                  {selected.ai_summary ? (
                    <div className="space-y-1">
                      {selected.ai_summary.split('\n').map((line, i) => {
                        if (line.startsWith('## ') || line.startsWith('**') && line.endsWith('**'))
                          return <div key={i} className="font-bold text-sm text-brand-700 dark:text-brand-400 mt-3">{line.replace(/[#*]/g,'')}</div>;
                        if (line.startsWith('- ') || line.startsWith('• '))
                          return <div key={i} className="text-xs flex gap-1.5" style={{ color: 'var(--text-primary)' }}><span className="text-brand-500">•</span>{line.replace(/^[-•] /,'')}</div>;
                        if (!line.trim()) return <div key={i} className="h-1" />;
                        return <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{line}</p>;
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain size={36} className="text-brand-200 mx-auto mb-2" />
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Click "Generate" for AI tactical analysis of this match</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Tip: Tag more events first for a richer analysis</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
