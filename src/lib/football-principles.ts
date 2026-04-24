// Football principles analysis engine
// Analyses team performance data and returns playing style insights

import type { Performance, Player } from './types';

export interface TeamStyle {
  label: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export function analyzeTeamStyle(performances: Performance[], players: Player[]): TeamStyle | null {
  if (performances.length < 3) return null;

  const totalGoals = performances.reduce((s, p) => s + (p.goals ?? 0), 0);
  const totalAssists = performances.reduce((s, p) => s + (p.assists ?? 0), 0);
  const avgRating = performances.reduce((s, p) => s + (p.rating ?? 0), 0) / performances.length;
  const avgPasses = performances.reduce((s, p) => s + (p.passes_completed ?? 0), 0) / performances.length;
  const avgPassAtt = performances.reduce((s, p) => s + (p.passes_attempted ?? 0), 0) / performances.length;
  const passAcc = avgPassAtt > 0 ? (avgPasses / avgPassAtt) * 100 : 0;
  const avgTackles = performances.reduce((s, p) => s + (p.tackles ?? 0), 0) / performances.length;
  const avgShots = performances.reduce((s, p) => s + (p.shots ?? 0), 0) / performances.length;
  const avgShotsOnTarget = performances.reduce((s, p) => s + (p.shots_on_target ?? 0), 0) / performances.length;
  const shotAcc = avgShots > 0 ? (avgShotsOnTarget / avgShots) * 100 : 0;

  const positionGroups = {
    defenders: players.filter(p => p.position === 'DEF').length,
    midfielders: players.filter(p => p.position === 'MID').length,
    forwards: players.filter(p => p.position === 'FWD').length,
  };

  // Classify style based on stats
  const isHighPressing = avgTackles > 15;
  const isPossessionBased = passAcc > 75;
  const isDirectPlay = avgShots > 12;
  const isTechnical = passAcc > 80;
  const isPhysical = avgTackles > 12 && avgShots < 10;

  let label = 'Balanced';
  let description = 'A well-rounded side that adapts to circumstances.';
  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let recommendation = '';

  if (isHighPressing && isPossessionBased) {
    label = 'High-Intensity Possession';
    description = 'The team controls possession and presses aggressively to win the ball high up the pitch — similar to elite European models.';
    strengths = ['High press effectiveness', 'Ball retention', 'Territorial dominance', 'Rapid transitions'];
    weaknesses = ['Vulnerable to balls in behind', 'Requires high fitness levels', 'Risk of fatigue in congestion'];
    recommendation = 'Maintain pressing intensity through squad rotation. Work on defensive shape after failed press.';
  } else if (isDirectPlay && !isPossessionBased) {
    label = 'Direct & Vertical';
    description = 'Quick, vertical attacks prioritised over possession. The team exploits spaces with direct passes and runs in behind.';
    strengths = ['Speed of transition', 'Unpredictability', 'Goal threat', 'Effective on counter'];
    weaknesses = ['Ball retention under pressure', 'Dominance in possession phases', 'Build-up vulnerability'];
    recommendation = 'Improve pass accuracy to reduce turnovers. Add structured build-up patterns to complement direct play.';
  } else if (isPossessionBased && !isHighPressing) {
    label = 'Controlled Possession';
    description = 'Patient build-up with emphasis on ball circulation and positional play. The team dictates tempo.';
    strengths = ['Ball security', 'Game management', 'Structured build-up', 'Low turnover rate'];
    weaknesses = ['Lack of urgency in final third', 'Can be predictable', 'Vulnerable to low block defence'];
    recommendation = 'Increase penetrating runs and combinations to break down compact defences. Add more directness in final third.';
  } else if (isPhysical) {
    label = 'Physically Dominant';
    description = 'The team wins duels, second balls and set pieces through physicality and intensity.';
    strengths = ['Set piece threat', 'Defensive duels', 'Second ball winning', 'Aerial dominance'];
    weaknesses = ['Technical quality under pressure', 'Build-up from the back', 'Possession retention'];
    recommendation = 'Develop more technical patterns to complement physical strengths. Work on possession play from defensive third.';
  } else {
    label = 'Developing Identity';
    description = 'The team is still establishing a clear footballing identity — an opportunity to implement a defined model.';
    strengths = ['Tactical flexibility', 'Can adapt to different opponents'];
    weaknesses = ['Inconsistent game model', 'Unpredictable performance levels'];
    recommendation = 'Define clear game principles (see Game Principles module) and embed them through deliberate training.';
  }

  return { label, description, strengths, weaknesses, recommendation };
}

// KPI evaluation helpers
export function getPlayerOvr(evaluation: Record<string, number | null>): number {
  const fields = [
    'tech_first_touch', 'tech_passing', 'tech_shooting', 'tech_dribbling',
    'tac_positioning', 'tac_decision_making', 'tac_game_reading',
    'phy_speed', 'phy_strength', 'phy_endurance',
    'men_concentration', 'men_confidence', 'men_teamwork',
  ];
  const values = fields.map(f => evaluation[f]).filter((v): v is number => v !== null && v !== undefined);
  if (values.length === 0) return 0;
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10);
}

export function getPositionBenchmarks(position: string): Record<string, number> {
  const benchmarks: Record<string, Record<string, number>> = {
    GK: { tech_passing: 7, phy_strength: 8, men_concentration: 9, phy_endurance: 7, men_confidence: 8 },
    DEF: { tac_positioning: 8, phy_strength: 8, men_concentration: 8, tac_decision_making: 7, tac_game_reading: 8 },
    MID: { tech_passing: 8, tac_decision_making: 8, phy_endurance: 8, tac_game_reading: 8, men_teamwork: 8 },
    FWD: { tech_shooting: 8, tech_dribbling: 8, phy_speed: 8, men_confidence: 8, tac_positioning: 7 },
  };
  return benchmarks[position] || {};
}

export function getTrainingRecommendations(evaluation: Record<string, number | null>, position: string): string[] {
  const benchmarks = getPositionBenchmarks(position);
  const recommendations: string[] = [];

  const fieldLabels: Record<string, string> = {
    tech_first_touch: 'First touch', tech_passing: 'Passing accuracy', tech_shooting: 'Finishing',
    tech_dribbling: 'Dribbling', tac_positioning: 'Positioning', tac_decision_making: 'Decision making',
    tac_game_reading: 'Game reading', phy_speed: 'Speed & acceleration', phy_strength: 'Physical strength',
    phy_endurance: 'Endurance', men_concentration: 'Concentration', men_confidence: 'Confidence',
    men_teamwork: 'Team play',
  };

  Object.entries(benchmarks).forEach(([field, benchmark]) => {
    const actual = evaluation[field] as number | null;
    if (actual !== null && actual !== undefined && actual < benchmark) {
      const gap = benchmark - actual;
      const label = fieldLabels[field] || field;
      if (gap >= 3) {
        recommendations.push(`Priority: Intensive ${label} work — ${gap} points below position benchmark`);
      } else if (gap >= 1) {
        recommendations.push(`Focus: ${label} improvement — ${gap} point gap to position standard`);
      }
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('Meeting all position benchmarks — focus on maintaining standards and developing advanced skills');
  }

  return recommendations;
}
