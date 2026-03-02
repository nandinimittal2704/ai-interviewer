import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interview.js';
import sessionRoutes from './routes/sessions.js';

dotenv.config();
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

mongoose.connect('mongodb+srv://nandinimittal2704:nandini123@cluster0.0kzx6ey.mongodb.net/ai-interviewer?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/sessions', sessionRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Server is running!' }));
app.get('/', (req, res) => res.json({ message: 'AI Interviewer Backend API', routes: ['/api/auth', '/api/interview', '/api/sessions'] }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));