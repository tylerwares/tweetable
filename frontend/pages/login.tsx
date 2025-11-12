import { FormEvent, useState } from 'react';
import Head from 'next/head';
import { getSupabaseBrowserClient } from '@/utils/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Footer from '@/components/Footer';

const LoginPage = () => {
  const supabase = getSupabaseBrowserClient();
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');

  const handleGoogle = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${siteUrl}/app` }
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err?.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login — Tweetable</title>
      </Head>
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-semibold">Welcome to Tweetable</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to generate and save drafts.</p>

          {session && (
            <p className="mt-4 rounded-md border border-emerald-800 bg-emerald-900/40 p-3 text-emerald-200">
              You are already signed in. Go to <Link className="underline" href="/app">App</Link>.
            </p>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={handleGoogle}
              className="w-full rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90"
            >
              Continue with Google
            </button>

            <div className="relative py-2 text-center text-xs uppercase text-slate-500">
              <span className="bg-slate-950 px-2">or</span>
              <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-slate-800" />
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <input
                id="auth-email"
                name="email"
                autoComplete="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
              <input
                id="auth-password"
                name="password"
                autoComplete="current-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-brand-dark hover:text-white disabled:opacity-60"
              >
                {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
              {error && <p className="text-sm text-amber-300">{error}</p>}
              <p className="text-xs text-slate-400">
                {mode === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <button type="button" className="underline" onClick={() => setMode('login')}>
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    New here?{' '}
                    <button type="button" className="underline" onClick={() => setMode('signup')}>
                      Create an account
                    </button>
                  </>
                )}
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LoginPage;
