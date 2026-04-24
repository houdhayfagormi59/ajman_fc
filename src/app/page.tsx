export const dynamic = "force-dynamic";
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Logo from '@/components/Logo';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <main className="min-h-screen flex items-center justify-center gradient-brand text-white px-4 relative overflow-hidden">
      {/* decorative circles */}
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute top-1/2 right-10 w-48 h-48 rounded-full bg-yellow-300/10 blur-2xl" />

      <div className="max-w-2xl text-center relative z-10 animate-fade-in-up">
        <div className="flex justify-center mb-6"><Logo size={110} /></div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
          Ajman Coach
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-2 font-medium">
          Professional football player management
        </p>
        <p className="text-base md:text-lg text-white/75 mb-10 max-w-lg mx-auto">
          Track players, injuries, performance, and generate professional reports — all in one place. Built for coaches in Ajman, UAE.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="px-7 py-3 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 shadow-lg transition active:scale-95">
            Sign in
          </Link>
          <Link href="/signup" className="px-7 py-3 bg-white/10 border-2 border-white/40 font-bold rounded-xl hover:bg-white/20 backdrop-blur transition active:scale-95">
            Create account
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 max-w-xl mx-auto">
          <Feature emoji="⚽" label="Players" />
          <Feature emoji="📊" label="Performance" />
          <Feature emoji="📝" label="PDF Reports" />
        </div>
      </div>
    </main>
  );
}

function Feature({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-xs font-semibold text-white/90">{label}</div>
    </div>
  );
}
