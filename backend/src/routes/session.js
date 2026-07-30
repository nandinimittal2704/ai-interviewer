import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { saveSession, getMySessions } from '../controllers/sessionController.js';

const router = express.Router();

router.post('/save', authMiddleware, saveSession);
router.get('/my', authMiddleware, getMySessions);

export default router;
