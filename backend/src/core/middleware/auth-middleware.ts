import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { JwtPayload, Role } from '../types/auth';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function requireJwt(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: 'Missing JWT token' });
    return;
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid JWT token' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    next();
  };
}
