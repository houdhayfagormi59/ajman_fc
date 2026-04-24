'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Player, Evaluation } from '@/lib/types';
import { ChevronLeft, Save, Download, Star, Shield, Zap, Brain, Target } from 'lucide-react';

// Position-specific attribute sets
const POSITION_ATTRS: Record<string, { category: string; icon: string; attrs: { key: keyof Evaluation; label: string; tip: string }[] }[]> = {
  GK: [
    { category: 'Shot Stopping', icon: '🧤', attrs: [
      { key: 'tech_first_touch', label: 'Handling / Catch Quality', tip: 'Clean hands, secure catch, no fumbles' },
      { key: 'tech_shooting', label: 'Shot Stopping (Reflex)', tip: 'Quick reactions, correct body position' },
      { key: 'phy_speed', label: 'Agility / Footwork', tip: 'Lateral movement, dive technique' },
      { key: 'phy_strength', label: 'Aerial Command', tip: 'Claims crosses confidently, dominates box' },
    ]},
    { category: 'Distribution', icon: '🦶', attrs: [
      { key: 'tech_passing', label: 'Short Distribution', tip: 'Accurate passes to defenders under pressure' },
      { key: 'tech_dribbling', label: 'Long Distribution', tip: 'Goal kicks, throws, driving kicks to target' },
      { key: 'tac_positioning', label: 'Sweeper-Keeper Role', tip: 'Starting position, reading balls in behind' },
    ]},
    { category: 'Leadership & Mental', icon: '📢', attrs: [
      { key: 'men_concentration', label: 'Concentration', tip: 'Focus over 90 minutes, no lapses' },
      { key: 'men_confidence', label: 'Commanding Presence', tip: 'Organises defence, communicates clearly' },
      { key: 'men_teamwork', label: 'Communication', tip: '"Keeper!", "Away!", "Man On!" — clear commands' },
      { key: 'tac_decision_making', label: 'Decision Making', tip: 'When to come for crosses vs. stay' },
    ]},
  ],
  DEF: [
    { category: 'Defending', icon: '🛡', attrs: [
      { key: 'tac_positioning', label: 'Defensive Positioning', tip: 'Starting position vs ball and run' },
      { key: 'phy_strength', label: 'Physicality in Duels', tip: 'Aerial, ground, hold position' },
      { key: 'tech_first_touch', label: 'Tackle & Interception', tip: 'Clean tackles, reading passing lanes' },
      { key: 'tac_game_reading', label: 'Game Reading', tip: 'Anticipates danger before it develops' },
    ]},
    { category: 'Technical', icon: '⚽', attrs: [
      { key: 'tech_passing', label: 'Passing Accuracy', tip: 'Build-up quality, composure under press' },
      { key: 'tech_dribbling', label: 'Carrying / Dribbling', tip: 'Progress ball under pressure' },
      { key: 'phy_speed', label: 'Recovery Speed', tip: 'Get back behind ball, track runners' },
    ]},
    { category: 'Mental & Tactical', icon: '🧠', attrs: [
      { key: 'men_concentration', label: 'Concentration', tip: 'Maintain focus across 90 min' },
      { key: 'men_confidence', label: 'Confidence on Ball', tip: 'Does not panic under pressure' },
      { key: 'tac_decision_making', label: 'Decision Making', tip: 'When to hold, when to press, when to cover' },
      { key: 'phy_endurance', label: 'Endurance', tip: 'Maintains quality over full match' },
    ]},
  ],
  MID: [
    { category: 'Technical', icon: '⚽', attrs: [
      { key: 'tech_passing', label: 'Passing Accuracy', tip: 'Short, medium and long passes' },
      { key: 'tech_first_touch', label: 'First Touch', tip: 'Control under pressure, set up next action' },
      { key: 'tech_dribbling', label: 'Dribbling / Carrying', tip: 'Beat press, progress in tight spaces' },
      { key: 'tech_shooting', label: 'Shooting from Distance', tip: 'Arrive late, shoot with power and placement' },
    ]},
    { category: 'Tactical', icon: '🧠', attrs: [
      { key: 'tac_positioning', label: 'Positioning', tip: 'Between lines, half-spaces, support angles' },
      { key: 'tac_decision_making', label: 'Decision Making', tip: 'Press or hold, pass or carry' },
      { key: 'tac_game_reading', label: 'Game Reading', tip: 'Anticipate play, second ball, transitions' },
    ]},
    { category: 'Physical & Mental', icon: '💪', attrs: [
      { key: 'phy_endurance', label: 'Endurance', tip: 'Cover ground, press and recover x 90 min' },
      { key: 'phy_speed', label: 'Speed', tip: 'Transition speed, runs into channels' },
      { key: 'men_teamwork', label: 'Work Rate / Pressing', tip: 'Leads press, covers for teammates' },
      { key: 'men_confidence', label: 'Leadership in Midfield', tip: 'Dictates tempo, commands space' },
    ]},
  ],
  FWD: [
    { category: 'Attacking', icon: '🎯', attrs: [
      { key: 'tech_shooting', label: 'Finishing', tip: 'Placement, power, composure in front of goal' },
      { key: 'tech_dribbling', label: 'Dribbling', tip: '1v1, beat last man, create chances' },
      { key: 'tech_first_touch', label: 'First Touch', tip: 'Control in box, set up shot' },
      { key: 'tech_passing', label: 'Link-Up Play', tip: 'Hold-up, lay-off, combination passes' },
    ]},
    { category: 'Movement', icon: '💨', attrs: [
      { key: 'phy_speed', label: 'Speed / Acceleration', tip: 'Run in behind, race defenders' },
      { key: 'tac_positioning', label: 'Movement / Runs', tip: 'Third man, blindside, penalty box arrival' },
      { key: 'tac_decision_making', label: 'Decision in Final 3rd', tip: 'Shoot, pass or dribble — correct choice' },
    ]},
    { category: 'Mental', icon: '🔥', attrs: [
      { key: 'men_confidence', label: 'Confidence / Mentality', tip: 'Bounces back from misses, stays threat' },
      { key: 'men_concentration', label: 'Concentration', tip: 'Ready for one chance in 90 min' },
      { key: 'phy_strength', label: 'Physical Presence', tip: 'Hold defenders off, aerial threat' },
      { key: 'men_teamwork', label: 'Work Rate (Pressing)', tip: 'First line of defence — leads press' },
    ]},
  ],
};

function Slider({ label, tip, value, onChange }: { label: string; tip: string; value: number; onChange: (v: number) => void }) {
  const color = value >= 8 ? '#10b981' : value >= 6 ? '#f97316' : value >= 4 ? '#eab308' : '#ef4444';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{tip}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => onChange(n)}
              className="w-6 h-6 rounded-full text-xs font-bold transition-all border"
              style={{
                background: n <= value ? color : 'transparent',
                color: n <= value ? 'white' : 'var(--text-secondary)',
                borderColor: n <= value ? color : 'var(--border)',
                transform: n === value ? 'scale(1.2)' : 'scale(1)',
              }}>
              {n}
            </button>
          ))}
          <span className="w-8 text-right font-extrabold text-lg" style={{ color }}>{value}</span>
        </div>
      </div>
      <div className="progress-bar h-2">
        <div className="h-full rounded-full transition-all" style={{ width: `${value*10}%`, background: color }} />
      </div>
    </div>
  );
}

export default function PlayerReportPage({ params }: { params: { playerId: string } }) {
  const supabase = createClient();
  const [player, setPlayer] = useState<Player | null>(null);
  const [performances, setPerformances] = useState<any[]>([]);
  const [evalHistory, setEvalHistory] = useState<Evaluation[]>([]);
  const [evaluation, setEvaluation] = useState<Partial<Evaluation>>({
    tech_first_touch: 5, tech_passing: 5, tech_shooting: 5, tech_dribbling: 5,
    tac_positioning: 5, tac_decision_making: 5, tac_game_reading: 5,
    phy_speed: 5, phy_strength: 5, phy_endurance: 5,
    men_concentration: 5, men_confidence: 5, men_teamwork: 5,
    strengths: '', areas_to_improve: '', general_notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [activeTab, setActiveTab] = useState<'evaluate'|'history'|'ai'>('evaluate');

  useEffect(() => {
    (async () => {
      const [pR, eR, perfR] = await Promise.all([
        supabase.from('players').select('*').eq('id', params.playerId).single(),
        supabase.from('evaluations').select('*').eq('player_id', params.playerId).order('evaluation_date', { ascending: false }),
        supabase.from('performances').select('*').eq('player_id', params.playerId).order('match_date', { ascending: false }).limit(10),
      ]);
      if (pR.data) setPlayer(pR.data as Player);
      const allEvals = (eR.data ?? []) as Evaluation[];
      setEvalHistory(allEvals);
      if (allEvals[0]) setEvaluation(allEvals[0]);
      setPerformances(perfR.data ?? []);
      setLoading(false);
    })();
  }, [params.playerId]);

  function setVal(k: keyof Evaluation, v: any) {
    setEvaluation(ev => ({ ...ev, [k]: v }));
    setSaved(false);
  }

  async function saveEvaluation() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('evaluations').insert({
      player_id: params.playerId, coach_id: user?.id,
      evaluation_date: new Date().toISOString().split('T')[0],
      ...evaluation,
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
      // Refresh history
      const { data } = await supabase.from('evaluations').select('*').eq('player_id', params.playerId).order('evaluation_date', { ascending: false });
      setEvalHistory((data ?? []) as Evaluation[]);
    }
  }

  async function generateAI() {
    if (!player) return;
    setAiLoading(true);
    const context = `Player: ${player.first_name} ${player.last_name}
Position: ${player.position}
Age: ${player.date_of_birth}
Height: ${player.height_cm ?? 'N/A'} cm | Weight: ${player.weight_kg ?? 'N/A'} kg

Evaluation Scores (out of 10):
Technical — First Touch: ${evaluation.tech_first_touch}, Passing: ${evaluation.tech_passing}, Shooting: ${evaluation.tech_shooting}, Dribbling: ${evaluation.tech_dribbling}
Tactical — Positioning: ${evaluation.tac_positioning}, Decision Making: ${evaluation.tac_decision_making}, Game Reading: ${evaluation.tac_game_reading}
Physical — Speed: ${evaluation.phy_speed}, Strength: ${evaluation.phy_strength}, Endurance: ${evaluation.phy_endurance}
Mental — Concentration: ${evaluation.men_concentration}, Confidence: ${evaluation.men_confidence}, Teamwork: ${evaluation.men_teamwork}

Matches: ${performances.length} | Goals: ${performances.reduce((s,p)=>s+(p.goals||0),0)} | Assists: ${performances.reduce((s,p)=>s+(p.assists||0),0)}
Avg Rating: ${performances.length ? (performances.reduce((s,p)=>s+(p.rating||0),0)/performances.length).toFixed(1) : 'N/A'}

Coach Notes:
Strengths: ${evaluation.strengths || 'Not specified'}
Areas to improve: ${evaluation.areas_to_improve || 'Not specified'}
General notes: ${evaluation.general_notes || 'Not specified'}`;

    const systemPrompt = `You are an elite football analyst and player development specialist. Write a detailed, professional player report for a ${player?.position} with the following structure:

## 🏆 PLAYER SUMMARY
## ⚡ STRENGTHS (position-specific — minimum 5 detailed points)
## 🎯 DEVELOPMENT AREAS (minimum 5 with specific drills/solutions)
## 📊 ATTRIBUTE BREAKDOWN (technical, tactical, physical, mental)
## 🏋️ TRAINING RECOMMENDATIONS (position-specific exercises — minimum 6)
## 🔮 6-MONTH DEVELOPMENT PLAN
## 💡 TACTICAL USAGE ADVICE (for the head coach)

Be specific, use professional football terminology, reference the position requirements.`;

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'player_performance', systemPrompt, context, playerId: params.playerId }),
      });
      const data = await res.json();
      setAiReport(data.result || 'AI unavailable. Add GEMINI_API_KEY to environment variables.');
    } catch { setAiReport('Error generating report. Please check your AI API key.'); }
    setAiLoading(false);
  }

  function exportTxt() {
    if (!player) return;
    const lines = [
      `PLAYER REPORT — ${player.first_name} ${player.last_name}`,
      `Position: ${player.position} | Date: ${new Date().toLocaleDateString('en-GB')}`,
      '', '=== EVALUATION SCORES ===',
      `First Touch: ${evaluation.tech_first_touch}/10`, `Passing: ${evaluation.tech_passing}/10`,
      `Shooting: ${evaluation.tech_shooting}/10`, `Dribbling: ${evaluation.tech_dribbling}/10`,
      `Positioning: ${evaluation.tac_positioning}/10`, `Decision Making: ${evaluation.tac_decision_making}/10`,
      `Speed: ${evaluation.phy_speed}/10`, `Strength: ${evaluation.phy_strength}/10`,
      `Endurance: ${evaluation.phy_endurance}/10`, `Confidence: ${evaluation.men_confidence}/10`,
      '', '=== COACH NOTES ===',
      `Strengths: ${evaluation.strengths}`,
      `Areas to Improve: ${evaluation.areas_to_improve}`,
      `General Notes: ${evaluation.general_notes}`,
      ...(aiReport ? ['', '=== AI ANALYSIS ===', aiReport] : []),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${player.last_name}-report.txt`;
    a.click();
  }

  if (loading) return <div className="card p-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Loading report…</div>;
  if (!player) return <div className="card p-8 text-center text-sm text-red-500">Player not found.</div>;

  const posAttrs = POSITION_ATTRS[player.position] ?? POSITION_ATTRS.MID;
  const totalScore = [
    evaluation.tech_first_touch, evaluation.tech_passing, evaluation.tech_shooting, evaluation.tech_dribbling,
    evaluation.tac_positioning, evaluation.tac_decision_making, evaluation.tac_game_reading,
    evaluation.phy_speed, evaluation.phy_strength, evaluation.phy_endurance,
    evaluation.men_concentration, evaluation.men_confidence, evaluation.men_teamwork,
  ].filter(Boolean).reduce((s, v) => s + (v as number), 0);
  const numFields = 13;
  const ovr = Math.round((totalScore / (numFields * 10)) * 100);
  const ovrColor = ovr >= 75 ? '#10b981' : ovr >= 60 ? '#f97316' : ovr >= 45 ? '#eab308' : '#ef4444';

  return (
    <div className="space-y-5 max-w-5xl animate-fade-in-up">
      <Link href="/dashboard/reports" className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline">
        <ChevronLeft size={15} /> Back to Reports
      </Link>

      {/* Player Header */}
      <div className="card p-5 gradient-brand-soft">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-white font-extrabold text-2xl shadow-glow-orange flex-shrink-0">
            {player.photo_url
              ? <img src={player.photo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              : `${player.first_name[0]}${player.last_name[0]}`
            }
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {player.first_name} {player.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="pill-orange font-bold">{player.position === 'GK' ? '🧤 Goalkeeper' : player.position === 'DEF' ? '🛡 Defender' : player.position === 'MID' ? '⚙️ Midfielder' : '🎯 Forward'}</span>
              {player.age_group && <span className="pill-slate">{player.age_group}</span>}
              {player.jersey_number && <span className="pill-blue">#{player.jersey_number}</span>}
              <span className={`pill ${player.status === 'fit' ? 'pill-green' : player.status === 'injured' ? 'pill-red' : 'pill-yellow'}`}>{player.status}</span>
            </div>
          </div>
          {/* OVR Circle */}
          <div className="text-center flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
              style={{ borderColor: ovrColor }}>
              <div>
                <div className="text-xl font-black" style={{ color: ovrColor }}>{ovr}</div>
                <div className="text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>OVR</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={exportTxt}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg card border text-xs font-semibold hover:bg-brand-50 transition"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-4 mt-4 flex-wrap">
          <div className="text-center"><div className="font-extrabold text-xl text-brand-600">{performances.length}</div><div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Matches</div></div>
          <div className="text-center"><div className="font-extrabold text-xl text-emerald-600">{performances.reduce((s,p)=>s+(p.goals||0),0)}</div><div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Goals</div></div>
          <div className="text-center"><div className="font-extrabold text-xl text-blue-600">{performances.reduce((s,p)=>s+(p.assists||0),0)}</div><div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Assists</div></div>
          <div className="text-center"><div className="font-extrabold text-xl text-purple-600">{performances.length ? (performances.reduce((s,p)=>s+(p.rating||0),0)/performances.length).toFixed(1) : '—'}</div><div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg Rating</div></div>
          <div className="text-center"><div className="font-extrabold text-xl text-orange-600">{evalHistory.length}</div><div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Evaluations</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 card p-1 w-fit">
        {([['evaluate','📋 Evaluate'],['history','📅 History'],['ai','🤖 AI Report']] as const).map(([k,l]) => (
          <button key={k} onClick={() => setActiveTab(k as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab===k?'gradient-brand text-white shadow-glow-orange':'hover:bg-brand-50 dark:hover:bg-slate-700'}`}
            style={{ color: activeTab===k?undefined:'var(--text-secondary)' }}>
            {l}
          </button>
        ))}
      </div>

      {/* EVALUATE TAB */}
      {activeTab === 'evaluate' && (
        <div className="space-y-4">
          <div className="card p-2 flex items-center justify-between">
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {player.position}-specific evaluation template • Scores 1–10
            </div>
            <div className="flex gap-2">
              {saved && <span className="pill-green text-[11px]">✓ Saved</span>}
              <button onClick={saveEvaluation} disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-bold disabled:opacity-60 shadow-glow-orange">
                <Save size={13} /> {saving ? 'Saving…' : 'Save Evaluation'}
              </button>
            </div>
          </div>

          {posAttrs.map(({ category, icon, attrs }) => (
            <div key={category} className="card p-5 space-y-4">
              <div className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span>{icon}</span> {category}
                <span className="ml-auto text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
                  Avg: {(attrs.reduce((s, a) => s + ((evaluation[a.key] as number) || 0), 0) / attrs.length).toFixed(1)}/10
                </span>
              </div>
              <div className="space-y-4">
                {attrs.map(({ key, label, tip }) => (
                  <Slider key={key} label={label} tip={tip}
                    value={(evaluation[key] as number) || 5}
                    onChange={v => setVal(key, v)} />
                ))}
              </div>
            </div>
          ))}

          {/* Text fields */}
          <div className="card p-5 space-y-4">
            <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>📝 Coach Notes</div>
            <div>
              <label className="label block mb-1">Strengths (be specific)</label>
              <textarea className="input-base min-h-[80px] resize-y text-sm"
                placeholder="e.g. Excellent aerial ability, strong in 1v1 defending, good distribution under pressure…"
                value={evaluation.strengths as string || ''}
                onChange={e => setVal('strengths', e.target.value)} />
            </div>
            <div>
              <label className="label block mb-1">Areas to Improve (be specific)</label>
              <textarea className="input-base min-h-[80px] resize-y text-sm"
                placeholder="e.g. Left foot quality, pressing intensity, holding up play with back to goal…"
                value={evaluation.areas_to_improve as string || ''}
                onChange={e => setVal('areas_to_improve', e.target.value)} />
            </div>
            <div>
              <label className="label block mb-1">General Notes</label>
              <textarea className="input-base min-h-[70px] resize-y text-sm"
                placeholder="Training attitude, personality, injury history, tactical understanding…"
                value={evaluation.general_notes as string || ''}
                onChange={e => setVal('general_notes', e.target.value)} />
            </div>
            <button onClick={saveEvaluation} disabled={saving}
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold shadow-glow-orange hover:opacity-90 transition disabled:opacity-60">
              {saving ? 'Saving…' : '💾 Save Full Evaluation'}
            </button>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="card p-5">
          <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Evaluation History</h2>
          {evalHistory.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--text-secondary)' }}>No evaluations saved yet. Go to the Evaluate tab to create one.</p>
          ) : (
            <div className="space-y-3">
              {evalHistory.map((ev, i) => {
                const total = [ev.tech_first_touch, ev.tech_passing, ev.tech_shooting, ev.tech_dribbling, ev.tac_positioning, ev.tac_decision_making, ev.tac_game_reading, ev.phy_speed, ev.phy_strength, ev.phy_endurance, ev.men_concentration, ev.men_confidence, ev.men_teamwork].filter(Boolean);
                const avg = total.length ? (total.reduce((s, v) => s + (v ?? 0), 0) / total.length).toFixed(1) : '—';
                const ovr = total.length ? Math.round((total.reduce((s, v) => s + (v ?? 0), 0) / (total.length * 10)) * 100) : 0;
                const col = ovr >= 75 ? '#10b981' : ovr >= 60 ? '#f97316' : ovr >= 45 ? '#eab308' : '#ef4444';
                return (
                  <div key={ev.id} className={`card p-4 ${i === 0 ? 'border-brand-300 dark:border-brand-700' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          {ev.evaluation_date}
                          {i === 0 && <span className="pill-orange text-[10px]">Latest</span>}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          Tech: {ev.tech_passing}/10 | Tac: {ev.tac_positioning}/10 | Phy: {ev.phy_speed}/10 | Men: {ev.men_confidence}/10
                        </div>
                        {ev.strengths && <div className="text-xs mt-1 text-emerald-600">✓ {ev.strengths.slice(0, 80)}{ev.strengths.length > 80 ? '…' : ''}</div>}
                      </div>
                      <div className="text-center flex-shrink-0">
                        <div className="text-2xl font-extrabold" style={{ color: col }}>{ovr}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>OVR</div>
                      </div>
                    </div>
                    <div className="mt-2 progress-bar">
                      <div className="progress-fill" style={{ width: `${ovr}%`, background: col }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AI REPORT TAB */}
      {activeTab === 'ai' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>🤖 AI Player Report</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Position-specific analysis for {player.position === 'GK' ? 'Goalkeeper' : player.position === 'DEF' ? 'Defender' : player.position === 'MID' ? 'Midfielder' : 'Forward'}
              </p>
            </div>
            <div className="flex gap-2">
              {aiReport && (
                <button onClick={exportTxt}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg card border text-xs font-semibold"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <Download size={12} /> Export
                </button>
              )}
              <button onClick={generateAI} disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-bold disabled:opacity-60 shadow-glow-orange">
                {aiLoading ? '⏳ Generating…' : '⚡ Generate AI Report'}
              </button>
            </div>
          </div>

          {aiLoading && (
            <div className="space-y-2 py-4">
              {[90,70,80,60,75,50,85].map((w,i) => (
                <div key={i} className="h-3 rounded animate-pulse bg-slate-200 dark:bg-slate-700" style={{ width:`${w}%`, animationDelay:`${i*0.1}s` }} />
              ))}
              <p className="text-xs text-center mt-3" style={{ color: 'var(--text-secondary)' }}>AI is generating a position-specific report…</p>
            </div>
          )}

          {aiReport && !aiLoading ? (
            <div className="space-y-1">
              {aiReport.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <div key={i} className="font-extrabold text-base mt-5 mb-2 text-brand-700 dark:text-brand-400 flex items-center gap-2">{line.replace(/^## /,'')}</div>;
                if (line.startsWith('### ')) return <div key={i} className="font-bold text-sm mt-3 mb-1" style={{ color: 'var(--text-primary)' }}>{line.replace(/^### /,'')}</div>;
                if (line.match(/^\*\*(.+)\*\*$/)) return <div key={i} className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{line.replace(/\*\*/g,'')}</div>;
                if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}><span className="text-brand-500 flex-shrink-0 mt-0.5">•</span><span>{line.replace(/^[-•] /,'')}</span></div>;
                if (line.match(/^\d+\./)) return <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}><span className="font-bold text-brand-600 flex-shrink-0 w-5">{line.match(/^\d+/)?.[0]}.</span><span>{line.replace(/^\d+\.\s*/,'')}</span></div>;
                if (!line.trim()) return <div key={i} className="h-1" />;
                return <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{line}</p>;
              })}
            </div>
          ) : !aiLoading && (
            <div className="text-center py-10">
              <Brain size={48} className="text-brand-200 mx-auto mb-3" />
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No AI report generated yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Fill in the evaluation scores first, then click "Generate AI Report" for a detailed {player.position}-specific analysis.
              </p>
              <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                Requires GEMINI_API_KEY in your environment variables (free at aistudio.google.com)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
