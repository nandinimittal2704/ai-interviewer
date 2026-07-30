import { getModel } from '../config/gemini.js';

export const buildQuestionPrompt = (role, difficulty, count = 8) => {
  const normalizedRole = (role || 'fullstack').toString().trim();
  const normalizedDifficulty = (difficulty || 'Intermediate').toString().trim();

  return [
    'You are an expert technical interviewer.',
    `Generate exactly ${count} interview questions for a ${normalizedRole} candidate at ${normalizedDifficulty} level.`,
    'Return only a valid JSON array of strings. Do not include any extra explanation or markdown fences.',
    'Make the questions practical, specific, and relevant to real interviews.',
  ].join(' ');
};

export const parseQuestions = (responseText) => {
  const cleaned = String(responseText || '')
    .replace(/```json|```/g, '')
    .trim();

  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  }

  if (parsed && Array.isArray(parsed.questions)) {
    return parsed.questions.map((item) => String(item).trim()).filter(Boolean);
  }

  throw new Error('Gemini returned an unexpected question format');
};

export const generateQuestions = async (role, difficulty, count = 8) => {
  const model = getModel();
  const prompt = buildQuestionPrompt(role, difficulty, count);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseQuestions(text).slice(0, count);
};
