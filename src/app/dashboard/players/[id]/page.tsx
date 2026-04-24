export const dynamic = "force-dynamic";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { ageFromDOB, formatDate, passAccuracy } from '@/lib/utils';
import { Pencil, FileText, ChevronLeft } from 'lucide-react';
import type { Player, Injury, Performance } from '@/lib/types';
import DeletePlayerButton from './DeletePlayerButton';

export default async function PlayerDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [playerR, injuriesR, perfR, evalR] = await Promise.all([
    supabase.from('players').select('*').eq('id', params.id).single(),
    supabase.from('injuries').select('*').eq('player_id', params.id).order('injury_date', { ascending: false }),
    supabase.from('performances').select('*').eq('player_id', params.id).order('match_date', { ascending: false }).limit(20),
    supabase.from('evaluations').select('*').eq('player_id', params.id).order('evaluation_date', { ascending: false }).limit(1),
  ]);

  if (playerR.error || !playerR.data) notFound();
  const player = playerR.data as Player;
  const injuries = (injuriesR.data ?? []) as Injury[];
  const performances = (perfR.data ?? []) as Performance[];
  const latestEval = evalR.data?.[0];

  const totalGoals = performances.reduce((s, p) => s + (p.goals ?? 0), 0);
  const totalAssists = performances.reduce((s, p) => s + (p.assists ?? 0), 0);
  const totalPasses = performances.reduce((s, p) => s + (p.passes_completed ?? 0), 0);
  const totalAttempts = performances.reduce((s, p) => s + (p.passes_attempted ?? 0), 0);
  const ratings = performances.map((p) => p.rating).filter((r): r is number => r !== null);
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(2) : '—';

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in-up">
      <Link href="/dashboard/players" className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline">
        <ChevronLeft size={16} /> Back to players
      </Link>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-5 md:justify-between">
          <div className="flex gap-5 items-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center text-5xl overflow-hidden shadow-glow-orange border-2 border-brand-200">
              {player.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.photo_url} alt="" className="w-full h-full object-cover" />
              ) : '⚽'}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-brand-800">{player.first_name} {player.last_name}</h1>
                <Badge variant={player.status}>{player.status}</Badge>
              </div>
              <div className="text-sm text-slate-600 mt-1">
                <span className="font-semibold">{player.position}</span> · {player.age_group || 'N/A'}
                {player.jersey_number ? ` · #${player.jersey_number}` : ''}
                {` · Age ${ageFromDOB(player.date_of_birth)}`}
                {player.nationality ? ` · ${player.nationality}` : ''}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link href={`/dashboard/reports/${player.id}`}>
              <Button variant="secondary"><FileText size={15} /> Report</Button>
            </Link>
            <Link href={`/dashboard/players/${player.id}/edit`}>
              <Button variant="secondary"><Pencil size={15} /> Edit</Button>
            </Link>
            <DeletePlayerButton playerId={player.id} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4 card-hover"><div className="label">Matches</div><div className="text-3xl font-extrabold text-brand-700">{performances.length}</div></div>
        <div className="card p-4 card-hover"><div className="label">Goals</div><div className="text-3xl font-extrabold text-brand-700">{totalGoals}</div></div>
        <div className="card p-4 card-hover"><div className="label">Assists</div><div className="text-3xl font-extrabold text-brand-700">{totalAssists}</div></div>
        <div className="card p-4 card-hover"><div className="label">Avg rating</div><div className="text-3xl font-extrabold text-brand-700">{avgRating}</div></div>
      </div>

      <section className="card p-6">
        <h2 className="font-bold text-brand-800 text-lg mb-4">Profile details</h2>
        <dl className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
          <Pair label="Date of birth" value={formatDate(player.date_of_birth)} />
          <Pair label="Height" value={player.height_cm ? `${player.height_cm} cm` : '—'} />
          <Pair label="Weight" value={player.weight_kg ? `${player.weight_kg} kg` : '—'} />
          <Pair label="Nationality" value={player.nationality || '—'} />
          <Pair label="Pass accuracy" value={`${passAccuracy(totalPasses, totalAttempts)}%`} />
          <Pair label="Added" value={formatDate(player.created_at)} />
        </dl>
        {player.notes && <p className="text-sm text-slate-700 mt-4 leading-relaxed whitespace-pre-line p-3 bg-brand-50 rounded-lg border border-brand-100">{player.notes}</p>}
      </section>

      <section className="card p-6">
        <h2 className="font-bold text-brand-800 text-lg mb-4">Recent matches</h2>
        {performances.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No matches recorded yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead><tr className="gradient-brand-soft border-y border-orange-200">
                {['Date','Opponent','Min','G','A','Passes','Shots','Rating'].map((h) => (
                  <th key={h} className="px-6 py-2.5 text-left text-xs font-semibold uppercase text-brand-800">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-orange-50">
                {performances.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-50/40">
                    <td className="px-6 py-2.5 text-slate-700">{formatDate(p.match_date)}</td>
                    <td className="px-6 py-2.5 text-slate-700 font-medium">{p.opponent}</td>
                    <td className="px-6 py-2.5">{p.minutes_played}</td>
                    <td className="px-6 py-2.5 font-bold text-brand-700">{p.goals}</td>
                    <td className="px-6 py-2.5">{p.assists}</td>
                    <td className="px-6 py-2.5">{p.passes_completed}/{p.passes_attempted}</td>
                    <td className="px-6 py-2.5">{p.shots_on_target}/{p.shots}</td>
                    <td className="px-6 py-2.5 font-bold">{p.rating ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-6">
        <h2 className="font-bold text-brand-800 text-lg mb-4">Injury history</h2>
        {injuries.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No injuries recorded. Keep it up! 💪</p>
        ) : (
          <ul className="divide-y divide-orange-50">
            {injuries.map((inj) => (
              <li key={inj.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-800">{inj.injury_type} — {inj.body_part}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatDate(inj.injury_date)} · {inj.severity} · expected return {formatDate(inj.expected_return_date)}
                  </div>
                  {inj.notes && <p className="text-xs text-slate-600 mt-1">{inj.notes}</p>}
                </div>
                <Badge variant={inj.status === 'active' ? 'danger' : 'success'}>{inj.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {latestEval && (
        <section className="card p-6">
          <h2 className="font-bold text-brand-800 text-lg mb-4">Latest evaluation — {formatDate(latestEval.evaluation_date)}</h2>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <EvalBlock title="Technical" items={[
              ['1st touch', latestEval.tech_first_touch], ['Passing', latestEval.tech_passing],
              ['Shooting', latestEval.tech_shooting], ['Dribbling', latestEval.tech_dribbling],
            ]} />
            <EvalBlock title="Tactical" items={[
              ['Positioning', latestEval.tac_positioning], ['Decision making', latestEval.tac_decision_making],
              ['Game reading', latestEval.tac_game_reading],
            ]} />
            <EvalBlock title="Physical" items={[
              ['Speed', latestEval.phy_speed], ['Strength', latestEval.phy_strength], ['Endurance', latestEval.phy_endurance],
            ]} />
            <EvalBlock title="Mental" items={[
              ['Concentration', latestEval.men_concentration], ['Confidence', latestEval.men_confidence], ['Teamwork', latestEval.men_teamwork],
            ]} />
          </div>
        </section>
      )}
    </div>
  );
}

function Pair({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><div className="label">{label}</div><div className="text-slate-800 font-medium mt-0.5">{value}</div></div>;
}

function EvalBlock({ title, items }: { title: string; items: [string, number | null][] }) {
  return (
    <div className="bg-gradient-to-br from-brand-50 to-white p-3 rounded-lg border border-brand-100">
      <div className="font-bold text-brand-700 mb-2">{title}</div>
      <ul className="space-y-1">
        {items.map(([k, v]) => (
          <li key={k} className="flex justify-between text-slate-700">
            <span>{k}</span><span className="font-bold">{v ?? '—'}/10</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
