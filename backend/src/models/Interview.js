import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: String,
  difficulty: String,
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Interview', interviewSchema);
