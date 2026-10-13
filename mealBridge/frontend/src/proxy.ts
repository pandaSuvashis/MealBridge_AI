import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function redirectWithCookies(url: URL, source: NextResponse) {
  const response = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

function safeNextPath(value: string | null, origin: string) {
  if (!value) return '/';
  const destination = new URL(value, origin);
  return destination.origin === origin
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : '/';
}

function loginRedirect(request: NextRequest, source?: NextResponse) {
  const loginUrl = new URL('/login', request.url);
  if (request.nextUrl.pathname !== '/login') {
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    loginUrl.searchParams.set('error', 'Supabase authentication is not configured. Add the required frontend environment variables.');
  }
  return source ? redirectWithCookies(loginUrl, source) : NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login';
  const isCallback = pathname === '/auth/callback';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return isLoginPage || isCallback ? NextResponse.next() : loginRedirect(request);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  if (error && !isLoginPage && !isCallback) return loginRedirect(request, response);
  const isAuthenticated = Boolean(data?.claims);

  if (!isAuthenticated && !isLoginPage && !isCallback) return loginRedirect(request, response);
  if (isAuthenticated && isLoginPage) {
    return redirectWithCookies(
      new URL(safeNextPath(request.nextUrl.searchParams.get('next'), request.nextUrl.origin), request.url),
      response,
    );
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
