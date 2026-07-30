import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(env.MONGO_URI);
};
