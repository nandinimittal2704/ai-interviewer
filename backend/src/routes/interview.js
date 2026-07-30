import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { startInterview, answerInterview, reportInterview } from '../controllers/interviewController.js';

const router = express.Router();

router.post('/start', authMiddleware, startInterview);
router.post('/answer', authMiddleware, answerInterview);
router.post('/report', authMiddleware, reportInterview);

export default router;
