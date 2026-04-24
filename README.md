# ⚽ Ajman Coach Pro — v7 PRO

**Elite Football Management & Coaching Platform**

A full-stack, commercial-grade football coaching platform built for professional academy and club use. Used at Ajman Club — built with Next.js 14, TypeScript, Supabase, and Claude AI.

---

## 🚀 Feature Overview

| Module | Status | Description |
|---|---|---|
| 📊 Dashboard | ✅ | Command centre — live KPIs, squad status, recent activity |
| 🏆 Team Profile | ✅ | Squad overview, playing style analysis, training load charts |
| 📅 Season Planner | ✅ | Macrocycle phases, weekly microcycle, KPI targets |
| 👥 Players | ✅ | Full squad management with photos, physicals, contract data |
| 📈 Player KPIs | ✅ | Technical/tactical/physical/mental evaluation system |
| 🏥 Medical | ✅ | Injury tracking, severity grading, recovery timelines |
| 📊 Performance | ✅ | Match stats, ratings, team & individual trends |
| 🏋️ Training | ✅ | Session builder with exercise planner, RPE, load tracking |
| 📖 Game Principles | ✅ | Full attacking, defending & transition philosophy |
| 🎬 Match Analysis | ✅ | Event tagging, tactical view, pattern detection |
| 📹 Video Hub | ✅ | Video upload, annotation, AI summary |
| 🤖 AI Analyzer | ✅ | Claude-powered analysis — performance, tactics, scouting |
| 📑 Reports | ✅ | Player & team reports, PDF-ready structure |
| 🔍 Scouting | ✅ | Kanban pipeline, evaluation system, AI scouting reports |
| 🛡️ Admin | ✅ | Coach management, role control, system overview |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts
- **AI**: Anthropic Claude (claude-sonnet-4-20250514)
- **PDF**: @react-pdf/renderer
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- A Supabase account (free tier works)
- An Anthropic API key (for AI features)

### 1. Clone and install

```bash
git clone <your-repo>
cd ajman-coach-pro
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-api03-...   # optional — enables AI analysis
```

### 3. Set up the database

1. Go to [supabase.com](https://supabase.com) → New project
2. Open the SQL Editor
3. Paste the entire contents of `supabase/schema.sql` and run it
4. Go to Storage → Create a new bucket called `player-photos` (public bucket)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create your account

1. Navigate to `/signup`
2. Register with your email
3. To make yourself admin, run this in the Supabase SQL editor:
   ```sql
   UPDATE public.coaches SET role = 'admin' WHERE email = 'your@email.com';
   ```

---

## 🚢 Deploy to Vercel

### Option A: Vercel Dashboard (recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY` (optional)
4. Deploy

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🗄️ Database Schema

The schema in `supabase/schema.sql` creates:

| Table | Purpose |
|---|---|
| `coaches` | User accounts with roles (coach/admin) |
| `teams` | Teams/squads managed by coaches |
| `players` | Player profiles with full physical/contact data |
| `injuries` | Injury log with recovery tracking |
| `performances` | Match statistics per player |
| `sessions` | Training sessions with exercise data |
| `session_players` | Attendance and individual notes |
| `evaluations` | Technical/tactical/physical/mental ratings |
| `recruitment` | Scouting pipeline with full evaluation |
| `video_analyses` | Video uploads with annotations and AI summaries |
| `ai_analyses` | Log of all AI analysis requests and results |

All tables have **Row Level Security** — coaches only see their own data. Admins see all data.

---

## 🤖 AI Features

AI features use the Anthropic Claude API. To enable:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Add `ANTHROPIC_API_KEY=sk-ant-...` to your environment variables

AI is used for:
- **Player performance analysis** — detailed breakdowns with recommendations
- **Tactical team reports** — formation, style, collective improvements
- **Training plan generation** — AI creates a full microcycle
- **Scouting reports** — professional scout-level player assessment
- **Match analysis** — pattern detection, opposition insights
- **Injury risk assessment** — load management recommendations

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & signup pages
│   ├── api/              # API routes (REST endpoints + AI)
│   │   ├── ai/analyze/   # Claude AI analysis endpoint
│   │   ├── performances/ # Match performance CRUD
│   │   ├── players/      # Player management CRUD
│   │   ├── sessions/     # Training sessions CRUD
│   │   ├── recruitment/  # Scouting pipeline CRUD
│   │   └── ...
│   └── dashboard/
│       ├── page.tsx              # Main dashboard
│       ├── team-profile/         # Team overview & analytics
│       ├── season-planner/       # Macrocycle planning
│       ├── players/              # Player management
│       ├── player-analytics/     # KPI tracking
│       ├── injuries/             # Medical module
│       ├── performance/          # Match performance
│       ├── sessions/             # Training sessions
│       ├── principles/           # Game philosophy
│       ├── match-analysis/       # Tactical analysis
│       ├── video/                # Video hub
│       ├── ai-analyzer/          # AI intelligence
│       ├── reports/              # Reports centre
│       ├── scouting/             # Recruitment pipeline
│       └── admin/                # Admin panel
├── components/           # Reusable UI components
├── lib/
│   ├── supabase/         # Supabase client setup
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Utility functions
│   ├── football-principles.ts  # Playing style analysis engine
│   └── kpi/engine.ts    # KPI calculation engine
└── middleware.ts         # Auth middleware
```

---

## 🎨 Design System

The platform uses a custom orange brand palette inspired by Ajman Club's identity:

- **Primary**: `#EA580C` (brand-600) — orange
- **Light mode**: warm cream background (`#FFF7ED`)
- **Dark mode**: deep slate (`#0f172a`)
- **Cards**: white / dark slate with orange border accents
- **Gradients**: `gradient-brand` (orange spectrum)

All colours are CSS variables for seamless dark mode.

---

## 🔐 Security

- Supabase Auth handles all authentication (email/password)
- Row Level Security ensures coaches see only their own data
- Admin role gives cross-coach visibility for club management
- No API keys are exposed to the client

---

## 📄 License

Commercial use — Ajman Club. All rights reserved.

---

## 🆘 Support

For setup issues:
1. Check Supabase project is active and schema is applied
2. Verify all environment variables are set
3. Check browser console for errors
4. Ensure Supabase storage bucket `player-photos` exists

---

Built with ❤️ for elite football coaching.
