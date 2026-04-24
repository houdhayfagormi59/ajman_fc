export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import { FileText, Users, TrendingUp, Download, ChevronRight, BarChart3, Star } from 'lucide-react';

export default async function ReportsPage() {
  const supabase = createClient();
  const { data: players } = await supabase.from('players')
    .select('id, first_name, last_name, position, age_group, team_id, status, teams(name)')
    .order('last_name');

  const allPlayers = (players ?? []) as any[];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="section-header">Reports Centre</h1>
        <p className="section-sub">Player evaluations, team analysis & AI-generated development reports</p>
      </div>

      {/* Report types */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: <Users size={24} />, title: 'Player Reports', color: 'text-brand-600',
            desc: 'Multi-attribute player evaluation with AI recommendations and development tracking.',
            count: allPlayers.length, unit: 'players',
          },
          {
            icon: <BarChart3 size={24} />, title: 'Team Analysis', color: 'text-blue-600',
            desc: 'Squad composition, performance trends and collective performance insights.',
            count: null, unit: '',
          },
          {
            icon: <TrendingUp size={24} />, title: 'KPI Reports', color: 'text-emerald-600',
            desc: 'Season KPI tracking against targets — for coaching staff and management.',
            count: null, unit: '',
          },
        ].map(({ icon, title, color, desc, count, unit }) => (
          <div key={title} className="card p-5 gradient-brand-soft card-hover">
            <div className={`mb-3 ${color}`}>{icon}</div>
            <h2 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            {count !== null && (
              <div className="text-xs font-semibold text-brand-600">{count} {unit} available</div>
            )}
          </div>
        ))}
      </div>

      {/* Player reports list */}
      <div className="card p-4">
        <h2 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <FileText size={15} className="text-brand-600" /> Individual Player Reports
        </h2>

        {allPlayers.length === 0 ? (
          <EmptyState icon={<Users size={40} />} title="No players found" description="Add players to generate reports." />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {allPlayers.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-3 hover:bg-brand-50 dark:hover:bg-slate-700 -mx-4 px-4 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-glow-orange">
                    {p.first_name[0]}{p.last_name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {p.first_name} {p.last_name}
                    </div>
                    <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span className="pill-slate">{p.position}</span>
                      <span>{p.age_group}</span>
                      {p.teams?.name && <span>· {p.teams.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status as any}>{p.status}</Badge>
                  <Link href={`/dashboard/reports/${p.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg gradient-brand text-white text-xs font-semibold hover:opacity-90 transition shadow-glow-orange">
                    <FileText size={12} /> Report <ChevronRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick export info */}
      <div className="card p-4 flex items-start gap-3">
        <Download size={18} className="text-brand-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Export & Share Reports</div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Individual player reports include full evaluation history, match statistics, physical metrics and AI-generated development recommendations.
            Each report is formatted for PDF export and sharing with players, parents or club management.
          </p>
        </div>
      </div>
    </div>
  );
}
