// =============================================
// AI VIDEO EVENT DETECTION — Football Actions
// Simulates Hudl/Wyscout-style event tagging
// =============================================

export type FootballEventType =
  | 'ball_loss' | 'ball_recovery' | 'pressing_success'
  | 'cross_left' | 'cross_right' | 'ball_in_box'
  | 'between_lines' | 'through_ball'
  | 'offensive_transition' | 'defensive_transition'
  | 'shot' | 'goal' | 'foul' | 'corner' | 'free_kick'
  | 'pass_forward' | 'pass_backward' | 'dribble' | 'tackle';

export interface FootballEvent {
  id: string;
  type: FootballEventType;
  timestamp: number;      // seconds in video
  label: string;
  category: 'offensive' | 'defensive' | 'transition' | 'set_piece';
  confidence: number;     // 0-100%
  description: string;
  zone: string;            // pitch zone where it occurred
  player?: string;
}

export const EVENT_CONFIG: Record<FootballEventType, { label: string; category: FootballEvent['category']; color: string; emoji: string }> = {
  ball_loss:              { label: 'Ball Loss',               category: 'defensive',   color: '#ef4444', emoji: '❌' },
  ball_recovery:          { label: 'Ball Recovery',           category: 'defensive',   color: '#22c55e', emoji: '🔄' },
  pressing_success:       { label: 'Pressing Success',        category: 'defensive',   color: '#8b5cf6', emoji: '💪' },
  cross_left:             { label: 'Cross (Left)',            category: 'offensive',   color: '#3b82f6', emoji: '↗️' },
  cross_right:            { label: 'Cross (Right)',           category: 'offensive',   color: '#06b6d4', emoji: '↖️' },
  ball_in_box:            { label: 'Ball in Box',             category: 'offensive',   color: '#f97316', emoji: '📦' },
  between_lines:          { label: 'Between Lines',           category: 'offensive',   color: '#eab308', emoji: '🎯' },
  through_ball:           { label: 'Through Ball',            category: 'offensive',   color: '#a855f7', emoji: '⚡' },
  offensive_transition:   { label: 'Offensive Transition',    category: 'transition',  color: '#10b981', emoji: '⏩' },
  defensive_transition:   { label: 'Defensive Transition',    category: 'transition',  color: '#f43f5e', emoji: '⏪' },
  shot:                   { label: 'Shot',                    category: 'offensive',   color: '#ea580c', emoji: '🎯' },
  goal:                   { label: 'Goal',                    category: 'offensive',   color: '#16a34a', emoji: '⚽' },
  foul:                   { label: 'Foul',                    category: 'set_piece',   color: '#dc2626', emoji: '🟨' },
  corner:                 { label: 'Corner',                  category: 'set_piece',   color: '#2563eb', emoji: '🚩' },
  free_kick:              { label: 'Free Kick',               category: 'set_piece',   color: '#7c3aed', emoji: '🦶' },
  pass_forward:           { label: 'Forward Pass',            category: 'offensive',   color: '#0ea5e9', emoji: '➡️' },
  pass_backward:          { label: 'Backward Pass',           category: 'offensive',   color: '#94a3b8', emoji: '⬅️' },
  dribble:                { label: 'Dribble',                 category: 'offensive',   color: '#f59e0b', emoji: '💨' },
  tackle:                 { label: 'Tackle',                  category: 'defensive',   color: '#059669', emoji: '🛡️' },
};

const ZONES = ['Left Wing', 'Right Wing', 'Central Midfield', 'Left Half-Space', 'Right Half-Space',
  'Defensive Third', 'Middle Third', 'Attacking Third', 'Penalty Box', 'Own Half'];

function uid() { return Math.random().toString(36).slice(2, 8); }

// Simulate AI event detection on a video (generates realistic-looking events)
export function detectEventsFromVideo(durationSeconds: number): FootballEvent[] {
  const events: FootballEvent[] = [];
  const types = Object.keys(EVENT_CONFIG) as FootballEventType[];

  // Generate events at realistic intervals (every 15-60 seconds)
  let t = 10 + Math.random() * 20;
  while (t < durationSeconds - 10) {
    const type = types[Math.floor(Math.random() * types.length)];
    const cfg = EVENT_CONFIG[type];
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];

    events.push({
      id: uid(), type, timestamp: Math.floor(t),
      label: cfg.label, category: cfg.category,
      confidence: Math.floor(70 + Math.random() * 30),
      description: `${cfg.emoji} ${cfg.label} detected in ${zone}`,
      zone, player: undefined,
    });

    t += 15 + Math.random() * 45; // next event 15-60 seconds later
  }

  return events.sort((a, b) => a.timestamp - b.timestamp);
}

// Summarize detected events
export function summarizeEvents(events: FootballEvent[]) {
  const byCategory = { offensive: 0, defensive: 0, transition: 0, set_piece: 0 };
  const byType: Record<string, number> = {};

  events.forEach(e => {
    byCategory[e.category]++;
    byType[e.type] = (byType[e.type] || 0) + 1;
  });

  const topEvents = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count, label: EVENT_CONFIG[type as FootballEventType]?.label || type }));

  const avgConfidence = events.length
    ? Math.round(events.reduce((s, e) => s + e.confidence, 0) / events.length) : 0;

  return { total: events.length, byCategory, topEvents, avgConfidence };
}
