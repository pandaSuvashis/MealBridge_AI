import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function safeNextPath(value: string | null, origin: string) {
  if (!value) return '/';
  const destination = new URL(value, origin);
  return destination.origin === origin
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : '/';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const authError = searchParams.get('error_description') ?? searchParams.get('error');
  if (authError) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', authError);
    return NextResponse.redirect(loginUrl);
  }

  const code = searchParams.get('code');
  if (!code) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'Google sign-in did not return an authorization code. Please try again.');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('error', error.message);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL(safeNextPath(searchParams.get('next'), origin), origin));
  } catch (error) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set(
      'error',
      error instanceof Error ? error.message : 'Unable to complete Google sign-in.',
    );
    return NextResponse.redirect(loginUrl);
  }
}
