import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader) return next();
  const token = authHeader.split(' ')[1];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });
    if (user) {
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
    } else {
      req.user = { id: payload.id, role: payload.role };
    }
  } catch (err) {
    console.error('JWT verify error:', err.message);
  }
  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  next();
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
  next();
};
