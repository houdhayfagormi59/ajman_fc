'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Shield, Zap, RefreshCw, Target, BookOpen, Star } from 'lucide-react';

type Principle = {
  id: string;
  title: string;
  description: string;
  behaviors: string[];
  subPrinciples?: string[];
  trainingLinks: string[];
  playerFocus: string[];
  coachingPoints: string[];
};

type PrincipleCategory = {
  id: string;
  phase: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  principles: Principle[];
};

const GAME_PRINCIPLES: PrincipleCategory[] = [
  {
    id: 'attacking',
    phase: 'Attacking Organisation',
    icon: <Zap size={18} />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-400',
    description: 'How the team builds, progresses and creates in possession — from goalkeeper to striker. Based on PSC Training Model (Attacking Organisation phase).',
    principles: [
      {
        id: 'ao_early',
        title: 'Early Ball / Direct Phase',
        description: 'Using the principles of play (Possession, Create Space, Width, Penetration) to enter system and goal-scoring situations.',
        behaviors: [
          'Playing Into the Midfield',
          'Playing Into the Striker',
          'Creating Space & Time — Defending 3rd',
          'Entering the Attacking 3rd',
          'Playing Through the 3rd',
          'Playing Out Wide',
        ],
        subPrinciples: [
          'AT1 — Playing Into the Midfield',
          'AT2 — Playing Into the Striker',
          'AT3.1 — Creating Space & Time (Defending 3rd)',
          'AT3.2 — Creating Space & Time (Entering the Attacking 3rd)',
          'AT3.3 — Playing Through the 3rd',
          'AT3.4 — Playing Out Wide',
        ],
        trainingLinks: ['Build-up rondos', 'Positional 4-3-3 shape', 'Striker link-up patterns'],
        playerFocus: ['GK', 'CBs', 'Holding MF', 'Striker'],
        coachingPoints: ['Patience under pressure', 'Body shape open to field', 'Angles of support'],
      },
      {
        id: 'ao_middle',
        title: 'Middle 3rd — Attacking Play',
        description: 'Progressing through the middle third with structure, maintaining width, creating overlaps and penetrating the defensive block.',
        behaviors: [
          'Maintaining Possession',
          'Midfield Linkage',
          'Manipulating Defensive Shape',
          'Creating Overloads',
          'Penetrating Runs',
          'Combination Play',
          'Dribbling & Carrying',
        ],
        subPrinciples: [
          'AT4 — Sustained Possession',
          'AT5 — Scoring Opportunities / Recognising Threats',
          'AT6 — Corresponding Play / 3rd Man Runs',
          'AT7 — Overlapping Play',
          'AT8 — Third Man Runs',
          'AT9 — Penetrating Through Passes',
          'AT10 — Running with the Ball',
          'AT11 — Crossing from Depth',
          'AT12 — Set Play — Corner Kicks',
          'AT13 — Corner Kick Routines (all 20+ areas)',
          'AT14 — Combination Play',
          'AT15 — Free Kick Opportunities (all 20 areas)',
          'AT16 — Counter-Press Patterns',
          'AT17 — Creating Finishing Opportunities',
          'AT18 — Target Player Link-Up',
          'AT19 — Timing of Runs / Cross Timing',
          'AT20 — Switching Play / Second Phase',
          'AT21 — Combination Finishing Plays',
        ],
        trainingLinks: ['Middle 3rd rondos', 'Pattern play drills', 'Overload finishing sessions'],
        playerFocus: ['Wingers', 'CAM', 'CM', 'Full-backs'],
        coachingPoints: ['Third man awareness', 'Run timing', 'Quality of delivery'],
      },
      {
        id: 'ao_set',
        title: 'Attacking Set Pieces',
        description: 'Dead ball situations as primary goal-scoring opportunities. Full library of corner, free kick and throw-in routines.',
        behaviors: [
          'Corner kick delivery variations (near post, far post, short)',
          'Free kick zones A, B, C — direct and indirect',
          'Penalty area movement patterns — blocking and attacking runs',
          'Throw-in routines in final third',
          'Counter-attack from set piece clearance',
        ],
        subPrinciples: [
          'AT12 — Corner Kick Set Plays',
          'AT13 — All corner kick areas (20+ coded routines)',
          'AT15 — Free Kick Opportunities (all 20 zones coded)',
        ],
        trainingLinks: ['Set piece rehearsal (Thursday)', 'Corner routine cards', 'Free kick zone maps'],
        playerFocus: ['Tall CBs', 'Strikers', 'Dead ball specialists'],
        coachingPoints: ['Run timing', 'Blocking assignments', 'Delivery quality and disguise'],
      },
    ],
  },
  {
    id: 'attacking_transition',
    phase: 'Attacking Transition',
    icon: <Zap size={18} />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-400',
    description: 'The moment we win the ball — immediate vertical attack before the opposition reorganises. Based on PSC Training Model (Attacking Transition).',
    principles: [
      {
        id: 'at_counter',
        title: 'Counter-Attack (Ball Won)',
        description: 'To immediately attack as a team — this is a decompression of space. We exploit the left side, right side and counter-attack lanes immediately upon winning possession.',
        behaviors: [
          'Immediate forward pass if direct route available',
          'Exploit left / right channels before opposition recovers',
          'Strike pair split — one holds, one runs in behind',
          'Wide players make immediate runs in channel on transition',
          'Maximum 3 passes before entering final third',
          'Do NOT slow the attack down — exploit disorganisation',
          'If vertical is not available — retain, press high and re-attack',
        ],
        subPrinciples: [
          'AT1 — Immediate Attack / Create Disorganisation',
          'AT2 — Counter-Attack to the Left',
          'AT3 — Counter-Attack to the Right',
          'AT4 — Quick Break / Finishing',
          'AT5 — Counter-Attack to the Centre',
          'AT6 — Pressing Triggers (for 2nd phase)',
          'AT7 — Pressing in Balance',
        ],
        trainingLinks: ['Counter-attack patterns 4v3', 'Transition games — win ball attack', '5-second counter rule'],
        playerFocus: ['Strikers', 'Wide MF', 'CM'],
        coachingPoints: ['Speed of first pass', 'Striker run timing', 'Width in counter — no narrow attacks'],
      },
      {
        id: 'at_pressing',
        title: 'Counter-Press (After Losing Ball)',
        description: 'Immediately after losing possession — press as a team. Disorganise the opposition before they can set up. Win it back within 5 seconds or retreat to shape.',
        behaviors: [
          'Player who loses ball presses immediately — personal responsibility',
          'Nearest 2 teammates join press to create 3v1 around ball',
          'If not won within 5 seconds — "Shape!" call and retreat',
          'Cut passing lanes — do not just chase the ball',
          'Wingers sprint inside to create compactness',
          'CBs hold line — do not press upfield',
        ],
        subPrinciples: [
          'AT6 — Pressing Triggers (ball lost)',
          'AT7 — Pressing in Balance / Retreat to Shape',
        ],
        trainingLinks: ['Counter-press rondo', '5-second turnover game', 'Negative transition shape'],
        playerFocus: ['All outfield players', 'CM', 'Wingers'],
        coachingPoints: ['"Ball!" = press', '"Shape!" = retreat', 'No wasted sprints — press with purpose'],
      },
    ],
  },
  {
    id: 'defending',
    phase: 'Defensive Organisation',
    icon: <Shield size={18} />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-400',
    description: 'How the team defends as an organised unit — from high press to medium and low block. Based on PSC Training Model (Defending Organisation).',
    principles: [
      {
        id: 'do_high',
        title: 'High Block — Pressing & Compactness',
        description: 'We defend high and compact. Force opposition into mistakes in their own half through coordinated pressing and a high defensive line.',
        behaviors: [
          'DO1 — Delay / Contain — Channel Opposition Outside',
          'DO2 — Compact Defending — Deny Turn',
          'DO3 — Occupying Passing Zones',
          'DO4 — Defensive Marking Roles',
          'DO5 — Defending Individual Areas',
          'DO6 — Balancing the Defence',
          'DO7 — Defending the Near Post',
          'DO8 — Delaying the Attack',
          'DO9 — Recovery Runs',
          'DO10 — Organisation of Defensive Shape',
          'DO11 — Defending the Overlap',
          'DO12 — Preventing the Through Ball',
        ],
        subPrinciples: [
          'DO1 — Delay / Contain: Channel Opposition Outside',
          'DO2 — Compact Defending',
          'DO3 — Occupying Passing Zones',
          'DO4 — Marking Roles',
          'DO5 — Defending Individual Areas',
          'DO6 — Balancing the Defence',
          'DO7 — Near Post Defending',
          'DO8 — Delay the Attack',
          'DO9 — Recovery Runs',
          'DO10 — Defensive Organisation & Shape',
          'DO11 — Defending the Overlap',
          'DO12 — Preventing Through Balls',
          'DO13 — Defending Set Plays',
          'DO14 — Defending the Corner Kick',
          'DO15 — Goalkeeping Competencies',
        ],
        trainingLinks: ['High press shape — 4-3-3 block', 'Defensive line communication', 'Pressing triggers training'],
        playerFocus: ['Strikers (press leaders)', 'Wide MF', 'Defensive MF'],
        coachingPoints: ['Trigger recognition', 'Compactness between lines (max 35m)', 'Press together — never alone'],
      },
      {
        id: 'do_medium',
        title: 'Middle 3rd — Present Space / Defending',
        description: 'When we drop into a medium or low block — presenting controlled space, funnelling opposition into wide areas or dead ends, and defending the penalty area.',
        behaviors: [
          'Present a controlled defensive structure — invite into wide',
          'Maintain shape and defensive discipline',
          'Deny penetrating passes between lines',
          'Wingers track back to form a defensive 4-4-2 or 4-5-1',
          'Stay compact — no individual pressing from deep',
          'Force play wide and backwards',
          'Trigger press only on back pass, GK, or poor touch',
        ],
        subPrinciples: [
          'DO3 — Occupying Passing Zones (medium block)',
          'DO8 — Delaying the Attack (medium block version)',
          'DO12 — Preventing Through Balls',
          'DO6 — Defensive Balance',
        ],
        trainingLinks: ['Medium block shape', '4-4-2 defensive structure', 'Funnelling wide drills'],
        playerFocus: ['CBs', 'Full-backs', 'Defensive MF', 'Wingers'],
        coachingPoints: ['Shape discipline', 'No ball chasing', 'Patience — wait for trigger'],
      },
      {
        id: 'do_set',
        title: 'Defensive Set Pieces',
        description: 'Set piece defending is non-negotiable. Every player has a specific role — rehearsed weekly without exception.',
        behaviors: [
          'Zonal marking system for corners — 4 defenders on goal line',
          '2 man-markers on primary aerial threats',
          '1 striker at edge of box for clearances',
          'GK commands the area without hesitation',
          'Free kick wall positions drilled for all zones',
          'DO14 — Corner kick defending (full coded system)',
          'DO15 — GK positioning and command',
        ],
        subPrinciples: [
          'DO13 — Defending Set Plays',
          'DO14 — Defending the Corner Kick',
          'DO15 — Goalkeeping Competencies',
        ],
        trainingLinks: ['Corner defence rehearsal', 'Free kick wall drill', 'GK command sessions'],
        playerFocus: ['GK', 'CBs', 'Full-backs', 'Striker (lurking runner)'],
        coachingPoints: ['GK: "Keeper!" call — dominates box', 'Attack the ball — no waiting', 'Head to safety first'],
      },
    ],
  },
  {
    id: 'defending_transition',
    phase: 'Defending Transition',
    icon: <RefreshCw size={18} />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-400',
    description: 'The moment we lose the ball — become a defensive team immediately. Based on PSC Training Model (Defending Transition).',
    principles: [
      {
        id: 'dt_recover',
        title: 'Defensive Transition — Ball Lost',
        description: 'Immediately prevent the opposition from advancing. Slow the counter-attack and recover defensive shape before they can exploit the space behind us.',
        behaviors: [
          'DT1 — Prevent the Forward Pass immediately',
          'DT2 — Delay the Counter-Attack Left',
          'DT3 — Delay the Counter-Attack Right',
          'DT4 — Prevent the Counter-Attack in the Centre',
          'DT5 — Pressing Triggers for Counter-Attack',
          'DT6 — Pressing in Balance after losing ball',
        ],
        subPrinciples: [
          'DT1 — Prevent Forward Pass / Buy Time',
          'DT2 — Counter-Attack to the Left (defending)',
          'DT3 — Counter-Attack to the Right (defending)',
          'DT4 — Prevent Central Counter',
          'DT5 — Pressing Triggers',
          'DT6 — Pressing in Balance',
          'DT7 — Pressing for the Counter-Attack',
        ],
        trainingLinks: ['Negative transition game', 'Defend the counter 4v3', 'Recovery sprint drills'],
        playerFocus: ['All players', 'CM', 'Wingers', 'CBs'],
        coachingPoints: ['Sprint recovery — no walking', '"Shape!" = all sprint back', 'Nearest player delays — others cover'],
      },
    ],
  },
  {
    id: 'goalkeeping',
    phase: 'Goalkeeping & GK Principles',
    icon: <Target size={18} />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-400',
    description: 'The goalkeeper is the first attacker and last defender. Distribution is a tactical weapon. Based on DO15 — Goalkeeping Competencies.',
    principles: [
      {
        id: 'gk_all',
        title: 'DO15 — Goalkeeping Competencies',
        description: 'Complete goalkeeping system — positioning, distribution, shot-stopping, communication and sweeper-keeper role.',
        behaviors: [
          'Starting position: 10–15m off line when team in possession',
          'Distribution short to CBs under high press — build from back',
          'Long distribution: accurate to striker chest or feet directly',
          'Constant communication — organise defensive line at all times',
          'Command the box on set pieces — "Keeper!" call',
          'Sweeper-keeper: read balls in behind — claim or clear with purpose',
          'Body shape to play out from back — open to the field always',
        ],
        subPrinciples: [
          'GK Positioning — Active off the line',
          'GK Distribution — Short / Medium / Long options',
          'GK Shot Stopping — Set position for each shot angle',
          'GK Communication — Commands: "Keeper!", "Away!", "Man On!"',
          'GK Sweeper Role — 15m off line in open play',
          'GK Set Piece Command — Corner, Free kick, Throw-in',
        ],
        trainingLinks: ['GK sweeper positioning', 'Distribution pattern 1/2/3', 'GK communication rehearsal'],
        playerFocus: ['GK'],
        coachingPoints: ['Starting position always', 'Communicate constantly', 'Distribution = first pass of attack'],
      },
    ],
  },
];

// PSC Model summary data
const PSC_MODEL_SUMMARY = [
  {
    phase: 'Attacking Organisation', code: 'AT', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30',
    principles: ['AT1 Playing Into Midfield', 'AT2 Playing Into Striker', 'AT3.1–3.4 Creating Space (4 phases)', 'AT4 Sustained Possession', 'AT5 Scoring Opportunities', 'AT6 Corresponding Play', 'AT7 Overlapping Play', 'AT8 Third Man Runs', 'AT9 Penetrating Passes', 'AT10 Running With Ball', 'AT11 Crossing From Depth', 'AT12–13 Set Play Corners (20+ areas)', 'AT14 Combination Play', 'AT15 Free Kicks (20 zones)', 'AT16 Counter-Press Patterns', 'AT17 Creating Finishing Opps', 'AT18 Target Player Link-Up', 'AT19 Run / Cross Timing', 'AT20 Switching Play', 'AT21 Combination Finishing'],
  },
  {
    phase: 'Attacking Transition', code: 'ATr', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    principles: ['AT1 Immediate Attack / Disorganise', 'AT2 Counter-Attack Left', 'AT3 Counter-Attack Right', 'AT4 Quick Break / Finishing', 'AT5 Counter-Attack Centre', 'AT6 Pressing Triggers', 'AT7 Pressing in Balance'],
  },
  {
    phase: 'Defending Transition', code: 'DT', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30',
    principles: ['DT1 Prevent Forward Pass', 'DT2 Delay Counter-Left', 'DT3 Delay Counter-Right', 'DT4 Prevent Central Counter', 'DT5 Pressing Triggers', 'DT6 Pressing in Balance', 'DT7 Pressing Counter-Attack'],
  },
  {
    phase: 'Defending Organisation', code: 'DO', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30',
    principles: ['DO1 Delay / Contain', 'DO2 Compact Defending', 'DO3 Occupy Passing Zones', 'DO4 Defensive Marking', 'DO5 Defend Individual Areas', 'DO6 Balance the Defence', 'DO7 Near Post Defending', 'DO8 Delay the Attack', 'DO9 Recovery Runs', 'DO10 Defensive Organisation', 'DO11 Defend the Overlap', 'DO12 Prevent Through Balls', 'DO13 Defending Set Plays', 'DO14 Defending Corner Kick', 'DO15 Goalkeeping Competencies'],
  },
];

export default function PrinciplesPage() {
  const [openCategory, setOpenCategory] = useState<string>('attacking');
  const [openPrinciple, setOpenPrinciple] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'principles' | 'psc_model'>('principles');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="section-header">Game Principles</h1>
        <p className="section-sub">PSC Training Model — Attacking, Defending, Transitions & GK philosophy</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 card p-1 w-fit">
        {([['principles', 'Full Principles'], ['psc_model', 'PSC Model Reference']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === key ? 'gradient-brand text-white shadow-glow-orange' : 'hover:bg-brand-50 dark:hover:bg-slate-700'}`}
            style={{ color: activeTab === key ? undefined : 'var(--text-secondary)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* PSC Model Reference */}
      {activeTab === 'psc_model' && (
        <div className="space-y-4">
          <div className="card p-4 gradient-brand-soft">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-brand-600" />
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>PSC Training Model — Complete Sub-Principles Reference</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              All coded sub-principles from the PSC Training Model diagram. Use these codes when planning sessions and linking exercises to game principles.
            </p>
          </div>

          {/* Cycle diagram text */}
          <div className="card p-4">
            <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>The 4-Phase Cycle</h2>
            <div className="grid sm:grid-cols-4 gap-3 text-center">
              {[
                { label: 'Attacking Organisation', arrow: '→', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                { label: 'Attacking Transition (Ball Lost)', arrow: '↓', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                { label: 'Defending Organisation', arrow: '←', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { label: 'Defending Transition (Ball Won)', arrow: '↑', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
              ].map(({ label, arrow, color, bg }) => (
                <div key={label} className={`card p-3 rounded-xl ${bg}`}>
                  <div className={`text-2xl font-black ${color}`}>{arrow}</div>
                  <div className={`font-bold text-xs mt-1 ${color}`}>{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              Ball Lost triggers Defending Transition → Defending Organisation → Ball Won triggers Attacking Transition → Attacking Organisation
            </div>
          </div>

          {PSC_MODEL_SUMMARY.map(({ phase, code, color, bg, principles }) => (
            <div key={code} className="card p-4">
              <div className={`font-bold text-sm mb-3 ${color}`}>{phase} ({code})</div>
              <div className="flex flex-wrap gap-2">
                {principles.map((p, i) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${bg}`} style={{ color: 'var(--text-primary)' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Principles */}
      {activeTab === 'principles' && (
        <div className="space-y-4">
          <div className="card p-4 gradient-brand-soft">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-brand-600" />
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Our Football Identity</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              We play a <strong style={{ color: 'var(--text-primary)' }}>high-intensity, structured football model</strong> based on the PSC Training Model.
              Four phases: Attacking Organisation, Attacking Transition, Defending Organisation, Defending Transition.
              Every player knows their role in all four phases — this is non-negotiable.
            </p>
          </div>

          {GAME_PRINCIPLES.map((cat) => (
            <div key={cat.id} className={`card border-l-4 ${cat.borderColor}`}>
              <button
                className="w-full flex items-center justify-between p-4"
                onClick={() => setOpenCategory(openCategory === cat.id ? '' : cat.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={cat.color}>{cat.icon}</span>
                  <div className="text-left">
                    <div className={`font-bold text-base ${cat.color}`}>{cat.phase}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{cat.principles.length} principle{cat.principles.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                {openCategory === cat.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {openCategory === cat.id && (
                <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm pt-3" style={{ color: 'var(--text-secondary)' }}>{cat.description}</p>

                  {cat.principles.map((p) => (
                    <div key={p.id} className={`card ${cat.bgColor}`}>
                      <button
                        className="w-full flex items-center justify-between p-3"
                        onClick={() => setOpenPrinciple(openPrinciple === p.id ? '' : p.id)}
                      >
                        <span className="font-bold text-sm text-left" style={{ color: 'var(--text-primary)' }}>{p.title}</span>
                        {openPrinciple === p.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      {openPrinciple === p.id && (
                        <div className="px-3 pb-3 space-y-4 border-t" style={{ borderColor: 'var(--border)' }}>
                          <p className="text-sm pt-3" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="label mb-2">Key Behaviors & Cues</div>
                              <ul className="space-y-1">
                                {p.behaviors.map((b, i) => (
                                  <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                    <span className="text-brand-500 font-bold flex-shrink-0">{i + 1}.</span> {b}
                                  </li>
                                ))}
                              </ul>

                              {p.subPrinciples && (
                                <div className="mt-3">
                                  <div className="label mb-2">PSC Sub-Principles (Coded)</div>
                                  <ul className="space-y-0.5">
                                    {p.subPrinciples.map((sp, i) => (
                                      <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                                        <span className="text-brand-400 flex-shrink-0">→</span> {sp}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="label mb-2">Training Exercises / Links</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {p.trainingLinks.map((t) => (
                                    <span key={t} className="text-xs px-2 py-1 rounded-lg gradient-brand-soft border font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>{t}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="label mb-2">Player Focus</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {p.playerFocus.map((f) => (
                                    <span key={f} className="pill-orange">{f}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="label mb-2">Coaching Points</div>
                                <ul className="space-y-1">
                                  {p.coachingPoints.map((c, i) => (
                                    <li key={i} className="text-xs flex items-start gap-1" style={{ color: 'var(--text-secondary)' }}>
                                      <span className="text-brand-400 flex-shrink-0">→</span> {c}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
