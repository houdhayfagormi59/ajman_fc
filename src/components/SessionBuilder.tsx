'use client';
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import TacticalBoard, { PitchElement } from './TacticalBoard';
import Input from './Input';

export interface SessionSection {
  id: string; title: string; duration_minutes: number; description: string; formation: string; elements: PitchElement[];
}

function uid() { return Math.random().toString(36).slice(2, 8); }

const defaults: SessionSection[] = [
  { id: uid(), title: 'Warm-up', duration_minutes: 15, description: '', formation: '4-3-3', elements: [] },
  { id: uid(), title: 'Technical Drills', duration_minutes: 20, description: '', formation: '4-3-3', elements: [] },
  { id: uid(), title: 'Tactical Work', duration_minutes: 25, description: '', formation: '4-3-3', elements: [] },
  { id: uid(), title: 'Match Play / Cool-down', duration_minutes: 20, description: '', formation: '4-3-3', elements: [] },
];

export default function SessionBuilder({ initial, onChange }: {
  initial?: SessionSection[]; onChange?: (sections: SessionSection[]) => void;
}) {
  const [sections, setSections] = useState<SessionSection[]>(initial?.length ? initial : defaults);
  const [openIdx, setOpenIdx] = useState(0);

  function update(idx: number, partial: Partial<SessionSection>) {
    const next = sections.map((s, i) => i === idx ? { ...s, ...partial } : s);
    setSections(next); onChange?.(next);
  }
  function add() {
    const next = [...sections, { id: uid(), title: `Section ${sections.length + 1}`, duration_minutes: 15, description: '', formation: '4-3-3', elements: [] }];
    setSections(next); setOpenIdx(next.length - 1); onChange?.(next);
  }
  function remove(idx: number) {
    if (sections.length <= 1) return;
    const next = sections.filter((_, i) => i !== idx);
    setSections(next); if (openIdx >= next.length) setOpenIdx(next.length - 1); onChange?.(next);
  }

  const total = sections.reduce((s, sec) => s + sec.duration_minutes, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Session Sections</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sections.length} sections · {total} min</p>
        </div>
        <button type="button" onClick={add} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg gradient-brand text-white">
          <Plus size={14} /> Add
        </button>
      </div>

      {sections.map((sec, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={sec.id} className="card overflow-hidden">
            <button type="button" onClick={() => setOpenIdx(isOpen ? -1 : idx)}
              className="w-full flex items-center justify-between px-4 py-2.5 gradient-brand-soft hover:opacity-90 transition">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full gradient-brand text-white text-[11px] font-bold flex items-center justify-center">{idx + 1}</span>
                <div className="text-left">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{sec.title}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{sec.duration_minutes} min · {sec.formation}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {sections.length > 1 && <span onClick={(e) => { e.stopPropagation(); remove(idx); }} className="p-1 rounded hover:bg-red-100 text-red-500"><Trash2 size={14} /></span>}
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            {isOpen && (
              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <Input label="Title" value={sec.title} onChange={(e) => update(idx, { title: e.target.value })} />
                  <Input label="Duration (min)" type="number" min={5} value={sec.duration_minutes} onChange={(e) => update(idx, { duration_minutes: Number(e.target.value) })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">Instructions</label>
                  <textarea className="input-base min-h-[60px]" value={sec.description} onChange={(e) => update(idx, { description: e.target.value })} placeholder="Drill details, focus points..." />
                </div>
                <div>
                  <label className="label mb-2 block">Tactical Pitch</label>
                  <TacticalBoard initialFormation={sec.formation} initialElements={sec.elements}
                    onChange={(elements, formation) => update(idx, { elements, formation })} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
