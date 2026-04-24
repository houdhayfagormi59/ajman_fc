'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Brain, Zap, BarChart3, Users, Film, Target, TrendingUp, ClipboardList, Sparkles, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';

type AnalysisType = {
  id: string; label: string; icon: React.ReactNode;
  description: string; placeholder: string; systemPrompt: string;
};

const ANALYSIS_TYPES: AnalysisType[] = [
  {
    id: 'player_performance',
    label: 'Player Performance Analysis',
    icon: <BarChart3 size={16} />,
    description: 'Deep analysis of a player\'s stats, strengths, weaknesses and development plan.',
    placeholder: `Example input:\nName: Ahmed Al-Rashidi, Position: FWD, Age: 21\nMatches: 15, Goals: 8, Assists: 4\nPass accuracy: 74%, Avg rating: 7.2\nPhysical: Fast, good in the air\nWeaknesses: Left foot, hold-up play\nRecent form: 3 goals in last 4 games`,
    systemPrompt: `You are an elite UEFA Pro Licence football performance analyst. Analyse the player data provided and give a detailed professional report with these sections:

## 📊 PERFORMANCE SUMMARY
## ⚡ KEY STRENGTHS (at least 5 specific points)
## 🎯 AREAS FOR DEVELOPMENT (at least 5 specific points)
## 📈 STATISTICAL ANALYSIS
## 🏋️ TRAINING RECOMMENDATIONS (specific exercises and drills)
## 🔮 DEVELOPMENT TRAJECTORY (6-month projection)
## 💡 TACTICAL USAGE SUGGESTIONS (for the coach)

Be specific, professional and actionable. Use football terminology. Give concrete numbers and targets where possible.`,
  },
  {
    id: 'team_tactics',
    label: 'Team Tactical Report',
    icon: <Users size={16} />,
    description: 'Full tactical analysis — formation, style, collective strengths and weaknesses.',
    placeholder: `Example input:\nTeam: Ajman FC Senior Squad\nFormation: 4-3-3\nRecent results: W3 D1 L1 (last 5)\nGoals scored: 9, Goals conceded: 4\nPlaying style goal: High press, possession-based\nSquad strengths: Physical, fast wingers\nProblems: Defending set pieces, losing midfield battles`,
    systemPrompt: `You are a senior football tactical analyst with UEFA Pro Licence expertise. Analyse the team data and deliver a comprehensive tactical report:

## 🏆 TEAM OVERVIEW
## ⚽ PLAYING STYLE ASSESSMENT
## 💪 COLLECTIVE STRENGTHS (minimum 6 points)
## ⚠️ TACTICAL VULNERABILITIES (minimum 6 points)
## 🔧 FORMATION ANALYSIS & ALTERNATIVES
## 📅 TRAINING PRIORITIES (next 4 weeks — specific sessions)
## 🎯 OPPOSITION STRATEGY (how opponents will try to exploit you)
## 📊 KPI TARGETS (measurable goals for improvement)

Use professional terminology. Be direct and actionable.`,
  },
  {
    id: 'training_plan',
    label: 'AI Training Plan Generator',
    icon: <ClipboardList size={16} />,
    description: 'Get a complete weekly training microcycle tailored to your team\'s needs.',
    placeholder: `Example input:\nTeam: U19 squad, 18 players available (2 injured)\nNext match: Saturday vs Al Wahda\nWeek type: MD-6 to MD (competition week)\nFocus this week: Defensive shape + counter-attack\nLast match result: Won 2-1, pressed well but poor transition defence\nField available: Full pitch + small pitch\nSession length: 90 minutes`,
    systemPrompt: `You are a UEFA Pro Licence coach and elite periodisation expert. Create a detailed 6-day training microcycle (MD-6 to Match Day):

For EACH DAY provide:
- Day & Theme (e.g. "MD-5 — Tactical: Defensive Organisation")
- Objectives (2-3 clear outcomes)
- Session Structure:
  • Warm-Up (15 min) — specific activities
  • Main Block (60 min) — 2-3 exercises with descriptions, player numbers, pitch size
  • Cool-Down (15 min)
- Intensity level (RPE 1-10)
- Coaching Points (3-5 key messages)
- Link to Game Principles

Format clearly with headers. Make every session purposeful and specific.`,
  },
  {
    id: 'match_analysis',
    label: 'Post-Match Analysis',
    icon: <Film size={16} />,
    description: 'Deep post-match analysis with tactical insights and next-week focus areas.',
    placeholder: `Example input:\nMatch: Ajman FC 2-1 Al Ain FC\nDate: Friday, competition match\nOur formation: 4-3-3\nOpponent formation: 4-4-2\nPossession: 58% us, 42% them\nGoals: 23' Ahmed (press win), 45' Salem (corner header)\nConceded: 62' counter-attack through midfield gap\nPositives: First-half pressing, set piece delivery\nNegatives: Lost midfield control after 60 min, poor transition defence`,
    systemPrompt: `You are a professional football match analyst working for a top club. Analyse the match data and produce a detailed post-match report:

## 🏆 MATCH SUMMARY & RESULT CONTEXT
## ⚡ FIRST HALF ANALYSIS
## 🔄 SECOND HALF ANALYSIS & CHANGES
## 💪 WHAT WORKED WELL (minimum 5 specific points)
## ⚠️ WHAT NEEDS IMPROVEMENT (minimum 5 specific points)
## 🎯 KEY MOMENTS & TURNING POINTS
## 🔍 OPPONENT ANALYSIS (their patterns, threats, weaknesses)
## 📅 TRAINING FOCUS — NEXT WEEK (3 priority areas with session ideas)
## 📊 INDIVIDUAL PLAYER HIGHLIGHTS

Be analytical, specific and forward-looking.`,
  },
  {
    id: 'scouting_report',
    label: 'AI Scouting Report',
    icon: <Target size={16} />,
    description: 'Professional scout-level player evaluation with recruitment recommendation.',
    placeholder: `Example input:\nPlayer: Khalid Hassan, Age: 19\nPosition: CAM / Right Wing\nCurrent club: Sharjah FC U21\nPhysical: 178cm, fast, agile\nTechnical: Excellent dribbling, creative, good final pass\nWeaknesses: Defensive work-rate, left foot\nPersonality: Confident, coachable, good attitude\nStats this season: 12 games, 5 goals, 7 assists\nMarket value estimate: Low — still developing\nScouted: 3 matches (2 wins, 1 loss)`,
    systemPrompt: `You are an elite football scout with 15 years experience at top clubs. Write a professional scouting report:

## 👤 PLAYER PROFILE
## ⚽ TECHNICAL PROFILE (detailed assessment of each technical attribute)
## 🏃 PHYSICAL PROFILE (speed, strength, endurance, agility)
## 🧠 TACTICAL UNDERSTANDING (positioning, decision-making, game reading)
## 💬 PSYCHOLOGICAL ASSESSMENT (mentality, coachability, leadership)
## 📈 POTENTIAL & CEILING (realistic projection at age 23-25)
## ✅ RECRUITMENT RECOMMENDATION: SIGN / MONITOR / REJECT
## 💰 MARKET VALUE ASSESSMENT
## 🔧 INTEGRATION PLAN (if recommending signing — how to use them)

Be honest, professional and decisive. Give a clear recommendation.`,
  },
  {
    id: 'injury_prevention',
    label: 'Injury Risk & Load Management',
    icon: <TrendingUp size={16} />,
    description: 'Analyse injury patterns and get prevention recommendations.',
    placeholder: `Example input:\nSquad size: 22 players\nCurrent injuries: 2 hamstring (moderate), 1 ankle sprain (minor)\nTraining load last 3 weeks: High — 6 sessions/week including 2 matches\nUpcoming: 3 matches in next 10 days\nPlayers flagged: #7 Ahmed (hamstring tightness reported), #11 Salem (fatigue)\nRecent training intensity: RPE 7-8 most sessions\nFitness testing: Done 3 weeks ago`,
    systemPrompt: `You are a sports science and injury prevention specialist working with a professional football club. Analyse the squad data:

## 🏥 CURRENT INJURY ASSESSMENT
## ⚠️ AT-RISK PLAYERS (flag each with reasoning)
## 📊 LOAD MANAGEMENT ANALYSIS (is the squad being overloaded?)
## 🛡️ PREVENTION PROTOCOL (specific recommendations per player)
## 📅 TRAINING ADJUSTMENTS (what to change this week)
## 🔄 RETURN-TO-PLAY PLAN (for current injuries)
## 💊 RECOVERY RECOMMENDATIONS (nutrition, sleep, physio)
## 📈 3-WEEK LOAD PLAN (to peak for important matches)

Be clinical, specific and player-by-player where relevant.`,
  },
];

export default function AIAnalyzerPage() {
  const [selectedType, setSelectedType] = useState<AnalysisType>(ANALYSIS_TYPES[0]);
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const [history, setHistory] = useState<{ type: string; result: string; ts: string }[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [charCount, setCharCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('players').select('id,first_name,last_name,position').order('last_name');
      setPlayers(data ?? []);
      const { data: analyses } = await supabase.from('ai_analyses')
        .select('*').order('created_at', { ascending: false }).limit(8);
      if (analyses) {
        setHistory(analyses.map(a => ({ type: a.analysis_type, result: a.result || '', ts: a.created_at })));
      }
    })();
  }, []);

  async function runAnalysis() {
    if (!context.trim()) return;
    setLoading(true); setResult(''); setProvider('');
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType.id,
          systemPrompt: selectedType.systemPrompt,
          context,
          playerId: selectedPlayer || null,
        }),
      });
      const data = await response.json();
      setResult(data.result || 'No result returned.');
      if (data.provider) setProvider(data.provider);
      setHistory(h => [{ type: selectedType.label, result: data.result || '', ts: new Date().toISOString() }, ...h.slice(0, 7)]);
    } catch (err) {
      setResult('❌ Network error. Please check your internet connection and try again.');
    }
    setLoading(false);
  }

  function loadExample() {
    setContext(selectedType.placeholder);
    setCharCount(selectedType.placeholder.length);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="section-header">AI Football Intelligence</h1>
        <p className="section-sub">Real AI analysis powered by Google Gemini — free, fast, elite level</p>
      </div>

      {/* Free AI badge */}
      <div className="card p-3 flex items-center gap-3 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
        <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Google Gemini AI — 100% Free</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400">
            1,500 free AI requests per day · No credit card needed · Get your free key at <strong>aistudio.google.com/app/apikey</strong> → add as <code className="bg-emerald-100 dark:bg-emerald-900 px-1 rounded">GEMINI_API_KEY</code>
          </div>
        </div>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 px-3 py-1.5 rounded-lg gradient-brand text-white text-xs font-bold hover:opacity-90 transition">
          Get Free Key →
        </a>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left — type selector */}
        <div className="lg:col-span-1 space-y-3">
          <div className="card p-4">
            <div className="label mb-3">Analysis Type</div>
            <div className="space-y-1.5">
              {ANALYSIS_TYPES.map(type => (
                <button key={type.id} onClick={() => { setSelectedType(type); setResult(''); setContext(''); setCharCount(0); }}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-2.5 ${
                    selectedType.id === type.id
                      ? 'gradient-brand text-white border-transparent shadow-glow-orange'
                      : 'card card-hover'
                  }`}
                  style={selectedType.id !== type.id ? { borderColor: 'var(--border)' } : {}}>
                  <span className={selectedType.id === type.id ? 'text-white mt-0.5' : 'text-brand-600 mt-0.5'}>{type.icon}</span>
                  <div>
                    <div className="font-semibold text-xs leading-snug">{type.label}</div>
                    {selectedType.id === type.id && (
                      <div className="text-[11px] mt-0.5 text-white/80 leading-snug">{type.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Player link */}
          {['player_performance', 'scouting_report', 'injury_prevention'].includes(selectedType.id) && players.length > 0 && (
            <div className="card p-4">
              <div className="label mb-2">Link to Player (optional)</div>
              <select className="input-base text-sm" value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)}>
                <option value="">No player linked</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.position})</option>
                ))}
              </select>
            </div>
          )}

          {/* History */}
          {history.length > 0 && !result && (
            <div className="card p-4">
              <div className="label mb-2">Recent Analyses</div>
              <div className="space-y-1.5">
                {history.slice(0, 5).map((h, i) => (
                  <button key={i} onClick={() => setResult(h.result)}
                    className="w-full text-left p-2 rounded-lg card-hover hover:bg-brand-50 dark:hover:bg-slate-700 transition border"
                    style={{ borderColor: 'var(--border)' }}>
                    <div className="text-xs font-semibold text-brand-600 truncate">{h.type}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(h.ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — input + output */}
        <div className="lg:col-span-2 space-y-4">
          {/* Input */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-brand-600" />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{selectedType.label}</span>
              </div>
              <button onClick={loadExample}
                className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
                <Sparkles size={11} /> Load Example
              </button>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{selectedType.description}</p>

            <div>
              <label className="label block mb-1">
                Paste your data / describe the situation
                <span className="ml-2 normal-case font-normal" style={{ color: 'var(--text-secondary)' }}>({charCount} chars)</span>
              </label>
              <textarea
                className="input-base min-h-[200px] resize-y font-mono text-sm"
                value={context}
                onChange={e => { setContext(e.target.value); setCharCount(e.target.value.length); }}
                placeholder={`Click "Load Example" above to see the format, or type your own data here.\n\nTip: The more detail you give, the better the AI analysis will be.`}
              />
            </div>

            <div className="mt-3 flex gap-2 flex-wrap items-center">
              <Button onClick={runAnalysis} loading={loading} disabled={!context.trim()}>
                <Zap size={14} /> {loading ? 'AI is thinking…' : 'Generate Analysis'}
              </Button>
              <button onClick={() => { setContext(''); setResult(''); setCharCount(0); }}
                className="px-4 py-2 rounded-lg card text-sm font-semibold hover:bg-brand-50 transition"
                style={{ color: 'var(--text-secondary)' }}>
                Clear
              </button>
              {result && (
                <button onClick={() => navigator.clipboard.writeText(result)}
                  className="px-4 py-2 rounded-lg card text-sm font-semibold hover:bg-brand-50 transition"
                  style={{ color: 'var(--text-secondary)' }}>
                  📋 Copy Result
                </button>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Brain size={18} className="text-brand-600 animate-pulse-soft" />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AI is analysing your data…</span>
                <span className="text-xs pill-green">Gemini AI</span>
              </div>
              <div className="space-y-2">
                {[85, 60, 75, 50, 80, 40, 65].map((w, i) => (
                  <div key={i} className="h-3 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700"
                    style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                Generating elite-level football analysis… this usually takes 5–10 seconds.
              </p>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Analysis Complete</span>
                  {provider && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      provider === 'gemini'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    }`}>
                      {provider === 'gemini' ? '🤖 Google Gemini (Free)' : '🟠 Anthropic Claude'}
                    </span>
                  )}
                </div>
                <button onClick={() => navigator.clipboard.writeText(result)}
                  className="text-xs font-semibold text-brand-600 hover:underline">
                  📋 Copy
                </button>
              </div>

              {/* Render result with markdown-like formatting */}
              <div className="prose prose-sm max-w-none space-y-1">
                {result.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h3 key={i} className="font-extrabold text-base mt-4 mb-1 text-brand-700 dark:text-brand-400 border-b pb-1" style={{ borderColor: 'var(--border)' }}>
                        {line.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('### ')) {
                    return <h4 key={i} className="font-bold text-sm mt-3 mb-1" style={{ color: 'var(--text-primary)' }}>{line.replace('### ', '')}</h4>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.startsWith('- ') || line.startsWith('• ')) {
                    return (
                      <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                        <span className="text-brand-500 mt-0.5 flex-shrink-0">•</span>
                        <span>{line.replace(/^[-•] /, '')}</span>
                      </div>
                    );
                  }
                  if (line.match(/^\d+\./)) {
                    return (
                      <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                        <span className="font-bold text-brand-600 flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
                        <span>{line.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    );
                  }
                  if (line.trim() === '') return <div key={i} className="h-1" />;
                  return <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{line}</p>;
                })}
              </div>
            </div>
          )}

          {/* Setup guide if no result and not loading */}
          {!result && !loading && (
            <div className="card p-5 border-dashed border-2" style={{ borderColor: 'var(--border)' }}>
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Setup: Get Your FREE AI Key in 2 Minutes</h3>
              </div>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Go to Google AI Studio', desc: 'Visit aistudio.google.com/app/apikey', link: 'https://aistudio.google.com/app/apikey', action: 'Open →' },
                  { step: '2', title: 'Click "Create API Key"', desc: 'Choose "Create API key in new project" — it\'s instant and free', link: null, action: null },
                  { step: '3', title: 'Copy your key', desc: 'It starts with "AIza..." — copy the whole thing', link: null, action: null },
                  { step: '4', title: 'Add to your .env.local file', desc: 'GEMINI_API_KEY=AIza...  then restart the server', link: null, action: null },
                  { step: '5', title: 'Or add to Vercel', desc: 'Settings → Environment Variables → GEMINI_API_KEY → paste key → Redeploy', link: null, action: null },
                ].map(({ step, title, desc, link, action }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full gradient-brand text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">{step}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{desc}</div>
                    </div>
                    {link && action && (
                      <a href={link} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 text-xs font-bold text-brand-600 hover:underline">
                        {action}
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl gradient-brand-soft border text-xs" style={{ borderColor: 'var(--border)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Free limits:</strong>
                <span style={{ color: 'var(--text-secondary)' }}> 1,500 requests/day · 1 million tokens/minute · No credit card required · Gemini 1.5 Flash model</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
