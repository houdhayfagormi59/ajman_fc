'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import ScoutingEvaluation from '@/components/ScoutingEvaluation';
import RecruitmentForm from '@/components/RecruitmentForm';
import { Pencil, Trash2, ChevronLeft, Phone } from 'lucide-react';
import type { Recruitment } from '@/lib/types';

export default function ScoutingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const [recruit, setRecruit] = useState<Recruitment | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('recruitment').select('*').eq('id', params.id).single();
    setRecruit(data as Recruitment);
    setLoading(false);
  }

  useEffect(() => { load(); }, [params.id]);

  async function deleteRecruit() {
    if (!confirm('Delete this prospect?')) return;
    await fetch(`/api/recruitment/${params.id}`, { method: 'DELETE' });
    router.push('/dashboard/scouting'); router.refresh();
  }

  async function saveScores(scores: any) {
    await fetch(`/api/recruitment/${params.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scores),
    });
  }

  if (loading) return <div className="card p-8 text-center">Loading…</div>;
  if (!recruit) return <div className="card p-8 text-center">Prospect not found</div>;

  return (
    <div className="space-y-5 max-w-5xl animate-fade-in-up">
      <Link href="/dashboard/scouting" className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline">
        <ChevronLeft size={16} /> Back to scouting
      </Link>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-5 md:items-start md:justify-between">
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-300 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center text-4xl overflow-hidden shadow-glow-orange border-2" style={{ borderColor: 'var(--border)' }}>
              {recruit.photo_url ? <img src={recruit.photo_url} alt="" className="w-full h-full object-cover" /> : '⚽'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{recruit.first_name} {recruit.last_name}</h1>
              <div className="text-sm mt-1 space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                <div>{recruit.age_group} · {recruit.position}</div>
                <div>Club: {recruit.club_origin || '—'}</div>
                {recruit.whatsapp_number && <div className="flex items-center gap-1 text-green-700 font-semibold"><Phone size={14} /> {recruit.whatsapp_number}</div>}
              </div>
              <div className="flex gap-2 mt-2"><Badge variant="brand">{recruit.status}</Badge></div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => setEditModal(true)}><Pencil size={15} /> Edit</Button>
            <Button variant="danger" onClick={deleteRecruit}><Trash2 size={15} /> Delete</Button>
          </div>
        </div>
      </div>

      {recruit.notes && (
        <section className="card p-5">
          <h2 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Scout Notes</h2>
          <p className="whitespace-pre-line text-sm" style={{ color: 'var(--text-secondary)' }}>{recruit.notes}</p>
        </section>
      )}

      <section className="card p-5">
        <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Scouting Evaluation</h2>
        <ScoutingEvaluation
          initial={{
            scout_tech_ball_control: (recruit as any).scout_tech_ball_control ?? 5,
            scout_tech_passing: (recruit as any).scout_tech_passing ?? 5,
            scout_tech_shooting: (recruit as any).scout_tech_shooting ?? 5,
            scout_tech_dribbling: (recruit as any).scout_tech_dribbling ?? 5,
            scout_phy_speed: (recruit as any).scout_phy_speed ?? 5,
            scout_phy_strength: (recruit as any).scout_phy_strength ?? 5,
            scout_phy_endurance: (recruit as any).scout_phy_endurance ?? 5,
            scout_phy_agility: (recruit as any).scout_phy_agility ?? 5,
            scout_tac_positioning: (recruit as any).scout_tac_positioning ?? 5,
            scout_tac_awareness: (recruit as any).scout_tac_awareness ?? 5,
            scout_tac_decision: (recruit as any).scout_tac_decision ?? 5,
            scout_psy_confidence: (recruit as any).scout_psy_confidence ?? 5,
            scout_psy_leadership: (recruit as any).scout_psy_leadership ?? 5,
            scout_psy_composure: (recruit as any).scout_psy_composure ?? 5,
            scout_psy_work_ethic: (recruit as any).scout_psy_work_ethic ?? 5,
          }}
          onChange={saveScores}
        />
      </section>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit prospect">
        <RecruitmentForm initial={recruit} />
      </Modal>
    </div>
  );
}
