export type PlayerStatus = 'fit' | 'injured' | 'recovering' | 'inactive' | 'suspended';
export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
export type InjurySeverity = 'minor' | 'moderate' | 'severe';
export type InjuryStatus = 'active' | 'recovered';
export type AgeGroup = 'U6'|'U7'|'U8'|'U9'|'U10'|'U11'|'U12'|'U13'|'U14'|'U15'|'U16'|'U17'|'U18'|'U19'|'U20'|'U21'|'U22'|'U23'|'Senior';
export type RecruitmentStatus = 'interested' | 'contacted' | 'trial' | 'signed' | 'rejected' | 'not_interested';
export type CoachRole = 'coach' | 'admin';
export type SessionPhase = 'warm_up' | 'main' | 'cool_down';
export type TrainingFocus = 'attacking' | 'defending' | 'transitions' | 'set_pieces' | 'physical' | 'tactical' | 'technical' | 'mental';
export type MacrocyclePhase = 'pre_season' | 'early_season' | 'mid_season' | 'late_season' | 'off_season';

export const AGE_GROUPS: AgeGroup[] = ['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','U20','U21','U22','U23','Senior'];
export const POSITIONS: PlayerPosition[] = ['GK','DEF','MID','FWD'];

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward'
};

export interface Coach {
  id: string; email: string; full_name: string; club_name: string | null;
  phone_whatsapp: string | null; role: CoachRole; created_at: string;
  staff_role?: string | null; phone?: string | null;
}

export interface Team {
  id: string; coach_id: string; name: string; age_group: AgeGroup | null;
  division: string | null; logo_url: string | null; created_at: string;
  formation?: string | null; playing_style?: string | null;
  season_goal?: string | null; target_league_position?: number | null;
}

export interface Player {
  id: string; coach_id: string; team_id: string | null;
  first_name: string; last_name: string; date_of_birth: string;
  position: PlayerPosition; age_group: AgeGroup | null;
  jersey_number: number | null; height_cm: number | null; weight_kg: number | null;
  nationality: string | null; whatsapp_number: string | null;
  photo_url: string | null; photo_bucket_path: string | null;
  status: PlayerStatus; notes: string | null;
  preferred_foot?: string | null; contract_expiry?: string | null;
  market_value?: number | null; agent_name?: string | null;
  created_at: string; updated_at: string;
}

export interface Injury {
  id: string; player_id: string; coach_id: string;
  injury_type: string; body_part: string; severity: InjurySeverity;
  injury_date: string; expected_recovery_days: number;
  expected_return_date: string; actual_return_date: string | null;
  status: InjuryStatus; notes: string | null;
  treatment_protocol?: string | null; physio_notes?: string | null;
  created_at: string;
}

export interface Performance {
  id: string; player_id: string; team_id: string | null; coach_id: string;
  match_date: string; opponent: string; minutes_played: number;
  goals: number; assists: number; passes_completed: number; passes_attempted: number;
  tackles: number; shots: number; shots_on_target: number;
  yellow_cards?: number; red_cards?: number; distance_km?: number;
  sprint_count?: number; top_speed_kmh?: number;
  rating: number | null; notes: string | null;
  rpe?: number | null; // Rate of Perceived Exertion 1-10
  created_at: string;
}

export interface Session {
  id: string; team_id: string | null; coach_id: string;
  title: string; session_date: string; duration_minutes: number;
  focus_area: string; location: string | null; coach_notes: string | null;
  tactical_setup: string | null;
  week_number?: number | null; phase?: string | null;
  intensity_level?: number | null; // 1-10
  rpe_target?: number | null;
  objectives?: string | null;
  exercises?: SessionExercise[];
  created_at: string;
}

export interface SessionExercise {
  id: string;
  name: string;
  duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  description: string;
  phase: SessionPhase;
  players_count?: number;
  equipment?: string[];
  coaching_points?: string[];
  principle_id?: string;
}

export interface SessionPlayer {
  session_id: string; player_id: string; attended: boolean; individual_notes: string | null;
  rpe_actual?: number | null;
}

export interface Evaluation {
  id: string; player_id: string; coach_id: string; evaluation_date: string;
  tech_first_touch: number | null; tech_passing: number | null;
  tech_shooting: number | null; tech_dribbling: number | null;
  tac_positioning: number | null; tac_decision_making: number | null; tac_game_reading: number | null;
  phy_speed: number | null; phy_strength: number | null; phy_endurance: number | null;
  men_concentration: number | null; men_confidence: number | null; men_teamwork: number | null;
  strengths: string | null; areas_to_improve: string | null; general_notes: string | null;
  created_at: string;
}

export interface Recruitment {
  id: string; coach_id: string; first_name: string; last_name: string;
  age_group: AgeGroup | null; position: PlayerPosition | null;
  phone_number: string | null; whatsapp_number: string | null; email: string | null;
  club_origin: string | null; notes: string | null;
  photo_url: string | null; photo_bucket_path: string | null;
  status: RecruitmentStatus;
  contacted_date: string | null; trial_date: string | null;
  nationality?: string | null; market_value_estimate?: number | null;
  scout_tech_ball_control: number | null; scout_tech_passing: number | null;
  scout_tech_shooting: number | null; scout_tech_dribbling: number | null;
  scout_phy_speed: number | null; scout_phy_strength: number | null;
  scout_phy_endurance: number | null; scout_phy_agility: number | null;
  scout_tac_positioning: number | null; scout_tac_awareness: number | null; scout_tac_decision: number | null;
  scout_psy_confidence: number | null; scout_psy_leadership: number | null;
  scout_psy_composure: number | null; scout_psy_work_ethic: number | null;
  scout_overall_rating: number | null; scout_recommendation: string | null;
  ai_scout_report?: string | null;
  created_at: string; updated_at: string;
}

export interface VideoAnalysis {
  id: string; coach_id: string; team_id: string | null; player_id: string | null;
  title: string; video_url: string | null; video_bucket_path: string | null;
  duration_seconds: number | null; annotations: VideoAnnotation[];
  ai_summary: string | null; tags: string[];
  match_date?: string | null; opponent?: string | null;
  created_at: string;
}

export interface VideoAnnotation {
  id: string; time_seconds: number; type: string;
  label: string; description?: string; player_id?: string;
  x?: number; y?: number; // pitch coordinates
}

export interface AiAnalysis {
  id: string; coach_id: string; player_id: string | null; team_id: string | null;
  analysis_type: string; prompt: string | null; result: string | null;
  created_at: string;
}

// Training Load / Season Planning
export interface TrainingLoad {
  week: number; year: number; team_id: string;
  total_rpe: number; session_count: number;
  avg_intensity: number; high_intensity_minutes: number;
  phase: MacrocyclePhase;
}

export interface KpiTarget {
  player_id: string; metric: string;
  target_value: number; current_value: number;
  deadline: string; notes?: string;
}
