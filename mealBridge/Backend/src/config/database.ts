import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.requireMongoUri(), { serverSelectionTimeoutMS: 10000 });
  const host = mongoose.connection.host;
  if (host.endsWith('.mongodb.net')) {
    console.log(`MongoDB Atlas connected successfully (${host}).`);
  } else {
    console.log(`MongoDB connected successfully (${host}).`);
  }
}

export function databaseStatus(): 'connected' | 'connecting' | 'disconnected' | 'disconnecting' {
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] as ReturnType<typeof databaseStatus>;
}
