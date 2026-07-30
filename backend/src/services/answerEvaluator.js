import { getModel } from '../config/gemini.js';

const buildFallbackEvaluation = (question, userAnswer) => {
  const words = String(userAnswer || '').trim().split(/\s+/).filter(Boolean);
  const lower = String(userAnswer || '').toLowerCase();
  const hasExample = lower.includes('example') || lower.includes('for example') || lower.includes('such as');
  const hasReason = lower.includes('because') || lower.includes('so') || lower.includes('this means');
  const hasContext = lower.includes('when') || lower.includes('in') || lower.includes('use');

  let score = 4;
  if (words.length >= 25) score += 2;
  if (words.length >= 40) score += 1;
  if (hasExample) score += 1;
  if (hasReason) score += 1;
  if (hasContext) score += 1;

  score = Math.max(2, Math.min(10, score));

  const feedback = score >= 8
    ? 'You explained the idea clearly and with good structure. You could make it even stronger by adding a brief example from practice.'
    : score >= 6
      ? 'You covered the basics well. Adding a concrete example and a bit more detail would make your answer more convincing.'
      : 'You touched the main idea, but the answer would be stronger with more structure, detail, and a practical example.';

  return {
    score,
    feedback,
    correctAnswer: `A strong answer to "${question}" would explain the concept clearly, mention why it matters, and include a practical example or real-world use case.`,
    followUp: 'Can you expand on that with a real-world example from your experience?',
  };
};

export const evaluateAnswerWithGemini = async ({ question, userAnswer, role, difficulty }) => {
  const model = getModel();
  const prompt = [
    'You are a thoughtful interview coach.',
    `Evaluate this answer for a ${role || 'fullstack'} interview at ${difficulty || 'Intermediate'} level.`,
    `Question: ${question}`,
    `Candidate answer: ${userAnswer}`,
    'Return ONLY valid JSON with this exact structure:',
    '{"score": 0-10, "feedback": "...", "correctAnswer": "...", "followUp": "..."}',
    'Rules:',
    '- Score should be a realistic human-like interview score from 2 to 10.',
    '- feedback should sound natural and constructive, like a human interviewer.',
    '- correctAnswer should be a strong sample answer that could be given by a good candidate.',
    '- followUp should be a short next question or prompt encouraging the candidate to elaborate.',
    '- Do not include markdown, explanations, or extra text.'
  ].join('\n');

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = String(text || '')
      .replace(/```json|```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    return {
      score: Number(parsed.score) || 5,
      feedback: String(parsed.feedback || 'You gave a thoughtful answer. Keep building on it with more detail and examples.'),
      correctAnswer: String(parsed.correctAnswer || 'A strong response should explain the concept clearly, mention why it matters, and include a practical example.'),
      followUp: String(parsed.followUp || 'Can you add a real-world example from your experience?'),
    };
  } catch (error) {
    console.error('Gemini evaluation failed, using fallback evaluation:', error.message);
    return buildFallbackEvaluation(question, userAnswer);
  }
};
