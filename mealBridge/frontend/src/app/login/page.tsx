'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf, LoaderCircle, Mail, Moon, Sun } from 'lucide-react';
import { getServerThemeSnapshot, getThemeSnapshot, setThemePreference, subscribeToTheme } from '@/lib/theme';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

type AuthAction = 'google' | 'email' | 'verify' | 'resend' | null;

function subscribeToLocation(callback: () => void) {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}

function getCallbackError() {
  return new URLSearchParams(window.location.search).get('error') ?? '';
}

function getServerCallbackError() {
  return '';
}

function getSafeNextPath() {
  const requested = new URLSearchParams(window.location.search).get('next');
  if (!requested) return '/';
  const destination = new URL(requested, window.location.origin);
  return destination.origin === window.location.origin
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : '/';
}

function getAuthCallbackUrl() {
  const callbackUrl = new URL('/auth/callback', window.location.origin);
  callbackUrl.searchParams.set('next', getSafeNextPath());
  return callbackUrl.toString();
}

export default function LoginPage() {
  const router = useRouter();
  const isDarkMode = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  const callbackError = useSyncExternalStore(subscribeToLocation, getCallbackError, getServerCallbackError);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [action, setAction] = useState<AuthAction>(null);
  const [error, setError] = useState('');
  const configured = isSupabaseConfigured();

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  useEffect(() => {
    if (!configured) return;

    const supabase = createSupabaseBrowserClient();
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && session && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
        router.replace(getSafeNextPath());
      }
    });
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      else if (data.session) router.replace(getSafeNextPath());
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [configured, router]);

  useEffect(() => {
    if (resendSeconds === 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const beginGoogleSignIn = async () => {
    setError('');
    clearCallbackError();
    setAction('google');
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getAuthCallbackUrl() },
      });
      if (authError) throw authError;
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Google sign-in could not be started.');
      setAction(null);
    }
  };

  const sendEmailCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    clearCallbackError();
    setAction('email');
    try {
      const { error: authError } = await createSupabaseBrowserClient().auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true, emailRedirectTo: getAuthCallbackUrl() },
      });
      if (authError) throw authError;
      setEmail(normalizedEmail);
      setOtp('');
      setEmailSent(true);
      setResendSeconds(60);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Could not send the verification code.');
    } finally {
      setAction(null);
    }
  };

  const verifyEmailCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the six-digit code from your email.');
      return;
    }

    setError('');
    clearCallbackError();
    setAction('verify');
    try {
      const { error: authError } = await createSupabaseBrowserClient().auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (authError) throw authError;
      router.replace(getSafeNextPath());
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'The code could not be verified.');
    } finally {
      setAction(null);
    }
  };

  const resendEmailCode = async () => {
    setError('');
    clearCallbackError();
    setAction('resend');
    try {
      const { error: authError } = await createSupabaseBrowserClient().auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: getAuthCallbackUrl() },
      });
      if (authError) throw authError;
      setOtp('');
      setResendSeconds(60);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Could not resend the verification code.');
    } finally {
      setAction(null);
    }
  };

  const changeEmail = () => {
    setEmailSent(false);
    setOtp('');
    setError('');
    setResendSeconds(0);
    clearCallbackError();
  };

  return (
    <main className="login-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <button
        type="button"
        onClick={() => setThemePreference(!isDarkMode)}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        className="theme-toggle absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 transition-all duration-300 hover:scale-105 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <span className="relative grid h-5 w-5 place-items-center" aria-hidden="true">
          <Sun className={`absolute h-[19px] w-[19px] transition-all duration-300 motion-reduce:transition-none ${isDarkMode ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} strokeWidth={1.8} />
          <Moon className={`absolute h-[19px] w-[19px] transition-all duration-300 motion-reduce:transition-none ${isDarkMode ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} strokeWidth={1.8} />
        </span>
      </button>

      <section className="login-card w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-xl shadow-stone-900/5 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15">
            <Leaf className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mb-2 text-sm font-semibold tracking-wide text-emerald-700">MEALBRIDGE</p>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Welcome to MealBridge</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">
            Connect surplus food with local NGOs and volunteers, and help good food reach people who need it.
          </p>
        </div>

        {(error || callbackError) && (
          <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error || callbackError}
          </div>
        )}

        {!configured && (
          <p role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Authentication is not configured yet. Add the Supabase URL and publishable key to <code>.env.local</code>, then restart the frontend.
          </p>
        )}

        {!emailSent ? (
          <>
            <button
              type="button"
              onClick={() => void beginGoogleSignIn()}
              disabled={!configured || action !== null}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {action === 'google' ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <GoogleMark />}
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-stone-400">
              <span className="h-px flex-1 bg-stone-200" />
              or
              <span className="h-px flex-1 bg-stone-200" />
            </div>

            <form onSubmit={(event) => void sendEmailCode(event)} className="space-y-4">
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={!configured || action !== null}
                  className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={!configured || action !== null}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {action === 'email' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Continue with Email
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={(event) => void verifyEmailCode(event)} className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-stone-600">Enter the six-digit verification code sent to</p>
              <p className="mt-1 break-all font-semibold text-stone-900">{email}</p>
            </div>
            <label htmlFor="otp" className="sr-only">Six-digit email verification code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              disabled={action !== null}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-4 text-center font-mono text-2xl tracking-[0.5em] text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={action !== null || otp.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {action === 'verify' && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Verify and continue
            </button>
            <div className="flex items-center justify-between gap-3 text-sm">
              <button type="button" onClick={changeEmail} className="inline-flex items-center gap-1 font-medium text-stone-600 hover:text-stone-900">
                <ArrowLeft className="h-4 w-4" /> Change email
              </button>
              {resendSeconds > 0 ? (
                <span className="text-stone-500">Resend in {resendSeconds}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => void resendEmailCode()}
                  disabled={action !== null}
                  className="font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                >
                  {action === 'resend' ? 'Sending…' : 'Resend code'}
                </button>
              )}
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-xs leading-5 text-stone-500">
          By continuing, you agree to use MealBridge to coordinate safe and responsible food rescue.
        </p>
      </section>
    </main>
  );
}

function clearCallbackError() {
  const currentUrl = new URL(window.location.href);
  if (!currentUrl.searchParams.has('error')) return;
  currentUrl.searchParams.delete('error');
  window.history.replaceState({}, '', currentUrl);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.7c3.9-3.6 6-8.8 6-14.9Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5c-1.8 1.2-4 2-6.8 2-5.3 0-9.8-3.6-11.4-8.4H5.7v5.2A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.7a20 20 0 0 0 0 18Z" />
      <path fill="#EA4335" d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.7 15l6.9 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z" />
    </svg>
  );
}
