import express from 'express';
import { getModel } from '../config/gemini.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Robust JSON extractor — handles markdown, extra text, newlines
const extractJSON = (text) => {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  // Find the first { and last } to extract JSON
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in response');
  cleaned = cleaned.slice(start, end + 1);
  return JSON.parse(cleaned);
};

// Get first question
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { role, difficulty } = req.body;
    const prompt = `You are an expert interviewer for ${role} roles.
Ask the FIRST interview question for a ${difficulty} level candidate.
- Ask ONE question only
- No numbering, no prefix, just the question
- Frontend: React/JS/CSS concepts
- Backend: Node.js/APIs/Databases
- DSA: Data structures or algorithms problem
- System Design: Architecture question
- HR: Behavioral question`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const question = result.response.text().trim();
    console.log('START - Question generated:', question.slice(0, 60));
    res.json({ question });
  } catch (err) {
    console.error('START ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Evaluate answer + get next question
router.post('/answer', authenticateToken, async (req, res) => {
  try {
    const { role, difficulty, question, answer, questionNumber, totalQuestions } = req.body;
    const isLast = questionNumber >= totalQuestions;

    const prompt = `You are an expert ${role} interviewer.

Question: "${question}"
Candidate Answer: "${answer}"

You MUST respond with ONLY a valid JSON object. No markdown, no backticks, no explanation before or after.
{
  "score": <integer 0-10>,
  "feedback": "<2-3 sentence evaluation>",
  "correctAnswer": "<what ideal answer should include>",
  "followUp": "<one follow-up question>",
  "nextQuestion": ${isLast ? 'null' : `"<new ${difficulty} level ${role} interview question>"`}
}`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    console.log('ANSWER - Raw response:', raw.slice(0, 100));
    const data = extractJSON(raw);
    res.json(data);
  } catch (err) {
    console.error('ANSWER ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Generate final report
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { role, difficulty, history } = req.body;
    const avg = (history.reduce((s, h) => s + h.score, 0) / history.length).toFixed(1);

    const prompt = `Candidate finished a ${role} interview at ${difficulty} level.
Results:
${history.map((h, i) => `Q${i+1}: ${h.question}\nAnswer: ${h.answer}\nScore: ${h.score}/10`).join('\n\n')}

You MUST respond with ONLY a valid JSON object. No markdown, no backticks, no explanation.
{
  "overallScore": ${avg},
  "grade": "<A if >=9, B if >=7, C if >=5, D if >=3, F otherwise>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "recommendation": "<2-3 sentence overall assessment>",
  "studyTopics": ["<topic 1>", "<topic 2>", "<topic 3>", "<topic 4>"]
}`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    console.log('REPORT - Raw response:', raw.slice(0, 100));
    const data = extractJSON(raw);
    res.json(data);
  } catch (err) {
    console.error('REPORT ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;