'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        const msg = signInError.message || '';
        if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
          setError('Incorrect email or password.');
        } else if (msg.includes('Email not confirmed')) {
          setError('Please confirm your email first — check your inbox.');
        } else if (msg.includes('Invalid URL') || msg.includes('Failed to fetch') || msg.includes('Invalid path')) {
          setError('Cannot connect to database. Check your Supabase environment variables in .env.local');
        } else {
          setError(msg);
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setLoading(false);
      setError(err.message?.includes('Failed to fetch')
        ? 'Network error — check your NEXT_PUBLIC_SUPABASE_URL.'
        : err.message || 'Something went wrong.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-main)' }}>
      <div className="w-full max-w-sm space-y-4 animate-fade-in-up">
        <div className="text-center">
          <div className="flex justify-center mb-3"><Logo size={60} withText /></div>
        </div>

        <div className="card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to Ajman Coach Pro</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label block mb-1">Email</label>
              <input type="email" required className="input-base" placeholder="you@ajmanclub.ae"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" autoFocus />
            </div>
            <div>
              <label className="label block mb-1">Password</label>
              <input type="password" required className="input-base" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold shadow-glow-orange hover:opacity-90 transition disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
            No account?{' '}
            <Link href="/signup" className="text-brand-600 font-bold hover:underline">Create one →</Link>
          </p>
        </div>

        <div className="card p-3 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          New users need the <strong style={{ color: 'var(--text-primary)' }}>club access code</strong> to register.
          Contact your administrator.
        </div>
      </div>
    </main>
  );
}
