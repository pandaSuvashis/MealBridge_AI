import { createClient, type User as SupabaseUser } from '@supabase/supabase-js';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

declare global {
  namespace Express {
    interface Request {
      authUser?: SupabaseUser;
    }
  }
}

let authClient: ReturnType<typeof createClient> | undefined;

function getAuthClient() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be configured on the API server.');
  }
  authClient ??= createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  return authClient;
}

export const requireSupabaseAuth: RequestHandler = async (req, res, next) => {
  const authorization = req.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Sign in to access this resource.' } });
    return;
  }

  try {
    const supabase = getAuthClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      const status = error.status === 400 || error.status === 401 || error.status === 403 ? 401 : 503;
      if (status === 503) console.error('Supabase auth verification is temporarily unavailable.', error.message);
      res.status(status).json({
        success: false,
        error: {
          code: status === 503 ? 'AUTH_VERIFICATION_UNAVAILABLE' : 'INVALID_SESSION',
          message: status === 503
            ? 'Authentication verification is temporarily unavailable. Please try again.'
            : 'Your sign-in session is invalid or has expired.',
        },
      });
      return;
    }
    req.authUser = data.user;
    next();
  } catch (error) {
    if (error instanceof Error && error.message.includes('must be configured')) {
      res.status(503).json({ success: false, error: { code: 'AUTH_NOT_CONFIGURED', message: error.message } });
      return;
    }
    console.error('Supabase auth verification failed.', error);
    res.status(503).json({
      success: false,
      error: { code: 'AUTH_VERIFICATION_UNAVAILABLE', message: 'Authentication verification is temporarily unavailable. Please try again.' },
    });
  }
};
