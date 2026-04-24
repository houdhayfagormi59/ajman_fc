'use client';
import { useState, useEffect } from 'react';

interface Scores {
  scout_tech_ball_control: number; scout_tech_passing: number; scout_tech_shooting: number; scout_tech_dribbling: number;
  scout_phy_speed: number; scout_phy_strength: number; scout_phy_endurance: number; scout_phy_agility: number;
  scout_tac_positioning: number; scout_tac_awareness: number; scout_tac_decision: number;
  scout_psy_confidence: number; scout_psy_leadership: number; scout_psy_composure: number; scout_psy_work_ethic: number;
}

interface Props {
  initial?: Partial<Scores>;
  onChange?: (scores: Scores & { scout_overall_rating: number; scout_recommendation: string }) => void;
  readOnly?: boolean;
}

const defaults: Scores = {
  scout_tech_ball_control: 5, scout_tech_passing: 5, scout_tech_shooting: 5, scout_tech_dribbling: 5,
  scout_phy_speed: 5, scout_phy_strength: 5, scout_phy_endurance: 5, scout_phy_agility: 5,
  scout_tac_positioning: 5, scout_tac_awareness: 5, scout_tac_decision: 5,
  scout_psy_confidence: 5, scout_psy_leadership: 5, scout_psy_composure: 5, scout_psy_work_ethic: 5,
};

const cats = [
  { key: 'technical', label: 'Technical', emoji: '⚽', color: 'from-orange-500 to-orange-600', fields: [
    { key: 'scout_tech_ball_control', label: 'Ball Control' }, { key: 'scout_tech_passing', label: 'Passing' },
    { key: 'scout_tech_shooting', label: 'Shooting' }, { key: 'scout_tech_dribbling', label: 'Dribbling' },
  ]},
  { key: 'physical', label: 'Physical', emoji: '💪', color: 'from-red-500 to-red-600', fields: [
    { key: 'scout_phy_speed', label: 'Speed' }, { key: 'scout_phy_strength', label: 'Strength' },
    { key: 'scout_phy_endurance', label: 'Endurance' }, { key: 'scout_phy_agility', label: 'Agility' },
  ]},
  { key: 'tactical', label: 'Tactical', emoji: '🧠', color: 'from-blue-500 to-blue-600', fields: [
    { key: 'scout_tac_positioning', label: 'Positioning' }, { key: 'scout_tac_awareness', label: 'Awareness' },
    { key: 'scout_tac_decision', label: 'Decision Making' },
  ]},
  { key: 'psychological', label: 'Psychological', emoji: '🎯', color: 'from-purple-500 to-purple-600', fields: [
    { key: 'scout_psy_confidence', label: 'Confidence' }, { key: 'scout_psy_leadership', label: 'Leadership' },
    { key: 'scout_psy_composure', label: 'Composure' }, { key: 'scout_psy_work_ethic', label: 'Work Ethic' },
  ]},
];

function catAvg(scores: Scores, fields: { key: string }[]) {
  const v = fields.map((f) => (scores as any)[f.key] as number).filter(Boolean);
  return v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : 0;
}
function overall(scores: Scores) {
  const v = Object.values(scores).filter((x) => typeof x === 'number' && x > 0);
  return v.length ? +(v.reduce((a: number, b: number) => a + b, 0) / v.length).toFixed(1) : 0;
}
function recommend(o: number) { return o >= 8 ? 'sign' : o >= 6.5 ? 'trial_extend' : o >= 5 ? 'monitor' : 'pass'; }
function recLabel(r: string) { return { sign: 'Sign Now', trial_extend: 'Extend Trial', monitor: 'Monitor', pass: 'Pass' }[r] || r; }
function recColor(r: string) { return { sign: 'bg-green-100 text-green-800', trial_extend: 'bg-blue-100 text-blue-800', monitor: 'bg-yellow-100 text-yellow-800', pass: 'bg-red-100 text-red-800' }[r] || ''; }
function ratingColor(v: number) { return v >= 8 ? 'text-green-600' : v >= 6 ? 'text-blue-600' : v >= 4 ? 'text-yellow-600' : 'text-red-600'; }

export default function ScoutingEvaluation({ initial, onChange, readOnly }: Props) {
  const [scores, setScores] = useState<Scores>({ ...defaults, ...initial });
  const ov = overall(scores);
  const rec = recommend(ov);

  useEffect(() => { onChange?.({ ...scores, scout_overall_rating: ov, scout_recommendation: rec }); }, [scores]);

  return (
    <div className="space-y-5">
      <div className="card p-5 text-center gradient-brand-soft">
        <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Overall Rating</div>
        <div className={`text-5xl font-extrabold ${ratingColor(ov)}`}>{ov}</div>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>out of 10</div>
        <div className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-bold ${recColor(rec)}`}>{recLabel(rec)}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {cats.map((cat) => {
          const avg = catAvg(scores, cat.fields);
          return (
            <div key={cat.key} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><span className="text-lg">{cat.emoji}</span> {cat.label}</h3>
                <div className={`text-lg font-extrabold ${ratingColor(avg)}`}>{avg}</div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${cat.color}`} style={{ width: `${avg * 10}%` }} />
              </div>
              <div className="space-y-3">
                {cat.fields.map((f) => {
                  const val = (scores as any)[f.key] as number;
                  return (
                    <div key={f.key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                        <span className={`font-bold ${ratingColor(val)}`}>{val}/10</span>
                      </div>
                      {readOnly ? (
                        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${cat.color}`} style={{ width: `${val * 10}%` }} />
                        </div>
                      ) : (
                        <input type="range" min="1" max="10" value={val} onChange={(e) => setScores((s) => ({ ...s, [f.key]: Number(e.target.value) }))} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
