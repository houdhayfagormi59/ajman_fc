'use client';
import { useRouter } from 'next/navigation';
import { LogOut, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getRoleCategory } from '@/lib/staffRoles';

interface Props { coachName: string; staffRole?: string | null; }

export default function TopBar({ coachName, staffRole }: Props) {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = coachName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'CP';
  const cat = staffRole ? getRoleCategory(staffRole) : null;

  return (
    <header className="h-14 card rounded-none border-x-0 border-t-0 px-4 md:px-6 flex items-center justify-between"
      style={{ borderColor: 'var(--border)' }}>
      <div className="pl-10 md:pl-0 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs shadow-glow-orange flex-shrink-0">
          {initials}
        </div>
        <div>
          <div className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{coachName}</div>
          <div className="flex items-center gap-1.5">
            {staffRole && cat && (
              <span className={`text-xs font-semibold ${cat.color}`}>{cat.emoji} {staffRole}</span>
            )}
            {staffRole && !cat && (
              <span className="text-xs font-semibold text-brand-600">{staffRole}</span>
            )}
            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full gradient-brand text-white font-bold">
              <Zap size={7} /> v7 PRO
            </span>
          </div>
        </div>
      </div>
      <button onClick={signOut}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-700 font-medium transition"
        style={{ color: 'var(--text-secondary)' }}>
        <LogOut size={14} /><span className="hidden sm:inline">Sign out</span>
      </button>
    </header>
  );
}
