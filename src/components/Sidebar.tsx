'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Activity, BarChart3, Calendar, FileText,
  Target, Award, Video, Moon, Sun, Menu, X, Shield, Brain, BookOpen,
  Layers, Radar, Film, TrendingUp, Dumbbell, ClipboardList, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/teams', label: 'Teams', icon: Award },
  { href: '/dashboard/team-profile', label: 'Team Profile', icon: Layers },
  { href: '/dashboard/players', label: 'Players', icon: Users },
  { href: '/dashboard/player-analytics', label: 'Player KPIs', icon: Radar },
  { href: '/dashboard/injuries', label: 'Medical', icon: Activity },
  { href: '/dashboard/performance', label: 'Performance', icon: BarChart3 },
  { href: '/dashboard/sessions', label: 'Training', icon: Calendar },
  { href: '/dashboard/season-planner', label: 'Season Planner', icon: ClipboardList },
  { href: '/dashboard/principles', label: 'Game Principles', icon: BookOpen },
  { href: '/dashboard/match-analysis', label: 'Match Analysis', icon: Film },
  { href: '/dashboard/video', label: 'Video Hub', icon: Video },
  { href: '/dashboard/ai-analyzer', label: 'AI Analyzer', icon: Brain },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/scouting', label: 'Scouting', icon: Target },
];

export default function Sidebar() {
  const path = usePathname();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true); document.documentElement.classList.add('dark');
    }
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('coaches').select('role').eq('id', user.id).single();
        if (data?.role === 'admin') setIsAdmin(true);
      }
    })();
  }, []);

  function toggleDark() {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  const allNav = isAdmin ? [...nav, { href: '/dashboard/admin', label: 'Admin Panel', icon: Shield, exact: false }] : nav;

  const isActive = (item: typeof nav[0]) => {
    if (item.exact || item.href === '/dashboard') return path === item.href;
    return path === item.href || path.startsWith(item.href + '/') || path.startsWith(item.href);
  };

  const inner = (
    <>
      <div className="h-14 px-4 flex items-center border-b gradient-brand-soft" style={{ borderColor: 'var(--border)' }}>
        <Logo size={34} withText />
      </div>
      <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto scrollbar-thin">
        {allNav.map((item) => {
          const active = isActive(item as any);
          const Icon = item.icon;
          const adm = item.href === '/dashboard/admin';
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all',
                active
                  ? (adm ? 'bg-red-600 text-white shadow-glow-red' : 'gradient-brand text-white shadow-glow-orange')
                  : 'hover:bg-brand-50 dark:hover:bg-slate-700',
                adm && !active && 'text-red-600'
              )}
              style={{ color: active || adm ? undefined : 'var(--text-secondary)' }}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={toggleDark} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition hover:bg-brand-50 dark:hover:bg-slate-700"
          style={{ color: 'var(--text-secondary)' }}>
          {dark ? <Sun size={14} /> : <Moon size={14} />} {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      <div className="px-3 py-2 text-[10px] text-center border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Ajman Coach Pro</span>
        <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full gradient-brand text-white font-bold">v7 PRO</span>
        {isAdmin && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold dark:bg-red-900/30 dark:text-red-300">ADMIN</span>}
      </div>
    </>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg card shadow-lg"><Menu size={20} /></button>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 card rounded-none flex flex-col border-r shadow-xl" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1"><X size={16} /></button>
            {inner}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}
      <aside className="w-56 card rounded-none border-r border-y-0 border-l-0 flex-shrink-0 hidden md:flex flex-col" style={{ borderColor: 'var(--border)' }}>
        {inner}
      </aside>
    </>
  );
}
