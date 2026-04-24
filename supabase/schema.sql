-- =======================================================
-- AJMAN COACH PRO v7 PRO — COMPLETE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor.
-- =======================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- COACHES
CREATE TABLE IF NOT EXISTS public.coaches (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  club_name text DEFAULT 'Ajman Club',
  phone_whatsapp text,
  role text NOT NULL DEFAULT 'coach' CHECK (role IN ('coach','admin')),
  created_at timestamptz DEFAULT now()
);

-- TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  name text NOT NULL,
  age_group text,
  division text,
  logo_url text,
  formation text DEFAULT '4-3-3',
  playing_style text,
  season_goal text,
  target_league_position int,
  created_at timestamptz DEFAULT now()
);

-- PLAYERS
CREATE TABLE IF NOT EXISTS public.players (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  position text NOT NULL CHECK (position IN ('GK','DEF','MID','FWD')),
  age_group text,
  jersey_number int,
  height_cm numeric,
  weight_kg numeric,
  nationality text,
  whatsapp_number text,
  photo_url text,
  photo_bucket_path text,
  status text NOT NULL DEFAULT 'fit' CHECK (status IN ('fit','injured','recovering','inactive','suspended')),
  notes text,
  preferred_foot text CHECK (preferred_foot IN ('right','left','both')),
  contract_expiry date,
  market_value numeric,
  agent_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- INJURIES
CREATE TABLE IF NOT EXISTS public.injuries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  injury_type text NOT NULL,
  body_part text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('minor','moderate','severe')),
  injury_date date NOT NULL,
  expected_recovery_days int NOT NULL,
  expected_return_date date NOT NULL,
  actual_return_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','recovered')),
  notes text,
  treatment_protocol text,
  physio_notes text,
  created_at timestamptz DEFAULT now()
);

-- PERFORMANCES
CREATE TABLE IF NOT EXISTS public.performances (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  match_date date NOT NULL,
  opponent text NOT NULL,
  minutes_played int DEFAULT 0,
  goals int DEFAULT 0,
  assists int DEFAULT 0,
  passes_completed int DEFAULT 0,
  passes_attempted int DEFAULT 0,
  tackles int DEFAULT 0,
  shots int DEFAULT 0,
  shots_on_target int DEFAULT 0,
  yellow_cards int DEFAULT 0,
  red_cards int DEFAULT 0,
  distance_km numeric,
  sprint_count int,
  top_speed_kmh numeric,
  rating numeric CHECK (rating >= 0 AND rating <= 10),
  rpe int CHECK (rpe >= 1 AND rpe <= 10),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- SESSIONS
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  title text NOT NULL,
  session_date date NOT NULL,
  duration_minutes int NOT NULL DEFAULT 90,
  focus_area text NOT NULL,
  location text,
  coach_notes text,
  tactical_setup text,
  week_number int,
  phase text,
  intensity_level int CHECK (intensity_level >= 1 AND intensity_level <= 10),
  rpe_target int CHECK (rpe_target >= 1 AND rpe_target <= 10),
  objectives text,
  created_at timestamptz DEFAULT now()
);

-- SESSION PLAYERS
CREATE TABLE IF NOT EXISTS public.session_players (
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  attended boolean DEFAULT true,
  individual_notes text,
  rpe_actual int CHECK (rpe_actual >= 1 AND rpe_actual <= 10),
  PRIMARY KEY (session_id, player_id)
);

-- EVALUATIONS
CREATE TABLE IF NOT EXISTS public.evaluations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  evaluation_date date NOT NULL DEFAULT current_date,
  tech_first_touch int CHECK (tech_first_touch BETWEEN 1 AND 10),
  tech_passing int CHECK (tech_passing BETWEEN 1 AND 10),
  tech_shooting int CHECK (tech_shooting BETWEEN 1 AND 10),
  tech_dribbling int CHECK (tech_dribbling BETWEEN 1 AND 10),
  tac_positioning int CHECK (tac_positioning BETWEEN 1 AND 10),
  tac_decision_making int CHECK (tac_decision_making BETWEEN 1 AND 10),
  tac_game_reading int CHECK (tac_game_reading BETWEEN 1 AND 10),
  phy_speed int CHECK (phy_speed BETWEEN 1 AND 10),
  phy_strength int CHECK (phy_strength BETWEEN 1 AND 10),
  phy_endurance int CHECK (phy_endurance BETWEEN 1 AND 10),
  men_concentration int CHECK (men_concentration BETWEEN 1 AND 10),
  men_confidence int CHECK (men_confidence BETWEEN 1 AND 10),
  men_teamwork int CHECK (men_teamwork BETWEEN 1 AND 10),
  strengths text,
  areas_to_improve text,
  general_notes text,
  created_at timestamptz DEFAULT now()
);

-- RECRUITMENT / SCOUTING
CREATE TABLE IF NOT EXISTS public.recruitment (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  first_name text NOT NULL, last_name text NOT NULL,
  age_group text, position text,
  phone_number text, whatsapp_number text, email text,
  club_origin text, notes text,
  photo_url text, photo_bucket_path text,
  status text DEFAULT 'interested' CHECK (status IN ('interested','contacted','trial','signed','rejected','not_interested')),
  contacted_date date, trial_date date,
  nationality text,
  market_value_estimate numeric,
  scout_tech_ball_control int, scout_tech_passing int, scout_tech_shooting int, scout_tech_dribbling int,
  scout_phy_speed int, scout_phy_strength int, scout_phy_endurance int, scout_phy_agility int,
  scout_tac_positioning int, scout_tac_awareness int, scout_tac_decision int,
  scout_psy_confidence int, scout_psy_leadership int, scout_psy_composure int, scout_psy_work_ethic int,
  scout_overall_rating numeric, scout_recommendation text,
  ai_scout_report text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- VIDEO ANALYSIS
CREATE TABLE IF NOT EXISTS public.video_analyses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  title text NOT NULL,
  video_url text, video_bucket_path text, duration_seconds int,
  annotations jsonb DEFAULT '[]',
  ai_summary text,
  tags text[] DEFAULT '{}',
  match_date date,
  opponent text,
  created_at timestamptz DEFAULT now()
);

-- AI ANALYSIS LOGS
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  analysis_type text NOT NULL DEFAULT 'performance',
  prompt text, result text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- ADMIN HELPER
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
  SELECT EXISTS(SELECT 1 FROM public.coaches WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DO $$ DECLARE r RECORD;
BEGIN FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
  EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
END LOOP; END $$;

-- Policies
CREATE POLICY "coaches_select" ON public.coaches FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "coaches_insert" ON public.coaches FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "coaches_update" ON public.coaches FOR UPDATE USING (id = auth.uid());

CREATE POLICY "teams_all" ON public.teams FOR ALL USING (coach_id = auth.uid() OR public.is_admin());
CREATE POLICY "players_all" ON public.players FOR ALL USING (coach_id = auth.uid() OR public.is_admin());
CREATE POLICY "injuries_all" ON public.injuries FOR ALL USING (coach_id = auth.uid() OR public.is_admin());
CREATE POLICY "performances_all" ON public.performances FOR ALL USING (coach_id = auth.uid() OR public.is_admin());
CREATE POLICY "sessions_all" ON public.sessions FOR ALL USING (coach_id = auth.uid() OR public.is_admin());
CREATE POLICY "evaluations_all" ON public.evaluations FOR ALL USING (coach_id = auth.uid() OR public.is_admin());
CREATE POLICY "recruitment_all" ON public.recruitment FOR ALL USING (coach_id = auth.uid() OR public.is_admin());
CREATE POLICY "video_all" ON public.video_analyses FOR ALL USING (coach_id = auth.uid() OR public.is_admin());
CREATE POLICY "ai_all" ON public.ai_analyses FOR ALL USING (coach_id = auth.uid() OR public.is_admin());
CREATE POLICY "session_players_all" ON public.session_players FOR ALL
  USING (EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_id AND (s.coach_id = auth.uid() OR public.is_admin())));

-- =============================================
-- TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_players_updated ON public.players;
CREATE TRIGGER trg_players_updated BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_recruitment_updated ON public.recruitment;
CREATE TRIGGER trg_recruitment_updated BEFORE UPDATE ON public.recruitment FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create coach row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.coaches (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'coach');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- MAKE YOURSELF ADMIN (run after first signup):
-- UPDATE public.coaches SET role = 'admin' WHERE email = 'your@email.com';
-- =============================================

-- =============================================
-- ADD STAFF ROLE COLUMN (run if upgrading from v6)
-- =============================================
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS staff_role text;
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS phone text;

-- Update the auto-create function to include staff_role
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.coaches (id, email, full_name, club_name, staff_role, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'club_name', 'Ajman Club'),
    COALESCE(NEW.raw_user_meta_data->>'staff_role', 'Coach'),
    'coach'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    club_name = EXCLUDED.club_name,
    staff_role = EXCLUDED.staff_role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- V8 MIGRATION: Add staff_role if not exists
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='staff_role') THEN
    ALTER TABLE public.coaches ADD COLUMN staff_role text;
  END IF;
END $$;

-- Recreate trigger with staff_role support
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.coaches (id, email, full_name, club_name, staff_role, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'club_name', 'Ajman Club'),
    COALESCE(NEW.raw_user_meta_data->>'staff_role', NULL),
    'coach'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    club_name = EXCLUDED.club_name,
    staff_role = EXCLUDED.staff_role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
