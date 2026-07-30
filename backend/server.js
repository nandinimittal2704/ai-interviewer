import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import { authRoutes, interviewRoutes, sessionRoutes } from './src/routes/index.js';
import { env } from './src/config/env.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/debug-env', (req, res) => {
  res.json({
    hasKey: !!env.GEMINI_API_KEY,
    keyStart: env.GEMINI_API_KEY?.slice(0, 8) || 'MISSING',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/sessions', sessionRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Server is running!' }));
app.get('/', (req, res) => res.json({ message: 'AI Interviewer Backend API', routes: ['/api/auth', '/api/interview', '/api/sessions'] }));

const startServer = async () => {
  await connectDB();
  console.log('✅ MongoDB connected');

  const PORT = env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
};

startServer().catch((err) => {
  console.error('❌ Server start failed:', err.message);
  process.exit(1);
});