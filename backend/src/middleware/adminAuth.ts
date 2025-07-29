import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { AuthenticatedRequest } from './auth';

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (req.user.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  next();
};