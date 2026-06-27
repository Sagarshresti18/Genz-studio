import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  if (!env.mongoUri) {
    return;
  }

  await mongoose.connect(env.mongoUri, {
    autoIndex: true,
    sanitizeFilter: true,
  });
}
