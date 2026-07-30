import Session from '../models/Session.js';

export const saveSession = async (req, res) => {
  try {
    const { role, difficulty, totalQuestions, history, report } = req.body;
    const session = await Session.create({
      userId: req.user.id,
      role,
      difficulty,
      totalQuestions,
      overallScore: report.overallScore,
      grade: report.grade,
      strengths: report.strengths,
      improvements: report.improvements,
      recommendation: report.recommendation,
      studyTopics: report.studyTopics,
      questions: history.map((h) => ({
        question: h.question,
        answer: h.answer,
        score: h.score,
        feedback: h.feedback,
        correctAnswer: h.correctAnswer,
      })),
    });
    return res.status(201).json(session);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('role difficulty overallScore grade totalQuestions createdAt');
    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
