import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env.js';

if (!env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY in environment variables');
}

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const getModel = () => {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });
};
