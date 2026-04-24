export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { Activity, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { formatDate, daysUntil } from '@/lib/utils';

export default async function InjuriesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('injuries')
    .select('*, players(first_name, last_name, position, team_id, teams(name))')
    .order('injury_date', { ascending: false });

  const injuries = (data ?? []) as any[];
  const active = injuries.filter(i => i.status === 'active');
  const recovered = injuries.filter(i => i.status === 'recovered');
  const severe = active.filter(i => i.severity === 'severe');
  const moderate = active.filter(i => i.severity === 'moderate');
  const minor = active.filter(i => i.severity === 'minor');

  const sevColor = { minor: 'pill-yellow', moderate: 'pill-orange', severe: 'pill-red' };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="section-header">Medical Centre</h1>
        <p className="section-sub">Injury tracking, recovery timelines and physiotherapy notes</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center" style={{ borderColor: active.length > 0 ? '#ef4444' : undefined }}>
          <div className={`text-2xl font-extrabold ${active.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{active.length}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active injuries</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-red-600">{severe.length}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Severe</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-orange-500">{moderate.length}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Moderate</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-600">{recovered.length}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Recovered</div>
        </div>
      </div>

      {/* Active injuries */}
      {active.length > 0 && (
        <div>
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-red-600">
            <AlertTriangle size={15} /> Active Injuries ({active.length})
          </h2>
          <div className="space-y-3">
            {active.map(injury => {
              const days = daysUntil(injury.expected_return_date);
              const player = injury.players;
              return (
                <div key={injury.id} className={`card p-4 border-l-4 ${
                  injury.severity === 'severe' ? 'border-red-500' : injury.severity === 'moderate' ? 'border-orange-400' : 'border-yellow-400'
                }`}>
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      {player && (
                        <Link href={`/dashboard/players/${injury.player_id}`}
                          className="font-bold text-base hover:text-brand-600 transition" style={{ color: 'var(--text-primary)' }}>
                          {player.first_name} {player.last_name}
                        </Link>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={(sevColor as any)[injury.severity]}>{injury.severity}</span>
                        <span className="pill-slate">{player?.position}</span>
                        {player?.teams?.name && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{player.teams.name}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-extrabold ${days < 0 ? 'text-red-600' : days <= 7 ? 'text-yellow-600' : 'text-brand-600'}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Returns today' : `${days} days`}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Expected return</div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 mt-3 text-xs">
                    <div>
                      <div className="font-semibold text-brand-700">{injury.injury_type}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Body part: {injury.body_part}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        <Calendar size={11} /> Injured: {formatDate(injury.injury_date)}
                      </div>
                      <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        <Clock size={11} /> Recovery: {injury.expected_recovery_days} days
                      </div>
                    </div>
                    <div>
                      {injury.treatment_protocol && (
                        <div style={{ color: 'var(--text-secondary)' }}>🏥 {injury.treatment_protocol}</div>
                      )}
                    </div>
                  </div>

                  {/* Recovery progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <span>Recovery progress</span>
                      <span>{formatDate(injury.expected_return_date)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${Math.min(100, Math.max(0, ((injury.expected_recovery_days - days) / injury.expected_recovery_days) * 100))}%`,
                        background: days < 0 ? '#ef4444' : days <= 7 ? '#eab308' : '#10b981'
                      }} />
                    </div>
                  </div>

                  {injury.notes && (
                    <p className="text-xs mt-2 p-2 rounded gradient-brand-soft" style={{ color: 'var(--text-secondary)' }}>
                      📝 {injury.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {active.length === 0 && (
        <div className="card p-6 text-center border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle size={40} className="text-emerald-500 mx-auto mb-2" />
          <h2 className="font-bold text-lg text-emerald-700 dark:text-emerald-300">All Clear!</h2>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">No active injuries — full squad available.</p>
        </div>
      )}

      {/* Recovered */}
      {recovered.length > 0 && (
        <div>
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-emerald-600">
            <CheckCircle size={15} /> Recovered ({recovered.length})
          </h2>
          <div className="overflow-x-auto card p-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Player</th><th>Injury</th><th>Severity</th>
                  <th>Injury Date</th><th>Return Date</th><th>Recovery</th>
                </tr>
              </thead>
              <tbody>
                {recovered.slice(0, 10).map(injury => (
                  <tr key={injury.id}>
                    <td>
                      <Link href={`/dashboard/players/${injury.player_id}`} className="font-semibold hover:text-brand-600">
                        {injury.players?.first_name} {injury.players?.last_name}
                      </Link>
                    </td>
                    <td>{injury.injury_type} — {injury.body_part}</td>
                    <td><span className={(sevColor as any)[injury.severity]}>{injury.severity}</span></td>
                    <td>{formatDate(injury.injury_date)}</td>
                    <td>{formatDate(injury.actual_return_date || injury.expected_return_date)}</td>
                    <td><span className="pill-green">{injury.expected_recovery_days}d</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {injuries.length === 0 && (
        <div className="card">
          <EmptyState
            icon={<Activity size={48} />}
            title="No injury records"
            description="Add injury records from individual player profiles."
          />
        </div>
      )}
    </div>
  );
}
