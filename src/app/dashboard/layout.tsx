export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: coach } = await supabase
    .from('coaches')
    .select('full_name, role, staff_role, club_name')
    .eq('id', user.id)
    .single();

  const coachName = coach?.full_name || user.email?.split('@')[0] || 'Coach';
  const staffRole = (coach as any)?.staff_role || null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-main)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar coachName={coachName} staffRole={staffRole} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
