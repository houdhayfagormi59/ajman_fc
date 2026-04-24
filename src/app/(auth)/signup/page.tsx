'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, CheckCircle, ChevronDown, Lock, User, Briefcase } from 'lucide-react';
import { STAFF_ROLE_CATEGORIES } from '@/lib/staffRoles';

const APP_PASSWORD = '12345';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1|2|3>(1);
  const [appPass, setAppPass] = useState('');
  const [appPassError, setAppPassError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clubName, setClubName] = useState('Ajman Club');
  const [selectedRole, setSelectedRole] = useState('');
  const [openCategory, setOpenCategory] = useState<string>('Coaching Staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function checkAppPassword() {
    if (appPass.trim() === APP_PASSWORD) {
      setAppPassError('');
      setStep(2);
    } else {
      setAppPassError('Incorrect access code. Contact your club administrator.');
    }
  }

  function goToRole() {
    setError(null);
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setStep(3);
  }

  async function createAccount() {
    if (!selectedRole) { setError('Please select your role in the club.'); return; }
    setLoading(true); setError(null); setInfo(null);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim(), staff_role: selectedRole, club_name: clubName.trim() },
        },
      });

      if (signUpError) {
        const msg = signUpError.message || '';
        if (msg.includes('already registered') || msg.includes('already been registered')) {
          setError('This email is already registered. Sign in instead.');
        } else if (msg.includes('Invalid URL') || msg.includes('Failed to fetch') || msg.includes('Invalid path')) {
          setError('Cannot connect to database. Check your Supabase environment variables.');
        } else {
          setError(msg);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from('coaches').upsert({
          id: data.user.id,
          email: email.trim().toLowerCase(),
          full_name: fullName.trim(),
          club_name: clubName.trim() || 'Ajman Club',
          staff_role: selectedRole,
          role: 'coach',
        }, { onConflict: 'id' });
      }

      setLoading(false);
      if (data.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setInfo('✅ Account created! Check your email for a confirmation link, then sign in.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message?.includes('Failed to fetch')
        ? 'Network error — cannot reach the database. Check your NEXT_PUBLIC_SUPABASE_URL.'
        : err.message || 'Something went wrong. Please try again.');
    }
  }

  const stepLabels = ['Access Code', 'Your Details', 'Your Role'];

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-main)' }}>
      <div className="w-full max-w-lg space-y-5 py-8 animate-fade-in-up">

        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-3"><Logo size={60} withText /></div>
        </div>

        {/* Step progress */}
        <div className="card p-3">
          <div className="flex items-center">
            {stepLabels.map((label, idx) => {
              const s = idx + 1;
              const done = step > s;
              const active = step === s;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                      done ? 'gradient-brand text-white shadow-glow-orange' :
                      active ? 'gradient-brand text-white shadow-glow-orange ring-4 ring-orange-200 dark:ring-orange-900' :
                      'card border'
                    }`} style={!done && !active ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : {}}>
                      {done ? '✓' : s}
                    </div>
                    <span className={`text-[10px] mt-1 font-semibold text-center ${active ? 'text-brand-600' : ''}`}
                      style={!active ? { color: 'var(--text-secondary)' } : {}}>
                      {label}
                    </span>
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step > s ? 'gradient-brand' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── STEP 1: App Access Code ─── */}
        {step === 1 && (
          <div className="card p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow-orange">
                <Lock size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Club Access Code</h1>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Enter the access code provided by your club administrator to join Ajman Coach Pro.
              </p>
            </div>

            <div>
              <label className="label block mb-2 text-center">Access Code</label>
              <input
                type="password"
                className="input-base text-center text-3xl font-black tracking-[0.5em]"
                placeholder="·····"
                value={appPass}
                onChange={e => setAppPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkAppPassword()}
                maxLength={10}
                autoFocus
              />
              {appPassError && (
                <div className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={14} className="flex-shrink-0" /> {appPassError}
                </div>
              )}
            </div>

            <button onClick={checkAppPassword}
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold text-base shadow-glow-orange hover:opacity-90 transition">
              Verify Access →
            </button>

            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link href="/login" className="text-brand-600 font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* ─── STEP 2: Personal Details ─── */}
        {step === 2 && (
          <div className="card p-8 space-y-4">
            <div className="text-center mb-2">
              <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-3 shadow-glow-orange">
                <User size={22} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Your Details</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Tell us who you are</p>
            </div>

            <div>
              <label className="label block mb-1">Full Name *</label>
              <input className="input-base" placeholder="e.g. Mohamed Al Rashidi" value={fullName}
                onChange={e => setFullName(e.target.value)} autoComplete="name" />
            </div>
            <div>
              <label className="label block mb-1">Club / Organisation</label>
              <input className="input-base" placeholder="Ajman Club" value={clubName}
                onChange={e => setClubName(e.target.value)} />
            </div>
            <div>
              <label className="label block mb-1">Email Address *</label>
              <input type="email" className="input-base" placeholder="you@ajmanclub.ae" value={email}
                onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="label block mb-1">
                Password * <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>— min 6 characters</span>
              </label>
              <input type="password" className="input-base" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl card border text-sm font-bold hover:bg-brand-50 dark:hover:bg-slate-700 transition"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                ← Back
              </button>
              <button onClick={goToRole}
                className="flex-1 py-2.5 rounded-xl gradient-brand text-white font-bold text-sm shadow-glow-orange hover:opacity-90 transition">
                Next → Choose Role
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Role Selection ─── */}
        {step === 3 && (
          <div className="card p-6 space-y-4">
            <div className="text-center mb-2">
              <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-3 shadow-glow-orange">
                <Briefcase size={22} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Your Role at the Club</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                This shows on your profile and in the admin staff directory.
              </p>
            </div>

            {/* Selected role display */}
            {selectedRole ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl gradient-brand text-white shadow-glow-orange">
                <CheckCircle size={18} />
                <div>
                  <div className="font-bold text-sm">Selected Role</div>
                  <div className="text-white/90 font-extrabold">{selectedRole}</div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 rounded-xl border border-dashed text-center text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Tap a role below to select it
              </div>
            )}

            {/* Role categories accordion */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin pr-0.5">
              {STAFF_ROLE_CATEGORIES.map(({ category, emoji, color, bg, roles }) => (
                <div key={category} className="card overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                  {/* Category header */}
                  <button
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition ${openCategory === category ? bg : 'hover:bg-brand-50 dark:hover:bg-slate-700'}`}
                    onClick={() => setOpenCategory(openCategory === category ? '' : category)}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{emoji}</span>
                      <span className={`font-bold text-sm ${openCategory === category ? color : ''}`}
                        style={openCategory !== category ? { color: 'var(--text-primary)' } : {}}>
                        {category}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-soft)', color: 'var(--text-secondary)' }}>
                        {roles.length}
                      </span>
                    </div>
                    <ChevronDown size={15} className={`transition-transform flex-shrink-0 ${openCategory === category ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-secondary)' }} />
                  </button>

                  {/* Roles grid */}
                  {openCategory === category && (
                    <div className="border-t px-3 py-3 grid grid-cols-2 gap-1.5" style={{ borderColor: 'var(--border)' }}>
                      {roles.map(role => {
                        const isSelected = selectedRole === role;
                        return (
                          <button
                            key={role}
                            onClick={() => { setSelectedRole(role); setError(null); }}
                            className={`text-left text-xs px-3 py-2.5 rounded-lg font-semibold transition-all border ${
                              isSelected
                                ? 'gradient-brand text-white border-transparent shadow-glow-orange scale-[1.02]'
                                : 'hover:bg-brand-50 dark:hover:bg-slate-700 border-transparent hover:border-brand-200 dark:hover:border-brand-800'
                            }`}
                            style={!isSelected ? { color: 'var(--text-secondary)' } : {}}>
                            {isSelected && <span className="mr-1">✓ </span>}{role}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}
            {info && (
              <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <CheckCircle size={14} className="flex-shrink-0 mt-0.5" /> {info}
                {info.includes('Check your email') && (
                  <Link href="/login" className="ml-1 font-bold underline">Sign in →</Link>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl card border text-sm font-bold hover:bg-brand-50 dark:hover:bg-slate-700 transition"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                ← Back
              </button>
              <button onClick={createAccount} disabled={loading || !selectedRole || !!info}
                className="flex-1 py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-glow-orange hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? '⏳ Creating account…' : '✅ Create Account'}
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 font-bold hover:underline">Sign in here</Link>
        </p>
      </div>
    </main>
  );
}
