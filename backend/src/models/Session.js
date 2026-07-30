import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  answer: String,
  score: Number,
  feedback: String,
  correctAnswer: String,
});

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: String,
  difficulty: String,
  totalQuestions: Number,
  overallScore: Number,
  grade: String,
  strengths: [String],
  improvements: [String],
  recommendation: String,
  studyTopics: [String],
  questions: [questionSchema],
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
