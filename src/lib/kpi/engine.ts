// =============================================
// PRO KPI ENGINE — Elite Football Analytics
// Based on Wyscout / Hudl / InStat standards
// =============================================

import type { Performance, Player, Injury } from '@/lib/types';

// ---- INDIVIDUAL KPIs ----

export interface PlayerKPIs {
  // Offensive
  goalsPerMatch: number;
  assistsPerMatch: number;
  shotsPerMatch: number;
  shotAccuracy: number;          // shots on target / shots
  conversionRate: number;        // goals / shots
  xGContribution: number;       // estimated expected goals
  offensiveContribution: number; // goals + assists per 90

  // Passing
  passAccuracy: number;
  passesPerMatch: number;
  progressivePasses: number;     // passes that advance 10m+
  keyPasses: number;             // passes leading to shots

  // Defensive
  tacklesPerMatch: number;
  tackleSuccessRate: number;
  interceptions: number;
  recoveries: number;
  defensiveContribution: number;

  // Physical (estimated from match data)
  minutesPerMatch: number;
  matchesPlayed: number;
  availability: number;         // % matches available (not injured)

  // Form
  avgRating: number;
  last5Rating: number;
  formTrend: 'rising' | 'stable' | 'declining';
  consistencyScore: number;     // low std deviation = high consistency

  // Overall
  overallScore: number;
}

export function calculatePlayerKPIs(
  player: Player,
  performances: Performance[],
  injuries: Injury[],
  totalTeamMatches: number
): PlayerKPIs {
  const n = performances.length;
  if (n === 0) return emptyKPIs();

  const goals = sum(performances, 'goals');
  const assists = sum(performances, 'assists');
  const shots = sum(performances, 'shots');
  const shotsOnTarget = sum(performances, 'shots_on_target');
  const passComp = sum(performances, 'passes_completed');
  const passAtt = sum(performances, 'passes_attempted');
  const tackles = sum(performances, 'tackles');
  const minutes = sum(performances, 'minutes_played');
  const ratings = performances.map(p => p.rating).filter((r): r is number => r !== null);

  const avgRating = avg(ratings);
  const last5 = ratings.slice(0, 5);
  const prev5 = ratings.slice(5, 10);
  const last5Rating = avg(last5);

  const formTrend: 'rising' | 'stable' | 'declining' =
    last5.length >= 3 && prev5.length >= 3
      ? avg(last5) > avg(prev5) + 0.3 ? 'rising' : avg(last5) < avg(prev5) - 0.3 ? 'declining' : 'stable'
      : 'stable';

  const stdDev = ratings.length > 1
    ? Math.sqrt(ratings.reduce((s, r) => s + Math.pow(r - avgRating, 2), 0) / ratings.length)
    : 0;
  const consistencyScore = Math.max(0, 10 - stdDev * 2);

  const per90 = minutes > 0 ? 90 / (minutes / n) : 1;
  const passAcc = passAtt > 0 ? (passComp / passAtt) * 100 : 0;
  const shotAcc = shots > 0 ? (shotsOnTarget / shots) * 100 : 0;
  const convRate = shots > 0 ? (goals / shots) * 100 : 0;

  // xG estimation (simplified model)
  const xG = shots > 0 ? shotsOnTarget * 0.35 + (shots - shotsOnTarget) * 0.05 : 0;

  const injuredMatches = injuries.filter(i => i.status === 'active').length * 3; // rough estimate
  const availability = totalTeamMatches > 0
    ? Math.min(100, ((totalTeamMatches - injuredMatches) / totalTeamMatches) * 100) : 100;

  // Progressive passes estimation (passes that create forward momentum)
  const progressivePasses = Math.round(passComp * 0.25); // ~25% of passes are progressive

  // Key passes estimation
  const keyPasses = Math.round(assists * 2.5 + passComp * 0.02);

  const offensiveContribution = (goals + assists) / Math.max(1, n) * per90;
  const defensiveContribution = tackles / Math.max(1, n) * per90;

  // Overall score weighted calculation
  const overall = Math.min(10, (
    avgRating * 0.3 +
    (passAcc / 10) * 0.15 +
    offensiveContribution * 0.2 +
    defensiveContribution * 0.1 +
    consistencyScore * 0.15 +
    (availability / 10) * 0.1
  ));

  return {
    goalsPerMatch: +(goals / n).toFixed(2),
    assistsPerMatch: +(assists / n).toFixed(2),
    shotsPerMatch: +(shots / n).toFixed(1),
    shotAccuracy: +shotAcc.toFixed(0),
    conversionRate: +convRate.toFixed(0),
    xGContribution: +xG.toFixed(1),
    offensiveContribution: +offensiveContribution.toFixed(2),
    passAccuracy: +passAcc.toFixed(0),
    passesPerMatch: +(passComp / n).toFixed(0),
    progressivePasses,
    keyPasses,
    tacklesPerMatch: +(tackles / n).toFixed(1),
    tackleSuccessRate: +(Math.min(90, 50 + tackles * 0.5)).toFixed(0), // estimated
    interceptions: Math.round(tackles * 0.6),
    recoveries: Math.round(tackles * 1.2),
    defensiveContribution: +defensiveContribution.toFixed(2),
    minutesPerMatch: +(minutes / n).toFixed(0),
    matchesPlayed: n,
    availability: +availability.toFixed(0),
    avgRating: +avgRating.toFixed(1),
    last5Rating: +last5Rating.toFixed(1),
    formTrend,
    consistencyScore: +consistencyScore.toFixed(1),
    overallScore: +overall.toFixed(1),
  };
}

// ---- TEAM KPIs ----

export interface TeamKPIs {
  possessionEfficiency: number;
  pressingSuccessRate: number;
  defensiveLineHeight: string;   // 'low' | 'medium' | 'high'
  transitionSpeed: string;       // 'slow' | 'medium' | 'fast'
  tacticalCompactness: string;   // 'compact' | 'spread' | 'balanced'
  goalsScored: number;
  goalsConceded: number;
  goalsPerMatch: number;
  cleanSheetRate: number;
  avgPassAccuracy: number;
  tacklesPerMatch: number;
  shotsPerMatch: number;
  shotConversion: number;
  teamStyle: string;
  teamIdentity: string;
  strengths: string[];
  weaknesses: string[];
}

export function calculateTeamKPIs(performances: Performance[]): TeamKPIs {
  const n = performances.length;
  if (n === 0) return emptyTeamKPIs();

  const goals = sum(performances, 'goals');
  const assists = sum(performances, 'assists');
  const shots = sum(performances, 'shots');
  const onTarget = sum(performances, 'shots_on_target');
  const passComp = sum(performances, 'passes_completed');
  const passAtt = sum(performances, 'passes_attempted');
  const tackles = sum(performances, 'tackles');

  const passAcc = passAtt > 0 ? (passComp / passAtt) * 100 : 0;
  const gpm = goals / Math.max(1, n);
  const tpm = tackles / Math.max(1, n);
  const spm = shots / Math.max(1, n);
  const conversion = shots > 0 ? (goals / shots) * 100 : 0;

  // Team style detection
  let style = 'Balanced';
  let identity = 'Versatile team that adapts to opponents';
  if (passAcc > 80 && passComp / n > 30) { style = 'Possession-based'; identity = 'Patient build-up with high pass accuracy, controlling tempo'; }
  else if (gpm > 2) { style = 'Attack-minded'; identity = 'Direct attacking approach with emphasis on creating chances'; }
  else if (tpm > 20) { style = 'High-pressing'; identity = 'Intense pressing with quick transitions after recovery'; }
  else if (tpm > 15 && gpm < 1) { style = 'Defensive'; identity = 'Solid defensive block, relying on counter-attacks'; }

  const defensiveLineHeight = tpm > 18 ? 'high' : tpm > 12 ? 'medium' : 'low';
  const transitionSpeed = gpm > 1.5 && tpm > 15 ? 'fast' : gpm > 1 ? 'medium' : 'slow';
  const compactness = passAcc > 78 ? 'compact' : passAcc > 65 ? 'balanced' : 'spread';

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (passAcc > 78) strengths.push('Excellent ball retention');
  if (gpm > 1.5) strengths.push('Clinical finishing');
  if (tpm > 18) strengths.push('Dominant pressing');
  if (conversion > 15) strengths.push('High shot conversion');
  if (passAcc < 68) weaknesses.push('Passing accuracy needs improvement');
  if (gpm < 0.8) weaknesses.push('Low goal output');
  if (tpm < 10) weaknesses.push('Lack of defensive engagement');

  return {
    possessionEfficiency: +passAcc.toFixed(0),
    pressingSuccessRate: +(Math.min(60, tpm * 2.5)).toFixed(0),
    defensiveLineHeight, transitionSpeed,
    tacticalCompactness: compactness,
    goalsScored: goals, goalsConceded: 0,
    goalsPerMatch: +gpm.toFixed(1),
    cleanSheetRate: 0,
    avgPassAccuracy: +passAcc.toFixed(0),
    tacklesPerMatch: +tpm.toFixed(1),
    shotsPerMatch: +spm.toFixed(1),
    shotConversion: +conversion.toFixed(0),
    teamStyle: style, teamIdentity: identity,
    strengths, weaknesses,
  };
}

// Helpers
function sum(arr: any[], key: string) { return arr.reduce((s, p) => s + (p[key] || 0), 0); }
function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function emptyKPIs(): PlayerKPIs {
  return { goalsPerMatch: 0, assistsPerMatch: 0, shotsPerMatch: 0, shotAccuracy: 0, conversionRate: 0,
    xGContribution: 0, offensiveContribution: 0, passAccuracy: 0, passesPerMatch: 0, progressivePasses: 0,
    keyPasses: 0, tacklesPerMatch: 0, tackleSuccessRate: 0, interceptions: 0, recoveries: 0,
    defensiveContribution: 0, minutesPerMatch: 0, matchesPlayed: 0, availability: 0, avgRating: 0,
    last5Rating: 0, formTrend: 'stable', consistencyScore: 0, overallScore: 0 };
}
function emptyTeamKPIs(): TeamKPIs {
  return { possessionEfficiency: 0, pressingSuccessRate: 0, defensiveLineHeight: 'medium',
    transitionSpeed: 'medium', tacticalCompactness: 'balanced', goalsScored: 0, goalsConceded: 0,
    goalsPerMatch: 0, cleanSheetRate: 0, avgPassAccuracy: 0, tacklesPerMatch: 0, shotsPerMatch: 0,
    shotConversion: 0, teamStyle: 'Unknown', teamIdentity: 'No data', strengths: [], weaknesses: [] };
}
