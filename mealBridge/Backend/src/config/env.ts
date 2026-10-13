import 'dotenv/config';

const required = (value: string | undefined, name: string): string => {
  if (!value) throw new Error(`${name} must be set in the environment.`);
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI,
  supabaseUrl: process.env.SUPABASE_URL,
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  requireMongoUri: () => required(process.env.MONGODB_URI, 'MONGODB_URI'),
};
