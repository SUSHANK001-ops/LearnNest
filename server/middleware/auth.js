import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader) return next();
  const token = authHeader.split(' ')[1];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { id: payload.id, role: payload.role };
  } catch (err) {
    console.error('JWT verify error:', err.message);
    // don't block if token invalid for optional verification; treat as unauthenticated
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
