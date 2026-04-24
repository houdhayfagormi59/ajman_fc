'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/Button';
import { Plus, Trash2, ChevronLeft, Save, RotateCcw } from 'lucide-react';
import type { Team } from '@/lib/types';
import { AGE_GROUPS } from '@/lib/types';

const FOCUS_AREAS = [
  { value: 'attacking', label: '⚡ Attacking Organisation' },
  { value: 'defending', label: '🛡 Defensive Organisation' },
  { value: 'transitions', label: '↔ Transitions' },
  { value: 'set_pieces', label: '🚩 Set Pieces' },
  { value: 'physical', label: '🏋 Physical Conditioning' },
  { value: 'tactical', label: '🧠 General Tactical' },
  { value: 'technical', label: '⚽ Technical Skills' },
  { value: 'mental', label: '💬 Mental / Psychological' },
];

const PHASES_OF_PLAY = [
  { value: 'pre_season', label: 'Pre-Season' },
  { value: 'early_season', label: 'Early Season' },
  { value: 'mid_season', label: 'Mid Season' },
  { value: 'late_season', label: 'Run-In' },
];

const PRINCIPLES = [
  'AT1 — Playing Into Midfield', 'AT2 — Playing Into Striker',
  'AT3 — Creating Space & Time', 'AT4 — Sustained Possession',
  'AT5 — Scoring Opportunities', 'AT6 — Corresponding Play',
  'AT7 — Overlapping Play', 'AT8 — Third Man Runs',
  'DO1 — Delay / Contain', 'DO2 — Compact Defending',
  'DO3 — Occupying Passing Zones', 'DO10 — Defensive Organisation',
  'DT1 — Prevent Forward Pass', 'DT4 — Prevent Central Counter',
  'AT12 — Corner Kick Set Plays', 'AT15 — Free Kick Zones',
];

const EXERCISE_DB = [
  { name: 'Rondo 4v1', phase: 'warm_up', duration: 10, intensity: 'low', description: '4 players keep ball from 1 defender in a square. Focus on quick passes and movement.', coaching: 'Open body shape, play quick, communicate' },
  { name: 'Rondo 5v2', phase: 'warm_up', duration: 12, intensity: 'low', description: '5 keep ball from 2 defenders. Diamond shape. Max 2 touches.', coaching: 'Weight of pass, angles of support' },
  { name: 'Passing Patterns', phase: 'warm_up', duration: 10, intensity: 'low', description: 'Set passing sequences — A to B to C to D. Players follow their pass.', coaching: 'First touch direction, timing of run' },
  { name: 'Pressing Triggers Game', phase: 'main', duration: 15, intensity: 'high', description: '8v8 in half pitch. Agree pressing triggers (back pass, poor touch). Team presses as a unit.', coaching: 'Recognise trigger, cut passing lanes, press together' },
  { name: 'Positional Game 10v10', phase: 'main', duration: 20, intensity: 'high', description: 'Full team positional game on full pitch. Maintain shape in and out of possession.', coaching: 'Compactness, width, penetration' },
  { name: 'Build-Up vs High Press', phase: 'main', duration: 20, intensity: 'high', description: '7v5 in defensive half. GK + defenders + midfielder play out vs pressing attackers.', coaching: 'Patience, body shape, trigger press reset' },
  { name: 'Finishing Circuit', phase: 'main', duration: 15, intensity: 'high', description: 'Rotating finishing from different positions. Cross from right, through ball centre, cut-back left.', coaching: 'First touch, placement, timing of run' },
  { name: 'Defensive Shape 11v0', phase: 'main', duration: 15, intensity: 'medium', description: 'Walk-through of defensive 4-4-2 shape. Coach moves ball, team adjusts without pressure.', coaching: 'Compactness, communication, trigger press moments' },
  { name: 'Counter-Attack 4v3', phase: 'main', duration: 15, intensity: 'high', description: '4 attackers vs 3 defenders + GK. Simulate winning ball in midfield and transition.', coaching: 'Speed of transition, decision making, finish' },
  { name: 'Set Piece Rehearsal', phase: 'main', duration: 15, intensity: 'medium', description: 'Corner kicks — attack and defend. Walk through all coded routines at match pace.', coaching: 'Timing of runs, delivery quality, blocking' },
  { name: 'Small Sided Game 5v5', phase: 'main', duration: 20, intensity: 'high', description: '5v5 on small pitch. Goals only from team combinations. Encourages quick passing.', coaching: 'Movement off ball, 1-2 combos, pressing' },
  { name: 'Stretch & Mobility', phase: 'cool_down', duration: 10, intensity: 'low', description: 'Full body stretch sequence. Dynamic at start, static at end. Focus on hip flexors and hamstrings.', coaching: 'Hold 30 seconds each, breathe deeply' },
  { name: 'Team Debrief Circle', phase: 'cool_down', duration: 5, intensity: 'low', description: 'Coach gathers team for key messages. Players share observations. Set focus for next session.', coaching: '3 positives, 1 focus area' },
  { name: 'GK Distribution Patterns', phase: 'main', duration: 12, intensity: 'medium', description: 'GK plays short to CB, receives back, switches to full-back. Builds from back patterns.', coaching: 'Body shape, weight of pass, communication' },
  { name: 'Transition Game Win→Attack', phase: 'main', duration: 20, intensity: 'high', description: '8v8 with transition rules: when team wins ball they must attack within 3 passes.', coaching: 'Speed of decision, vertical pass first look' },
];

interface Exercise {
  id: string; name: string; phase: 'warm_up'|'main'|'cool_down';
  duration_minutes: number; intensity: 'low'|'medium'|'high';
  description: string; coaching_points: string; principle: string;
}

// Pitch drawing tool types
type PitchTool = { id: string; x: number; y: number; type: 'player_home'|'player_away'|'ball'|'cone'|'arrow'; label?: string; color?: string; };
type ArrowDraw = { x1:number;y1:number;x2:number;y2:number;id:string; };

export default function NewSessionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'details'|'exercises'|'pitch'>('details');
  const [showExerciseDB, setShowExerciseDB] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Pitch state
  const [pitchView, setPitchView] = useState<'full'|'half_attack'|'half_defend'>('full');
  const [pitchTools, setPitchTools] = useState<PitchTool[]>([]);
  const [arrows, setArrows] = useState<ArrowDraw[]>([]);
  const [activeTool, setActiveTool] = useState<'player_home'|'player_away'|'ball'|'cone'|'arrow'|'select'>('player_home');
  const [drawingArrow, setDrawingArrow] = useState<{x:number;y:number}|null>(null);
  const [playerCount, setPlayerCount] = useState({ home: 0, away: 0 });
  const pitchRef = useRef<SVGSVGElement>(null);

  const [form, setForm] = useState({
    title: '', session_date: new Date().toISOString().split('T')[0],
    duration_minutes: 90, focus_area: 'tactical', location: '',
    coach_notes: '', team_id: '', intensity_level: 6,
    week_number: '', phase: '', objectives: '', rpe_target: 6,
    principle: '',
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('teams').select('*').order('name');
      setTeams((data ?? []) as Team[]);
    })();
  }, []);

  function addFromDB(ex: typeof EXERCISE_DB[0]) {
    const newEx: Exercise = {
      id: Math.random().toString(36).slice(2),
      name: ex.name, phase: ex.phase as any,
      duration_minutes: ex.duration,
      intensity: ex.intensity as any,
      description: ex.description,
      coaching_points: ex.coaching,
      principle: '',
    };
    setExercises(e => [...e, newEx]);
    setShowExerciseDB(false);
  }

  function addBlankExercise() {
    setExercises(e => [...e, {
      id: Math.random().toString(36).slice(2), name: '',
      phase: exercises.length === 0 ? 'warm_up' : exercises.length < 3 ? 'main' : 'cool_down',
      duration_minutes: 15, intensity: 'medium', description: '', coaching_points: '', principle: '',
    }]);
  }

  function updateEx(id: string, field: keyof Exercise, val: any) {
    setExercises(e => e.map(ex => ex.id === id ? { ...ex, [field]: val } : ex));
  }

  // Pitch click handler
  function handlePitchClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (activeTool === 'arrow') {
      if (!drawingArrow) {
        setDrawingArrow({ x, y });
      } else {
        setArrows(a => [...a, { id: Math.random().toString(36).slice(2), x1: drawingArrow.x, y1: drawingArrow.y, x2: x, y2: y }]);
        setDrawingArrow(null);
      }
      return;
    }

    if (activeTool === 'select') return;

    const label = activeTool === 'player_home'
      ? String(playerCount.home + 1)
      : activeTool === 'player_away'
      ? String.fromCharCode(65 + playerCount.away) // A, B, C...
      : undefined;

    setPitchTools(t => [...t, { id: Math.random().toString(36).slice(2), x, y, type: activeTool, label }]);
    if (activeTool === 'player_home') setPlayerCount(c => ({ ...c, home: c.home + 1 }));
    if (activeTool === 'player_away') setPlayerCount(c => ({ ...c, away: c.away + 1 }));
  }

  function clearPitch() {
    setPitchTools([]); setArrows([]); setDrawingArrow(null);
    setPlayerCount({ home: 0, away: 0 });
  }

  function removeTool(id: string) { setPitchTools(t => t.filter(tool => tool.id !== id)); }

  const totalDuration = exercises.reduce((s, e) => s + e.duration_minutes, 0);

  async function handleSave() {
    if (!form.title || !form.session_date) { setError('Title and date are required.'); return; }
    setSaving(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setSaving(false); return; }

    const pitchData = { tools: pitchTools, arrows, view: pitchView };

    const { error: err } = await supabase.from('sessions').insert({
      title: form.title, session_date: form.session_date,
      duration_minutes: totalDuration || form.duration_minutes,
      focus_area: form.focus_area, location: form.location || null,
      coach_notes: form.coach_notes || null,
      team_id: form.team_id || null,
      intensity_level: form.intensity_level,
      week_number: form.week_number ? parseInt(form.week_number) : null,
      phase: form.phase || null,
      objectives: form.objectives || null,
      rpe_target: form.rpe_target,
      tactical_setup: exercises.length > 0 ? JSON.stringify(exercises) : JSON.stringify({ pitch: pitchData }),
      coach_id: user.id,
    });

    if (err) { setError(err.message); setSaving(false); return; }
    router.push('/dashboard/sessions');
  }

  const pitchH = pitchView === 'full' ? 340 : 200;

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg card hover:bg-brand-50 transition">
          <ChevronLeft size={16} />
        </button>
        <div>
          <h1 className="section-header">New Training Session</h1>
          <p className="section-sub">Build your session plan with exercises and pitch diagram</p>
        </div>
      </div>

      {error && (
        <div className="card p-3 border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {/* Section tabs */}
      <div className="flex gap-1 card p-1 w-fit">
        {([['details','📋 Details'],['exercises','⚽ Exercises'],['pitch','🏟 Pitch']] as const).map(([key,label]) => (
          <button key={key} onClick={() => setActiveSection(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeSection===key?'gradient-brand text-white shadow-glow-orange':'hover:bg-brand-50 dark:hover:bg-slate-700'}`}
            style={{ color: activeSection===key?undefined:'var(--text-secondary)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* DETAILS */}
      {activeSection === 'details' && (
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <div className="font-bold text-sm text-brand-700">Session Info</div>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="label block mb-1">Session Title *</label>
                <input className="input-base" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Defensive Shape — MD-4" /></div>
              <div><label className="label block mb-1">Date *</label>
                <input type="date" className="input-base" value={form.session_date} onChange={e => setForm(f => ({...f, session_date: e.target.value}))} /></div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div><label className="label block mb-1">Focus Area</label>
                <select className="input-base text-sm" value={form.focus_area} onChange={e => setForm(f => ({...f, focus_area: e.target.value}))}>
                  {FOCUS_AREAS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select></div>
              <div><label className="label block mb-1">Team</label>
                <select className="input-base text-sm" value={form.team_id} onChange={e => setForm(f => ({...f, team_id: e.target.value}))}>
                  <option value="">All teams</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select></div>
              <div><label className="label block mb-1">Season Phase</label>
                <select className="input-base text-sm" value={form.phase} onChange={e => setForm(f => ({...f, phase: e.target.value}))}>
                  <option value="">Select…</option>
                  {PHASES_OF_PLAY.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select></div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div><label className="label block mb-1">Location</label>
                <input className="input-base" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} placeholder="Pitch 1, Main Stadium…" /></div>
              <div><label className="label block mb-1">Week Number</label>
                <input type="number" className="input-base" value={form.week_number} onChange={e => setForm(f => ({...f, week_number: e.target.value}))} placeholder="e.g. 14" /></div>
              <div><label className="label block mb-1">Default Duration (min)</label>
                <input type="number" className="input-base" value={form.duration_minutes} onChange={e => setForm(f => ({...f, duration_minutes: parseInt(e.target.value)||90}))} /></div>
            </div>
            <div><label className="label block mb-1">Game Principle Link</label>
              <select className="input-base text-sm" value={form.principle} onChange={e => setForm(f => ({...f, principle: e.target.value}))}>
                <option value="">Link to a game principle…</option>
                {PRINCIPLES.map(p => <option key={p} value={p}>{p}</option>)}
              </select></div>
            <div><label className="label block mb-1">Session Objectives</label>
              <input className="input-base" value={form.objectives} onChange={e => setForm(f => ({...f, objectives: e.target.value}))} placeholder="2-3 outcomes you want from this session…" /></div>
            <div><label className="label block mb-1">Coach Notes</label>
              <textarea className="input-base min-h-[70px] resize-y" value={form.coach_notes} onChange={e => setForm(f => ({...f, coach_notes: e.target.value}))} placeholder="Context, individual focus points, injury considerations…" /></div>
          </div>

          <div className="card p-5">
            <div className="font-bold text-sm text-brand-700 mb-3">Training Load (RPE)</div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label block mb-2">Session Intensity: <span className="text-brand-600 font-bold">{form.intensity_level}/10</span></label>
                <input type="range" min={1} max={10} value={form.intensity_level} onChange={e => setForm(f => ({...f, intensity_level: parseInt(e.target.value)}))} />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  <span>Recovery (1)</span><span>Moderate (5)</span><span>Maximal (10)</span>
                </div>
              </div>
              <div>
                <label className="label block mb-2">Player RPE Target: <span className="text-brand-600 font-bold">{form.rpe_target}/10</span></label>
                <input type="range" min={1} max={10} value={form.rpe_target} onChange={e => setForm(f => ({...f, rpe_target: parseInt(e.target.value)}))} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXERCISES */}
      {activeSection === 'exercises' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Exercise Planner</div>
              {exercises.length > 0 && <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {exercises.length} exercises · {totalDuration} minutes total
              </div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowExerciseDB(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg card border text-xs font-semibold hover:bg-brand-50 transition"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                📚 Exercise Library
              </button>
              <button onClick={addBlankExercise}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-brand text-white text-xs font-bold">
                <Plus size={12} /> Add Exercise
              </button>
            </div>
          </div>

          {/* Exercise Library Modal */}
          {showExerciseDB && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="card w-full max-w-2xl p-5 max-h-[80vh] overflow-y-auto animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>📚 Exercise Library</h3>
                  <button onClick={() => setShowExerciseDB(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Plus size={16} className="rotate-45" /></button>
                </div>
                <div className="space-y-2">
                  {EXERCISE_DB.map((ex, i) => (
                    <div key={i} className="card p-3 flex items-start justify-between gap-3 hover:bg-brand-50 dark:hover:bg-slate-700 transition">
                      <div className="flex-1">
                        <div className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          {ex.name}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ex.phase==='warm_up'?'bg-yellow-100 text-yellow-700':ex.phase==='cool_down'?'bg-blue-100 text-blue-700':'bg-orange-100 text-orange-700'}`}>
                            {ex.phase.replace('_',' ')}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ex.intensity==='high'?'bg-red-100 text-red-700':ex.intensity==='medium'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>
                            {ex.intensity}
                          </span>
                          <span className="text-[10px] text-slate-400">{ex.duration}min</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{ex.description}</div>
                        <div className="text-xs mt-0.5 text-brand-600">→ {ex.coaching}</div>
                      </div>
                      <button onClick={() => addFromDB(ex)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg gradient-brand text-white text-xs font-bold">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {exercises.length === 0 ? (
            <div className="card p-8 text-center border-dashed border-2" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No exercises yet. Use the <strong>Exercise Library</strong> or <strong>Add Exercise</strong> to build your session.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {['warm_up','main','cool_down'].map(phase => {
                const phaseExercises = exercises.filter(e => e.phase === phase);
                if (phaseExercises.length === 0) return null;
                const phaseLabel = phase==='warm_up'?'🌡 Warm-Up':phase==='cool_down'?'❄️ Cool-Down':'⚡ Main Block';
                const borderCol = phase==='warm_up'?'border-yellow-400':phase==='cool_down'?'border-blue-400':'border-brand-500';
                return (
                  <div key={phase}>
                    <div className="label mb-2">{phaseLabel} ({phaseExercises.reduce((s,e)=>s+e.duration_minutes,0)} min)</div>
                    {phaseExercises.map(ex => (
                      <div key={ex.id} className={`card p-3 mb-2 border-l-4 ${borderCol} space-y-2`}>
                        <div className="flex items-start gap-2">
                          <input className="input-base text-sm flex-1" placeholder="Exercise name *"
                            value={ex.name} onChange={e => updateEx(ex.id, 'name', e.target.value)} />
                          <select className="input-base text-sm w-28" value={ex.phase}
                            onChange={e => updateEx(ex.id, 'phase', e.target.value)}>
                            <option value="warm_up">Warm-Up</option>
                            <option value="main">Main</option>
                            <option value="cool_down">Cool-Down</option>
                          </select>
                          <select className="input-base text-sm w-24" value={ex.intensity}
                            onChange={e => updateEx(ex.id, 'intensity', e.target.value)}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <input type="number" className="input-base text-sm w-20" placeholder="Min" min={1} max={120}
                            value={ex.duration_minutes} onChange={e => updateEx(ex.id, 'duration_minutes', parseInt(e.target.value)||10)} />
                          <button onClick={() => setExercises(exs => exs.filter(e => e.id !== ex.id))}
                            className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input className="input-base text-xs" placeholder="Description / organisation"
                            value={ex.description} onChange={e => updateEx(ex.id, 'description', e.target.value)} />
                          <input className="input-base text-xs" placeholder="Coaching points"
                            value={ex.coaching_points} onChange={e => updateEx(ex.id, 'coaching_points', e.target.value)} />
                        </div>
                        <select className="input-base text-xs" value={ex.principle}
                          onChange={e => updateEx(ex.id, 'principle', e.target.value)}>
                          <option value="">Link to game principle (optional)…</option>
                          {PRINCIPLES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PITCH */}
      {activeSection === 'pitch' && (
        <div className="space-y-3">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>🏟 Tactical Pitch Board</div>
              <div className="flex gap-2 flex-wrap">
                {(['full','half_attack','half_defend'] as const).map(v => (
                  <button key={v} onClick={() => setPitchView(v)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${pitchView===v?'gradient-brand text-white':'card border'}`}
                    style={pitchView!==v?{borderColor:'var(--border)',color:'var(--text-secondary)'}:{}}>
                    {v==='full'?'Full Pitch':v==='half_attack'?'Attacking Half':'Defensive Half'}
                  </button>
                ))}
                <button onClick={clearPitch} className="text-xs px-3 py-1.5 rounded-lg card border text-red-500 hover:bg-red-50 transition"
                  style={{ borderColor: 'var(--border)' }}>
                  <RotateCcw size={11} className="inline mr-1" />Clear
                </button>
              </div>
            </div>

            {/* Tool palette */}
            <div className="flex gap-2 flex-wrap mb-3">
              {[
                { id: 'player_home', label: '🔵 Our Player', active: 'gradient-brand' },
                { id: 'player_away', label: '🔴 Opponent', active: 'bg-red-500' },
                { id: 'ball', label: '⚽ Ball', active: 'bg-yellow-500' },
                { id: 'cone', label: '🟠 Cone', active: 'bg-orange-500' },
                { id: 'arrow', label: '→ Arrow', active: 'bg-purple-500' },
                { id: 'select', label: '✋ Select', active: 'bg-slate-500' },
              ].map(tool => (
                <button key={tool.id} onClick={() => { setActiveTool(tool.id as any); setDrawingArrow(null); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${activeTool===tool.id?`${tool.active} text-white`:'card border'}`}
                  style={activeTool!==tool.id?{borderColor:'var(--border)',color:'var(--text-secondary)'}:{}}>
                  {tool.label}
                </button>
              ))}
              {drawingArrow && <span className="text-xs pill-yellow animate-pulse-soft">Click to end arrow</span>}
            </div>

            {/* SVG Pitch */}
            <svg
              ref={pitchRef}
              viewBox={`0 0 100 ${pitchView==='full'?65:35}`}
              className="w-full rounded-xl cursor-crosshair select-none"
              style={{ background: '#166534', height: pitchH }}
              onClick={handlePitchClick}
            >
              {/* Pitch markings */}
              {pitchView === 'full' ? (
                <>
                  <rect x="3" y="3" width="94" height="59" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" rx="0.5" />
                  <line x1="3" y1="32.5" x2="97" y2="32.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                  <circle cx="50" cy="32.5" r="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                  <circle cx="50" cy="32.5" r="0.5" fill="rgba(255,255,255,0.6)" />
                  {/* Penalty areas */}
                  <rect x="21" y="3" width="58" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
                  <rect x="35" y="3" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
                  <rect x="21" y="48" width="58" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
                  <rect x="35" y="56" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
                  {/* Goals */}
                  <rect x="42" y="1" width="16" height="2.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
                  <rect x="42" y="61.5" width="16" height="2.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
                </>
              ) : pitchView === 'half_attack' ? (
                <>
                  <rect x="3" y="3" width="94" height="29" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                  <line x1="3" y1="3" x2="97" y2="3" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                  <rect x="21" y="3" width="58" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
                  <rect x="35" y="3" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
                  <rect x="42" y="0.5" width="16" height="2.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="94" height="29" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                  <rect x="21" y="18" width="58" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
                  <rect x="35" y="25" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
                  <rect x="42" y="30" width="16" height="2.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
                </>
              )}

              {/* Arrows */}
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
                  <polygon points="0 0, 6 2, 0 4" fill="rgba(255,255,100,0.9)" />
                </marker>
              </defs>
              {arrows.map(a => (
                <line key={a.id} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                  stroke="rgba(255,255,100,0.9)" strokeWidth="0.8" strokeDasharray="2,1"
                  markerEnd="url(#arrowhead)" />
              ))}

              {/* Tools */}
              {pitchTools.map(tool => (
                <g key={tool.id} onClick={e => { if (activeTool==='select') { e.stopPropagation(); removeTool(tool.id); }}}>
                  {tool.type === 'player_home' && (
                    <>
                      <circle cx={tool.x} cy={tool.y} r="3" fill="#EA580C" stroke="white" strokeWidth="0.5" />
                      {tool.label && <text x={tool.x} y={tool.y+1} textAnchor="middle" dominantBaseline="middle" fontSize="2.5" fill="white" fontWeight="bold">{tool.label}</text>}
                    </>
                  )}
                  {tool.type === 'player_away' && (
                    <>
                      <circle cx={tool.x} cy={tool.y} r="3" fill="#dc2626" stroke="white" strokeWidth="0.5" />
                      {tool.label && <text x={tool.x} y={tool.y+1} textAnchor="middle" dominantBaseline="middle" fontSize="2.5" fill="white" fontWeight="bold">{tool.label}</text>}
                    </>
                  )}
                  {tool.type === 'ball' && (
                    <circle cx={tool.x} cy={tool.y} r="2" fill="white" stroke="#ccc" strokeWidth="0.3" />
                  )}
                  {tool.type === 'cone' && (
                    <polygon points={`${tool.x},${tool.y-2.5} ${tool.x-2},${tool.y+2} ${tool.x+2},${tool.y+2}`} fill="#f97316" />
                  )}
                </g>
              ))}
            </svg>

            <div className="flex gap-3 mt-2 text-xs flex-wrap" style={{ color: 'var(--text-secondary)' }}>
              <span>🔵 Our players: {playerCount.home}</span>
              <span>🔴 Opponents: {playerCount.away}</span>
              <span>→ Arrows: {arrows.length}</span>
              {activeTool === 'select' && <span className="text-red-500 font-semibold">Select mode: click any item to remove it</span>}
            </div>
          </div>
        </div>
      )}

      {/* Save button always visible */}
      <div className="flex gap-3">
        <Button onClick={handleSave} loading={saving} className="flex-1">
          <Save size={15} /> Save Session
        </Button>
        <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
