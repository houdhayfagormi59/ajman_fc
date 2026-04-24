'use client';
import { useState } from 'react';
import { Calendar, Target, TrendingUp, Zap, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';

type Phase = {
  id: string;
  name: string;
  weeks: string;
  period: string;
  goal: string;
  intensity: 'Low' | 'Medium' | 'High' | 'Very High' | 'Recovery';
  volume: 'Low' | 'Medium' | 'High' | 'Very High';
  focus: string[];
  weeklyTemplate: WeekTemplate[];
  color: string;
  bgColor: string;
};

type WeekTemplate = {
  day: string;
  type: string;
  focus: string;
  duration: number;
  intensity: 'Low' | 'Medium' | 'High' | 'Recovery' | 'Off';
};

const SEASON_PHASES: Phase[] = [
  {
    id: 'pre_season',
    name: 'Pre-Season',
    weeks: 'Weeks 1–6',
    period: 'July – August',
    goal: 'Build physical foundation, establish team shape and game model',
    intensity: 'Medium',
    volume: 'Very High',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    focus: ['Aerobic base', 'Team cohesion', 'Tactical identity', 'Set pieces', 'Fitness tests'],
    weeklyTemplate: [
      { day: 'Mon', type: 'Technical', focus: 'Ball mastery & possession', duration: 90, intensity: 'Medium' },
      { day: 'Tue', type: 'Physical', focus: 'Aerobic capacity & sprints', duration: 75, intensity: 'High' },
      { day: 'Wed', type: 'Tactical', focus: 'Defensive organisation', duration: 90, intensity: 'Medium' },
      { day: 'Thu', type: 'Recovery', focus: 'Mobility & activation', duration: 45, intensity: 'Low' },
      { day: 'Fri', type: 'Tactical', focus: 'Attacking patterns', duration: 90, intensity: 'High' },
      { day: 'Sat', type: 'Match', focus: 'Friendly / Scrimmage', duration: 90, intensity: 'High' },
      { day: 'Sun', type: 'Rest', focus: 'Active recovery', duration: 0, intensity: 'Off' },
    ],
  },
  {
    id: 'early_season',
    name: 'Early Season',
    weeks: 'Weeks 7–16',
    period: 'September – October',
    goal: 'Establish winning momentum, refine game model under competitive pressure',
    intensity: 'High',
    volume: 'High',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    focus: ['Game model implementation', 'Set pieces', 'Individual KPIs', 'Load monitoring'],
    weeklyTemplate: [
      { day: 'Mon', type: 'Recovery', focus: 'Post-match analysis & activation', duration: 45, intensity: 'Low' },
      { day: 'Tue', type: 'Technical', focus: 'Individual skills & corrections', duration: 75, intensity: 'Medium' },
      { day: 'Wed', type: 'Tactical', focus: 'Opposition analysis & preparation', duration: 90, intensity: 'High' },
      { day: 'Thu', type: 'Set Pieces', focus: 'Attacking & defensive set pieces', duration: 60, intensity: 'Medium' },
      { day: 'Fri', type: 'Pre-Match', focus: 'Shape rehearsal & activation', duration: 60, intensity: 'Medium' },
      { day: 'Sat', type: 'Match', focus: 'Competitive fixture', duration: 90, intensity: 'Very High' },
      { day: 'Sun', type: 'Rest', focus: 'Full rest', duration: 0, intensity: 'Off' },
    ],
  },
  {
    id: 'mid_season',
    name: 'Mid Season',
    weeks: 'Weeks 17–28',
    period: 'November – February',
    goal: 'Maintain performance peaks, manage fatigue and fixture congestion',
    intensity: 'Very High',
    volume: 'Medium',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    focus: ['Performance maintenance', 'Rotation management', 'Injury prevention', 'Cup competitions'],
    weeklyTemplate: [
      { day: 'Mon', type: 'Recovery', focus: 'Light activation & analysis', duration: 45, intensity: 'Recovery' },
      { day: 'Tue', type: 'Tactical', focus: 'Next opponent preparation', duration: 75, intensity: 'Medium' },
      { day: 'Wed', type: 'Physical', focus: 'Power & speed maintenance', duration: 60, intensity: 'High' },
      { day: 'Thu', type: 'Technical', focus: 'Dead balls & finishing', duration: 60, intensity: 'Medium' },
      { day: 'Fri', type: 'Pre-Match', focus: 'Pattern rehearsal', duration: 45, intensity: 'Low' },
      { day: 'Sat', type: 'Match', focus: 'Competitive fixture', duration: 90, intensity: 'Very High' },
      { day: 'Sun', type: 'Rest', focus: 'Full rest', duration: 0, intensity: 'Off' },
    ],
  },
  {
    id: 'late_season',
    name: 'Run-In',
    weeks: 'Weeks 29–38',
    period: 'March – May',
    goal: 'Peak performance for decisive matches, maximise squad depth',
    intensity: 'High',
    volume: 'Low',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    focus: ['Decisive match preparation', 'Squad depth utilisation', 'Mental resilience', 'Tactical adaptability'],
    weeklyTemplate: [
      { day: 'Mon', type: 'Recovery', focus: 'Analysis & light gym', duration: 45, intensity: 'Recovery' },
      { day: 'Tue', type: 'Tactical', focus: 'Key themes & opponent analysis', duration: 75, intensity: 'Medium' },
      { day: 'Wed', type: 'Tactical', focus: 'Full XI shape rehearsal', duration: 90, intensity: 'High' },
      { day: 'Thu', type: 'Set Pieces', focus: 'All dead ball situations', duration: 60, intensity: 'Medium' },
      { day: 'Fri', type: 'Pre-Match', focus: 'Activation & team meeting', duration: 45, intensity: 'Low' },
      { day: 'Sat', type: 'Match', focus: 'Competitive fixture', duration: 90, intensity: 'Very High' },
      { day: 'Sun', type: 'Rest', focus: 'Full rest', duration: 0, intensity: 'Off' },
    ],
  },
];

const KPI_TARGETS = [
  { category: 'Attacking', metrics: [
    { metric: 'Goals per game', target: '2.0+', current: '-' },
    { metric: 'Shots on target %', target: '45%+', current: '-' },
    { metric: 'Pass completion %', target: '80%+', current: '-' },
    { metric: 'Possession %', target: '55%+', current: '-' },
  ]},
  { category: 'Defending', metrics: [
    { metric: 'Goals conceded per game', target: '<1.0', current: '-' },
    { metric: 'Clean sheets', target: '40%+ of matches', current: '-' },
    { metric: 'Tackles won %', target: '60%+', current: '-' },
    { metric: 'Aerial duels won %', target: '55%+', current: '-' },
  ]},
  { category: 'Physical', metrics: [
    { metric: 'Distance covered (km/match)', target: '105+', current: '-' },
    { metric: 'Sprint count per match', target: '180+', current: '-' },
    { metric: 'Availability rate', target: '90%+', current: '-' },
    { metric: 'Training attendance', target: '95%+', current: '-' },
  ]},
];

function IntensityBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    'Very High': 'pill-red', High: 'pill-orange', Medium: 'pill-yellow',
    Low: 'pill-green', Recovery: 'pill-blue', Off: 'pill-slate',
  };
  return <span className={map[level] || 'pill-slate'}>{level}</span>;
}

export default function SeasonPlannerPage() {
  const [openPhase, setOpenPhase] = useState<string>('pre_season');
  const [activeTab, setActiveTab] = useState<'phases' | 'microcycle' | 'kpis'>('phases');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="section-header">Season Planner</h1>
        <p className="section-sub">Macrocycle planning — Pre-season to run-in · Training load management</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 card p-1 w-fit">
        {([['phases', 'Macrocycle Phases'], ['microcycle', 'Weekly Microcycle'], ['kpis', 'Team KPI Targets']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === key ? 'gradient-brand text-white shadow-glow-orange' : 'hover:bg-brand-50 dark:hover:bg-slate-700'}`}
            style={{ color: activeTab === key ? undefined : 'var(--text-secondary)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Macrocycle Phases */}
      {activeTab === 'phases' && (
        <div className="space-y-4">
          {/* Season overview bar */}
          <div className="card p-4">
            <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Annual Season Overview</h2>
            <div className="flex rounded-lg overflow-hidden h-8">
              <div className="flex-none w-[16%] bg-blue-500 flex items-center justify-center text-white text-xs font-bold">Pre</div>
              <div className="flex-none w-[26%] bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">Early</div>
              <div className="flex-none w-[32%] bg-orange-500 flex items-center justify-center text-white text-xs font-bold">Mid Season</div>
              <div className="flex-none w-[26%] bg-purple-500 flex items-center justify-center text-white text-xs font-bold">Run-In</div>
            </div>
            <div className="flex mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-[16%]">Jul–Aug</span>
              <span className="w-[26%]">Sep–Oct</span>
              <span className="w-[32%]">Nov–Feb</span>
              <span className="w-[26%]">Mar–May</span>
            </div>
          </div>

          {/* Load management chart */}
          <div className="card p-4">
            <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Training Load Periodisation</h2>
            <div className="relative h-32">
              <div className="absolute inset-0 flex items-end gap-1 px-2">
                {[70,80,85,90,85,75,80,85,90,95,90,85,90,95,100,95,90,85,80,85,90,95,90,85,80,75,80,85,90,85,80,75,80,85,90,95,100,95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t" style={{
                    height: `${h}%`,
                    background: h >= 90 ? '#ef4444' : h >= 80 ? '#f97316' : h >= 70 ? '#eab308' : '#10b981',
                    opacity: 0.8
                  }} />
                ))}
              </div>
              <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-xs py-1" style={{ color: 'var(--text-secondary)' }}>
                <span>High</span>
                <span>Low</span>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Week 1</span><span>Week 10</span><span>Week 20</span><span>Week 30</span><span>Week 38</span>
            </div>
          </div>

          {SEASON_PHASES.map((phase) => (
            <div key={phase.id} className={`card border ${phase.bgColor}`}>
              <button
                className="w-full flex items-center justify-between p-4"
                onClick={() => setOpenPhase(openPhase === phase.id ? '' : phase.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${phase.color.replace('text-', 'bg-')}`} />
                  <div className="text-left">
                    <div className={`font-bold text-base ${phase.color}`}>{phase.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{phase.weeks} · {phase.period}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Intensity:</span>
                    <IntensityBadge level={phase.intensity} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Volume:</span>
                    <IntensityBadge level={phase.volume} />
                  </div>
                  {openPhase === phase.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {openPhase === phase.id && (
                <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="pt-3">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{phase.goal}</p>
                  </div>

                  {/* Focus areas */}
                  <div>
                    <div className="label mb-2">Key Focus Areas</div>
                    <div className="flex flex-wrap gap-2">
                      {phase.focus.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold gradient-brand-soft border" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                          <Check size={10} className="text-brand-600" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Weekly template */}
                  <div>
                    <div className="label mb-2">Weekly Session Template</div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {phase.weeklyTemplate.map((day) => (
                        <div key={day.day} className={`card p-2 text-center ${day.intensity === 'Off' ? 'opacity-50' : ''}`}>
                          <div className="font-bold text-xs text-brand-600">{day.day}</div>
                          <div className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{day.type}</div>
                          <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{day.intensity === 'Off' ? 'REST' : `${day.duration}min`}</div>
                          <div className="mt-1">
                            <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                              day.intensity === 'Very High' ? 'bg-red-100 text-red-700' :
                              day.intensity === 'High' ? 'bg-orange-100 text-orange-700' :
                              day.intensity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              day.intensity === 'Low' ? 'bg-green-100 text-green-700' :
                              day.intensity === 'Recovery' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-500'
                            }`}>{day.intensity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Weekly Microcycle */}
      {activeTab === 'microcycle' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Standard Competition Week (MD-6 to MD)</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Elite microcycle structure — each session has a specific physiological and tactical purpose.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { day: 'MD-6 (Mon)', label: 'Recovery Day', color: 'border-blue-400', pill: 'pill-blue', intensity: 'Recovery',
                  content: ['Post-match debrief & video review', 'Light gym activation (20–30 min)', 'Hydrotherapy / pool session', 'Nutrition review with physio', 'Individual technical feedback'], load: 15 },
                { day: 'MD-5 (Tue)', label: 'Tactical — Defensive Block', color: 'border-green-400', pill: 'pill-green', intensity: 'Medium',
                  content: ['11v11 shape work — defensive organisation', 'Pressing triggers & compactness', 'Defensive transitions (counter-press)', 'Set piece defending (corners, free kicks)', 'Video clips opponent attack patterns'], load: 65 },
                { day: 'MD-4 (Wed)', label: 'Tactical — Attacking Play', color: 'border-orange-400', pill: 'pill-orange', intensity: 'High',
                  content: ['Positional games — build-up play', '11v11 — attacking organisation & finishing', 'Transition moments (attack to defence)', 'Set piece attacking (corners, free kicks)', 'Individual position-specific work'], load: 80 },
                { day: 'MD-3 (Thu)', label: 'Physical + Set Pieces', color: 'border-yellow-400', pill: 'pill-yellow', intensity: 'Medium',
                  content: ['Speed & power maintenance (15 min)', 'All dead ball situations — full run-through', 'Penalty practice (GK + takers)', 'Small-sided games — high intensity', 'Individual 1v1 defensive work'], load: 60 },
                { day: 'MD-2 (Fri)', label: 'Pre-Match Activation', color: 'border-purple-400', pill: 'pill-blue', intensity: 'Low',
                  content: ['Shape rehearsal — starting XI only', 'Final tactical briefing vs opponent', 'Set-piece walk-through (no contact)', 'Team meeting & video highlights', 'Psychological preparation talk'], load: 30 },
                { day: 'MD-1 (Sat)', label: 'Match Day', color: 'border-red-400', pill: 'pill-red', intensity: 'Very High',
                  content: ['Official warm-up protocol (30 min)', 'Competitive fixture', 'Post-match cool-down', 'Nutritional recovery protocol', 'Rapid performance data collection'], load: 100 },
                { day: 'MD (Sun)', label: 'Full Rest', color: 'border-slate-300', pill: 'pill-slate', intensity: 'Off',
                  content: ['Complete rest — no training', 'Optional pool recovery (voluntary)', 'Nutrition & sleep focus', 'Mental recovery', 'Social activity encouraged'], load: 0 },
              ].map(({ day, label, color, pill, intensity, content, load }) => (
                <div key={day} className={`card p-4 border-l-4 ${color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{day}</div>
                      <div className="text-xs font-semibold text-brand-600">{label}</div>
                    </div>
                    <span className={pill}>{intensity}</span>
                  </div>
                  <div className="progress-bar mb-3">
                    <div className="progress-fill" style={{ width: `${load}%`, background: load >= 80 ? '#ef4444' : load >= 60 ? '#f97316' : load >= 30 ? '#eab308' : '#10b981' }} />
                  </div>
                  <ul className="space-y-1">
                    {content.map((c, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <span className="text-brand-500 mt-0.5 flex-shrink-0">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Double game week */}
          <div className="card p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <h3 className="font-bold text-sm text-yellow-700 dark:text-yellow-300 mb-2">⚡ Double Game Week Adjustment</h3>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>When two fixtures occur within 72 hours, apply congestion protocol:</p>
            <div className="grid sm:grid-cols-4 gap-2">
              {[
                { phase: 'Post Match 1', action: 'Recovery only — NO tactical loading' },
                { phase: '48h Gap', action: 'Short activation (30min) + set pieces only' },
                { phase: 'Pre Match 2', action: 'Standard pre-match protocol abbreviated' },
                { phase: 'Post Match 2', action: 'Extended recovery — 72h rest minimum' },
              ].map(({ phase, action }) => (
                <div key={phase} className="card p-2">
                  <div className="text-xs font-bold text-yellow-600">{phase}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Targets */}
      {activeTab === 'kpis' && (
        <div className="space-y-4">
          <div className="card p-4 gradient-brand-soft mb-2">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Set season-long performance benchmarks for the squad. Track actuals in the Performance module.
            </p>
          </div>

          {KPI_TARGETS.map(({ category, metrics }) => (
            <div key={category} className="card p-4">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Target size={16} className="text-brand-600" /> {category} KPIs
              </h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Season Target</th>
                      <th>Current</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map(({ metric, target, current }) => (
                      <tr key={metric}>
                        <td className="font-medium">{metric}</td>
                        <td><span className="pill-green">{target}</span></td>
                        <td className="text-brand-600 font-semibold">{current}</td>
                        <td><span className="pill-slate">Tracking…</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="card p-4 border-dashed border-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-brand-50 transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <Plus size={16} /> <span className="text-sm font-semibold">Add Custom KPI Target</span>
          </div>
        </div>
      )}
    </div>
  );
}
