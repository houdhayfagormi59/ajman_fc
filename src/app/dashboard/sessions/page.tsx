'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/Button';
import { Plus, Calendar, Clock, MapPin, Zap, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { Session } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const FOCUS_PILLS: Record<string, string> = {
  attacking: 'pill-orange', defending: 'pill-blue', transitions: 'pill-green',
  set_pieces: 'pill-yellow', physical: 'pill-red', tactical: 'pill-orange',
  technical: 'pill-blue', mental: 'pill-slate',
};

export default function SessionsPage() {
  const supabase = createClient();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('sessions')
        .select('*, session_players(count)')
        .order('session_date', { ascending: false });
      setSessions(data ?? []);
      setLoading(false);
    })();
  }, []);

  async function deleteSession(id: string, title: string) {
    if (!confirm(`Delete session "${title}"?`)) return;
    await supabase.from('sessions').delete().eq('id', id);
    setSessions(s => s.filter(sess => sess.id !== id));
  }

  const totalMins = sessions.reduce((s, sess) => s + (sess.duration_minutes||0), 0);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-header">Training Sessions</h1>
          <p className="section-sub">{sessions.length} sessions · {Math.round(totalMins/60)}h total training time</p>
        </div>
        <Link href="/dashboard/sessions/new"><Button><Plus size={16} /> New Session</Button></Link>
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 text-center gradient-brand-soft">
            <div className="text-xl font-extrabold text-brand-600">{sessions.length}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total sessions</div>
          </div>
          <div className="card p-3 text-center gradient-brand-soft">
            <div className="text-xl font-extrabold text-brand-600">{Math.round(totalMins/60)}h</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Training time</div>
          </div>
          <div className="card p-3 text-center gradient-brand-soft">
            <div className="text-xl font-extrabold text-brand-600">
              {sessions.filter(s => s.intensity_level).length > 0
                ? (sessions.reduce((s,sess) => s+(sess.intensity_level||0),0)/sessions.filter(s=>s.intensity_level).length).toFixed(1)
                : '—'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg RPE</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse" style={{ background: 'var(--bg-soft)' }} />)}</div>
      ) : sessions.length === 0 ? (
        <div className="card p-10 text-center">
          <Calendar size={40} className="mx-auto text-brand-300 mb-3" />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No sessions yet</p>
          <Link href="/dashboard/sessions/new" className="inline-block mt-4">
            <Button><Plus size={15} /> Plan First Session</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const exercises = s.tactical_setup ? (() => { try { return JSON.parse(s.tactical_setup); } catch { return []; } })() : [];
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id} className="card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                        <span className={FOCUS_PILLS[s.focus_area] || 'pill-slate'}>{s.focus_area?.replace(/_/g,' ')}</span>
                        {s.phase && <span className="pill-slate text-[10px]">{s.phase?.replace(/_/g,' ')}</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1"><Calendar size={11} className="text-brand-500" />{formatDate(s.session_date)}</span>
                        <span className="flex items-center gap-1"><Clock size={11} className="text-brand-500" />{s.duration_minutes}min</span>
                        {s.location && <span className="flex items-center gap-1"><MapPin size={11} className="text-brand-500" />{s.location}</span>}
                        {s.week_number && <span>Week {s.week_number}</span>}
                        <span>{s.session_players?.[0]?.count ?? 0} players</span>
                      </div>
                      {s.objectives && (
                        <div className="mt-2 text-xs px-2 py-1 rounded gradient-brand-soft" style={{ color: 'var(--text-secondary)' }}>
                          🎯 {s.objectives}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {s.intensity_level && (
                        <span className={`text-xs font-bold px-2 py-1 rounded ${s.intensity_level>=8?'bg-red-100 text-red-700':s.intensity_level>=6?'bg-orange-100 text-orange-700':'bg-yellow-100 text-yellow-700'}`}>
                          RPE {s.intensity_level}
                        </span>
                      )}
                      {exercises.length > 0 && (
                        <button onClick={() => setExpandedId(isExpanded ? null : s.id)}
                          className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-700 transition"
                          style={{ color: 'var(--text-secondary)' }}>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                      <button onClick={() => deleteSession(s.id, s.title)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exercises expanded */}
                {isExpanded && exercises.length > 0 && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
                    <div className="label">Session Plan ({exercises.length} exercises)</div>
                    {exercises.map((ex: any, i: number) => (
                      <div key={i} className={`p-2.5 rounded-lg border-l-4 text-xs ${ex.phase==='warm_up'?'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10':ex.phase==='cool_down'?'border-blue-400 bg-blue-50 dark:bg-blue-900/10':'border-brand-500 gradient-brand-soft'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{ex.name}</span>
                          <span className="flex gap-2">
                            <span className="pill-slate">{ex.phase?.replace(/_/g,' ')}</span>
                            <span className={ex.intensity==='high'?'pill-red':ex.intensity==='medium'?'pill-yellow':'pill-green'}>{ex.intensity}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{ex.duration_minutes}min</span>
                          </span>
                        </div>
                        {ex.description && <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{ex.description}</p>}
                        {ex.coaching_points && <p className="mt-0.5 text-brand-600 font-medium">→ {ex.coaching_points}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
