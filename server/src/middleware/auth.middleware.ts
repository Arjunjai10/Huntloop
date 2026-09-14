import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

declare global {
  namespace Express {
    interface Request {
      workspaceId?: string;
      userId?: string;
      tx?: any;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { workspaceId: string, userId: string };
    req.workspaceId = decoded.workspaceId;
    req.userId = decoded.userId;

    // Wrap the rest of the request in a transaction for RLS isolation
    await db.transaction(async (tx) => {
      // SET LOCAL scopes the workspace ID to this transaction
      await tx.execute(`SET LOCAL app.current_workspace_id = '${decoded.workspaceId}'`);
      
      req.tx = tx;
      
      return new Promise((resolve, reject) => {
        res.on('finish', resolve);
        res.on('error', reject);
        next();
      });
    });

  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
