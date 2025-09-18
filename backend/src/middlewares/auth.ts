import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const requireAuth = (roles?: Array<AuthPayload['role']>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev') as AuthPayload;
      req.user = decoded;
      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};


