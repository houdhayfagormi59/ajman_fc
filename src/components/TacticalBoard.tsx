'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Undo2, Redo2, Trash2, Download } from 'lucide-react';

export interface PitchElement {
  id: string; type: 'player' | 'ball' | 'cone' | 'minigoal' | 'arrow' | 'dashed';
  x: number; y: number; x2?: number; y2?: number;
  label?: string; color?: string;
}

type ToolType = 'select' | 'player' | 'ball' | 'cone' | 'minigoal' | 'arrow' | 'dashed';

const COLORS: Record<string, string> = {
  player: '#EA580C', ball: '#1e293b', cone: '#eab308', minigoal: '#dc2626', arrow: '#2563eb', dashed: '#16a34a',
};

function uid() { return Math.random().toString(36).slice(2, 8); }

interface Props {
  initialElements?: PitchElement[];
  initialFormation?: string;
  onChange?: (elements: PitchElement[], formation: string) => void;
  onSave?: (setup: string) => void;
  readOnly?: boolean;
}

const FORMATIONS = ['4-3-3','4-2-3-1','3-5-2','5-3-2','4-4-2','3-4-3','4-1-4-1','5-4-1'];

export default function TacticalBoard({ initialElements = [], initialFormation = '4-3-3', onChange, onSave, readOnly }: Props) {
  const [formation, setFormation] = useState(initialFormation);
  const [elements, setElements] = useState<PitchElement[]>(initialElements);
  const [tool, setTool] = useState<ToolType>('select');
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<PitchElement[][]>([initialElements]);
  const [histIdx, setHistIdx] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const push = useCallback((els: PitchElement[]) => {
    setHistory((h) => [...h.slice(0, histIdx + 1), els]);
    setHistIdx((i) => i + 1);
  }, [histIdx]);

  function undo() { if (histIdx > 0) { setHistIdx((i) => i - 1); setElements(history[histIdx - 1]); } }
  function redo() { if (histIdx < history.length - 1) { setHistIdx((i) => i + 1); setElements(history[histIdx + 1]); } }

  useEffect(() => { onChange?.(elements, formation); }, [elements, formation]);

  function pt(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 65 };
  }

  function onDown(e: React.MouseEvent<SVGSVGElement>) {
    if (readOnly) return;
    const p = pt(e);
    if (tool === 'select') {
      const hit = [...elements].reverse().find((el) => Math.hypot(el.x - p.x, el.y - p.y) < 4);
      if (hit) { setSelected(hit.id); setDragging(hit.id); } else setSelected(null);
    } else if (tool === 'arrow' || tool === 'dashed') {
      setDrawStart(p);
    } else {
      const n: PitchElement = { id: uid(), type: tool, x: p.x, y: p.y, color: COLORS[tool] };
      const next = [...elements, n]; setElements(next); push(next);
    }
  }

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    if (dragging) {
      const p = pt(e);
      setElements((els) => els.map((el) => el.id === dragging ? { ...el, x: p.x, y: p.y } : el));
    }
  }

  function onUp(e: React.MouseEvent<SVGSVGElement>) {
    if (dragging) { setDragging(null); push(elements); }
    if (drawStart && (tool === 'arrow' || tool === 'dashed')) {
      const p = pt(e);
      const n: PitchElement = { id: uid(), type: tool, x: drawStart.x, y: drawStart.y, x2: p.x, y2: p.y, color: COLORS[tool] };
      const next = [...elements, n]; setElements(next); push(next); setDrawStart(null);
    }
  }

  function del() { if (!selected) return; const next = elements.filter((e) => e.id !== selected); setElements(next); setSelected(null); push(next); }
  function clear() { setElements([]); setSelected(null); push([]); }

  function exportSvg() {
    if (!svgRef.current) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svgRef.current)], { type: 'image/svg+xml' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `pitch-${formation}.svg`; a.click();
  }

  const tools: { type: ToolType; icon: string; label: string }[] = [
    { type: 'select', icon: '👆', label: 'Select' },
    { type: 'player', icon: '🟠', label: 'Player' },
    { type: 'ball', icon: '⚽', label: 'Ball' },
    { type: 'cone', icon: '🔺', label: 'Cone' },
    { type: 'minigoal', icon: '🥅', label: 'Goal' },
    { type: 'arrow', icon: '➡️', label: 'Arrow' },
    { type: 'dashed', icon: '┈', label: 'Pass' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {FORMATIONS.map((f) => (
          <button key={f} type="button" onClick={() => setFormation(f)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${formation === f ? 'gradient-brand text-white' : 'card hover:bg-brand-50 dark:hover:bg-slate-700'}`}
            style={{ color: formation === f ? undefined : 'var(--text-secondary)' }}
          >{f}</button>
        ))}
      </div>

      {!readOnly && (
        <div className="flex items-center gap-1 flex-wrap card p-2">
          {tools.map((t) => (
            <button key={t.type} type="button" onClick={() => setTool(t.type)}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${tool === t.type ? 'bg-brand-600 text-white' : 'hover:bg-brand-50 dark:hover:bg-slate-700'}`}
              style={{ color: tool === t.type ? undefined : 'var(--text-secondary)' }}
            ><span>{t.icon}</span> <span className="hidden sm:inline">{t.label}</span></button>
          ))}
          <div className="ml-auto flex gap-1">
            <button type="button" onClick={undo} className="p-1.5 rounded hover:bg-brand-50 dark:hover:bg-slate-700" title="Undo"><Undo2 size={15} /></button>
            <button type="button" onClick={redo} className="p-1.5 rounded hover:bg-brand-50 dark:hover:bg-slate-700" title="Redo"><Redo2 size={15} /></button>
            <button type="button" onClick={del} disabled={!selected} className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30" title="Delete"><Trash2 size={15} /></button>
            <button type="button" onClick={exportSvg} className="p-1.5 rounded hover:bg-brand-50 dark:hover:bg-slate-700" title="Export"><Download size={15} /></button>
          </div>
        </div>
      )}

      <svg ref={svgRef} viewBox="0 0 100 65" className="w-full rounded-xl border-2 border-green-700 bg-green-600 select-none"
        style={{ cursor: tool === 'select' ? 'default' : 'crosshair', touchAction: 'none' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
      >
        <rect x="2" y="2" width="96" height="61" fill="none" stroke="white" strokeWidth="0.4" rx="1" />
        <line x1="50" y1="2" x2="50" y2="63" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="32.5" r="9" fill="none" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="32.5" r="0.6" fill="white" />
        <rect x="2" y="15" width="14" height="35" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="2" y="22" width="5" height="21" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="84" y="15" width="14" height="35" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="93" y="22" width="5" height="21" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="0" y="27" width="2" height="11" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="98" y="27" width="2" height="11" fill="none" stroke="white" strokeWidth="0.5" />
        <text x="50" y="5" textAnchor="middle" fontSize="2" fill="rgba(255,255,255,0.4)" fontWeight="bold">{formation}</text>

        {elements.map((el) => {
          const sel = el.id === selected;
          if (el.type === 'player') return <circle key={el.id} cx={el.x} cy={el.y} r={2.5} fill={el.color} stroke={sel ? 'yellow' : 'transparent'} strokeWidth="0.5" opacity={0.9} />;
          if (el.type === 'ball') return <circle key={el.id} cx={el.x} cy={el.y} r={1.2} fill="white" stroke={sel ? 'yellow' : '#333'} strokeWidth="0.3" />;
          if (el.type === 'cone') return <polygon key={el.id} points={`${el.x},${el.y-1.5} ${el.x-1.2},${el.y+1} ${el.x+1.2},${el.y+1}`} fill={el.color} stroke={sel ? 'yellow' : 'transparent'} strokeWidth="0.3" />;
          if (el.type === 'minigoal') return <rect key={el.id} x={el.x-2} y={el.y-1.5} width={4} height={3} rx={0.3} fill="none" stroke={el.color} strokeWidth="0.5" />;
          if (el.type === 'arrow' && el.x2 != null && el.y2 != null) return (
            <g key={el.id}><defs><marker id={`a-${el.id}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill={el.color} /></marker></defs>
            <line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={el.color} strokeWidth={sel ? '0.8' : '0.5'} markerEnd={`url(#a-${el.id})`} /></g>
          );
          if (el.type === 'dashed' && el.x2 != null && el.y2 != null) return (
            <line key={el.id} x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={el.color} strokeWidth={sel ? '0.6' : '0.4'} strokeDasharray="1.5,1" />
          );
          return null;
        })}
      </svg>
      <p className="text-[11px] text-center" style={{ color: 'var(--text-secondary)' }}>Click to place · Drag to move · Arrow/Pass: click start then end</p>

      {onSave && (
        <button type="button" onClick={() => onSave(JSON.stringify({ formation, elements }))}
          className="px-4 py-2 gradient-brand text-white rounded-lg font-semibold shadow-glow-orange hover:opacity-90 transition">
          Save Tactical Setup
        </button>
      )}
    </div>
  );
}
