import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
