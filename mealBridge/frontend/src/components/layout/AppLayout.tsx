'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MealBridgeProvider } from '@/lib/mealbridge-store';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getServerThemeSnapshot, getThemeSnapshot, setThemePreference, subscribeToTheme } from '@/lib/theme';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const isDarkMode = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  useEffect(() => {
    if (pathname === '/login') return;
    if (!isSupabaseConfigured()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    let active = true;
    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (session?.user) {
        setAuthEmail(session.user.email ?? null);
        setAuthError(null);
        setAuthReady(true);
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        setAuthEmail(null);
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setAuthError(error.message);
        setAuthReady(true);
      } else if (data.session?.user) {
        setAuthEmail(data.session.user.email ?? null);
        setAuthError(null);
        setAuthReady(true);
      } else {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const toggleTheme = () => {
    setThemePreference(!isDarkMode);
  };

  const signOut = async () => {
    try {
      const { error } = await createSupabaseBrowserClient().auth.signOut();
      if (error) throw error;
      router.replace('/login');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  if (pathname === '/login') return <>{children}</>;

  return (
    <MealBridgeProvider enabled={authReady && !authError}>
      <div className="app-shell flex h-screen bg-[#faf8f5] overflow-hidden text-stone-900 font-sans">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex flex-col w-72 max-w-xs bg-white shadow-xl z-10">
              <Sidebar onCloseMobile={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopNav
            onOpenMobile={() => setMobileOpen(true)}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            authEmail={authEmail}
            onSignOut={() => void signOut()}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" inert={!authReady || Boolean(authError)} aria-hidden={!authReady || Boolean(authError)}>
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
        {!authReady && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#faf8f5]/95 text-stone-600 backdrop-blur-sm" role="status">
            <span className="animate-pulse">Checking your MealBridge session…</span>
          </div>
        )}
        {authError && (
          <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-[#faf8f5] px-6 text-center text-stone-700" role="alert">
            <p>{authError}</p>
            <button type="button" onClick={() => router.replace('/login')} className="font-semibold text-emerald-700 underline">
              Go to sign in
            </button>
          </div>
        )}
      </div>
    </MealBridgeProvider>
  );
}
