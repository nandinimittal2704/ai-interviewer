import { generateQuestions } from '../services/questionGenerator.js';
import { evaluateAnswerWithGemini } from '../services/answerEvaluator.js';

const getQuestions = async (role, difficulty) => {
  try {
    return await generateQuestions(role, difficulty, 8);
  } catch (error) {
    console.error('❌ Gemini question generation failed:', error.message);
    return [
      `Explain the core concepts of ${role || 'fullstack'} at ${difficulty || 'Intermediate'} level.`,
      `Describe a real-world project where you applied ${role || 'fullstack'} skills.`,
      `How would you approach a challenging problem in ${role || 'fullstack'}?`,
      `What trade-offs would you consider when designing a solution for ${role || 'fullstack'}?`,
      `How do you ensure quality and maintainability in ${role || 'fullstack'} work?`,
      `What would you improve in a typical ${role || 'fullstack'} system?`,
      `How do you handle debugging and performance issues in ${role || 'fullstack'}?`,
      `What would you explain to a junior teammate about ${role || 'fullstack'}?`,
    ];
  }
};

const evaluateAnswer = async (question, userAnswer, questionNumber, totalQuestions, role, allQuestions) => {
  const evaluation = await evaluateAnswerWithGemini({ question, userAnswer, role, difficulty: 'Intermediate' });
  const score = Math.max(2, Math.min(10, Number(evaluation.score) || 5));
  const isLast = Number(questionNumber) >= Number(totalQuestions);
  const nextQuestion = isLast ? null : (allQuestions && Array.isArray(allQuestions) ? allQuestions[Number(questionNumber)] || null : null);
  return {
    score,
    feedback: evaluation.feedback,
    correctAnswer: evaluation.correctAnswer,
    followUp: evaluation.followUp,
    nextQuestion,
  };
};

const generateLocalReport = (history, role) => {
  const avg = parseFloat((history.reduce((s, h) => s + (Number(h.score) || 0), 0) / history.length).toFixed(1));
  const grade = avg >= 9 ? 'A' : avg >= 7 ? 'B' : avg >= 5 ? 'C' : avg >= 3 ? 'D' : 'F';
  const strengths = avg >= 7 ? ['Strong conceptual understanding', 'Clear and structured communication', 'Good use of technical terminology'] : avg >= 5 ? ['Covered basic concepts well', 'Attempted all questions confidently', 'Shows practical awareness of topics'] : ['Attempted every question', 'Shows initiative to learn', 'Basic familiarity with the domain'];
  const improvements = avg >= 7 ? ['Add more real-world project examples', 'Explore edge cases and tradeoffs', 'Practice system design questions'] : avg >= 5 ? ['Strengthen core fundamentals', 'Use more technical keywords', 'Practice explaining with examples'] : ['Review fundamental concepts', 'Practice speaking answers out loud', 'Build more hands-on projects'];
  const topics = { frontend: ['React Hooks & Lifecycle', 'JavaScript Closures & Async', 'CSS Layout & Responsive Design', 'Performance Optimization'], backend: ['REST API Design', 'Database Indexing & Queries', 'JWT Auth & Security', 'Caching Strategies'], fullstack: ['System Architecture', 'Auth Flow End-to-End', 'Database Design', 'Deployment & DevOps'], dsa: ['Arrays & Two Pointers', 'Trees & Graph Traversal', 'Dynamic Programming', 'Sorting Algorithms'], system: ['Scalability Patterns', 'CAP Theorem', 'Database Sharding', 'Microservices Design'], hr: ['STAR Method Answers', 'Leadership Examples', 'Conflict Resolution', 'Career Goal Clarity'] };
  const roleKey = (role || '').toLowerCase().replace(/\s+/g, '');
  const studyTopics = topics[roleKey] || topics.fullstack;
  const recommendation = avg >= 7 ? `You performed well in this ${role} interview. Focus on advanced topics and system design to reach the next level.` : avg >= 5 ? `You have a decent foundation in ${role}. Strengthen your core concepts and practice explaining with examples.` : `Keep practicing ${role} fundamentals. Build small projects and review the study topics below.`;
  return { overallScore: avg, grade, strengths, improvements, recommendation, studyTopics };
};

export const startInterview = async (req, res) => {
  try {
    const { role, difficulty } = req.body;
    if (!role || !difficulty) return res.status(400).json({ message: 'role and difficulty are required' });
    const allQuestions = await getQuestions(role, difficulty);
    return res.json({ question: allQuestions[0], allQuestions });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const answerInterview = async (req, res) => {
  try {
    const { role, difficulty, question, answer, answerTranscript, questionNumber, totalQuestions, allQuestions } = req.body;
    if (!role || !difficulty || !question) return res.status(400).json({ message: 'role, difficulty, and question are required' });
    const userAnswer = (answerTranscript || answer || '').trim();
    if (!userAnswer) return res.status(400).json({ message: 'Answer cannot be empty' });
    const data = await evaluateAnswer(question, userAnswer, questionNumber, totalQuestions, role, allQuestions);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const reportInterview = async (req, res) => {
  try {
    const { role, difficulty, history } = req.body;
    if (!history || !Array.isArray(history) || history.length === 0) return res.status(400).json({ message: 'history array is required' });
    const report = generateLocalReport(history, role);
    return res.json(report);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
