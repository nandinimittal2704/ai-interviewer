import express from 'express';
import { getModel } from '../config/gemini.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

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
    res.json({ question: result.response.text().trim() });
  } catch (err) {
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

Respond in this EXACT JSON format only, no markdown:
{
  "score": <0-10>,
  "feedback": "<2-3 sentence evaluation>",
  "correctAnswer": "<what ideal answer should include>",
  "followUp": "<one follow-up question based on their answer, or null if last question>",
  "nextQuestion": ${isLast ? 'null' : `"<new ${difficulty} level ${role} question>"`}
}`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate final report
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { role, difficulty, history } = req.body;
    const avg = (history.reduce((s, h) => s + h.score, 0) / history.length).toFixed(1);

    const prompt = `Candidate finished ${role} interview (${difficulty} level).
Results:
${history.map((h, i) => `Q${i+1}: ${h.question}\nAnswer: ${h.answer}\nScore: ${h.score}/10`).join('\n\n')}

Respond in EXACT JSON only, no markdown:
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
    const raw = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;