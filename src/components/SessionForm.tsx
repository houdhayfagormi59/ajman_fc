'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { Team } from '@/lib/types';

interface Props { teams: Team[]; onSaved: () => void; }

const FOCUS_AREAS = [
  { value: 'attacking', label: 'Attacking Organisation' },
  { value: 'defending', label: 'Defensive Organisation' },
  { value: 'transitions', label: 'Transitions' },
  { value: 'set_pieces', label: 'Set Pieces' },
  { value: 'physical', label: 'Physical Conditioning' },
  { value: 'tactical', label: 'General Tactical' },
  { value: 'technical', label: 'Technical Skills' },
  { value: 'mental', label: 'Mental / Psychological' },
];

const PHASES = [
  { value: 'pre_season', label: 'Pre-Season' },
  { value: 'early_season', label: 'Early Season' },
  { value: 'mid_season', label: 'Mid Season' },
  { value: 'late_season', label: 'Run-In' },
];

interface Exercise {
  id: string; name: string; duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  phase: 'warm_up' | 'main' | 'cool_down';
  description: string; coaching_points: string;
}

export default function SessionForm({ teams, onSaved }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [form, setForm] = useState({
    title: '', session_date: new Date().toISOString().split('T')[0],
    duration_minutes: 90, focus_area: 'tactical', location: '',
    coach_notes: '', team_id: '', intensity_level: 6, week_number: '',
    phase: '', objectives: '', rpe_target: 6,
  });

  function addExercise() {
    setExercises(ex => [...ex, {
      id: Math.random().toString(36).slice(2), name: '',
      duration_minutes: 15, intensity: 'medium',
      phase: exercises.length === 0 ? 'warm_up' : exercises.length === 1 ? 'main' : 'cool_down',
      description: '', coaching_points: '',
    }]);
  }

  function updateExercise(id: string, field: keyof Exercise, value: any) {
    setExercises(ex => ex.map(e => e.id === id ? { ...e, [field]: value } : e));
  }

  function removeExercise(id: string) {
    setExercises(ex => ex.filter(e => e.id !== id));
  }

  const totalDuration = exercises.reduce((s, e) => s + e.duration_minutes, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.session_date || !form.focus_area) {
      setError('Title, date and focus area are required.'); return;
    }
    setLoading(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

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
      tactical_setup: exercises.length > 0 ? JSON.stringify(exercises) : null,
      coach_id: user.id,
    });

    if (err) { setError(err.message); setLoading(false); return; }
    onSaved();
  }

  const phaseColors: Record<string, string> = {
    warm_up: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10',
    main: 'border-orange-500 bg-orange-50 dark:bg-orange-900/10',
    cool_down: 'border-blue-400 bg-blue-50 dark:bg-blue-900/10',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="card p-3 border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 text-sm rounded-lg">{error}</div>}

      {/* Basic Info */}
      <div className="card p-4 space-y-4">
        <div className="font-bold text-sm text-brand-700">Session Details</div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Session Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Defensive Shape — MD-4" />
          <Input label="Date *" type="date" value={form.session_date} onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))} />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Select label="Focus Area *" value={form.focus_area} onChange={e => setForm(f => ({ ...f, focus_area: e.target.value }))}>
            {FOCUS_AREAS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
          <Select label="Team" value={form.team_id} onChange={e => setForm(f => ({ ...f, team_id: e.target.value }))}>
            <option value="">All teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <Select label="Season Phase" value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value }))}>
            <option value="">Select phase…</option>
            {PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Training ground, Pitch 1…" />
          <Input label="Week Number" type="number" min={1} max={52} value={form.week_number} onChange={e => setForm(f => ({ ...f, week_number: e.target.value }))} placeholder="e.g. 14" />
          <Input label="Fallback Duration (min)" type="number" min={15} max={240} value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 90 }))} />
        </div>
      </div>

      {/* Load Management */}
      <div className="card p-4 space-y-4">
        <div className="font-bold text-sm text-brand-700">Training Load (RPE)</div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label block mb-2">Planned Session Intensity: <span className="text-brand-600 font-bold">{form.intensity_level}/10</span></label>
            <input type="range" min={1} max={10} value={form.intensity_level}
              onChange={e => setForm(f => ({ ...f, intensity_level: parseInt(e.target.value) }))} />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Recovery (1)</span><span>Moderate (5)</span><span>Maximal (10)</span>
            </div>
          </div>
          <div>
            <label className="label block mb-2">RPE Target for Players: <span className="text-brand-600 font-bold">{form.rpe_target}/10</span></label>
            <input type="range" min={1} max={10} value={form.rpe_target}
              onChange={e => setForm(f => ({ ...f, rpe_target: parseInt(e.target.value) }))} />
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="card p-4 space-y-3">
        <div className="font-bold text-sm text-brand-700">Session Objectives</div>
        <Input label="Main Objectives" value={form.objectives} onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))} placeholder="What are the 2-3 outcomes you want from this session?" />
        <div>
          <label className="label block mb-1">Coach Notes</label>
          <textarea className="input-base min-h-[80px] resize-y" value={form.coach_notes}
            onChange={e => setForm(f => ({ ...f, coach_notes: e.target.value }))}
            placeholder="Additional notes, context, individual focus points…" />
        </div>
      </div>

      {/* Exercise Builder */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-brand-700">Exercise Planner</div>
            {exercises.length > 0 && (
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Total: {totalDuration} minutes · {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <button type="button" onClick={addExercise} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg gradient-brand text-white hover:opacity-90">
            <Plus size={13} /> Add Exercise
          </button>
        </div>

        {exercises.length === 0 && (
          <div className="text-center py-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            No exercises added yet. Click "Add Exercise" to build your session plan.
          </div>
        )}

        {exercises.map((ex, idx) => (
          <div key={ex.id} className={`border-l-4 rounded-xl p-3 space-y-3 ${phaseColors[ex.phase]}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical size={14} style={{ color: 'var(--text-secondary)' }} />
                <span className="font-semibold text-xs text-brand-700">Exercise {idx + 1}</span>
              </div>
              <button type="button" onClick={() => removeExercise(ex.id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={13} />
              </button>
            </div>
            <div className="grid md:grid-cols-4 gap-2">
              <div className="md:col-span-2">
                <input className="input-base text-sm" placeholder="Exercise name *" value={ex.name}
                  onChange={e => updateExercise(ex.id, 'name', e.target.value)} />
              </div>
              <select className="input-base text-sm" value={ex.phase}
                onChange={e => updateExercise(ex.id, 'phase', e.target.value as any)}>
                <option value="warm_up">Warm-Up</option>
                <option value="main">Main Block</option>
                <option value="cool_down">Cool-Down</option>
              </select>
              <select className="input-base text-sm" value={ex.intensity}
                onChange={e => updateExercise(ex.id, 'intensity', e.target.value as any)}>
                <option value="low">Low intensity</option>
                <option value="medium">Medium intensity</option>
                <option value="high">High intensity</option>
              </select>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              <div>
                <input className="input-base text-sm" type="number" placeholder="Duration (min)" value={ex.duration_minutes}
                  onChange={e => updateExercise(ex.id, 'duration_minutes', parseInt(e.target.value) || 10)} />
              </div>
              <div>
                <input className="input-base text-sm" placeholder="Description / organisation" value={ex.description}
                  onChange={e => updateExercise(ex.id, 'description', e.target.value)} />
              </div>
              <div>
                <input className="input-base text-sm" placeholder="Coaching points" value={ex.coaching_points}
                  onChange={e => updateExercise(ex.id, 'coaching_points', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Save Session
      </Button>
    </form>
  );
}
