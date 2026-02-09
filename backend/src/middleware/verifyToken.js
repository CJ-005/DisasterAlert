import jwt from 'jsonwebtoken'; //
import { prisma } from '../lib/prisma.js'; // Added .js extension
import { AppError } from '../utils/AppError.js'; // Added .js extension

export async function verifyToken(req, res, next) { //
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { agency: true },
    });
    
    if (!user) {
      return next(new AppError('User not found', 401));
    }
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 401));
    }
    
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(err);
  }
}