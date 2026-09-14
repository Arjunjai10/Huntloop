import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { users, workspaces } from '../schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceName, email, password } = req.body;
    
    if (!workspaceName || !email || !password) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Run in a global db transaction because there's no auth token yet
    const result = await db.transaction(async (tx) => {
      const [workspace] = await tx.insert(workspaces).values({
        name: workspaceName,
      }).returning();

      const [user] = await tx.insert(users).values({
        workspaceId: workspace.id,
        email,
        passwordHash,
        role: 'owner',
      }).returning();

      return { workspace, user };
    });

    const token = jwt.sign({ 
      workspaceId: result.workspace.id, 
      userId: result.user.id 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ message: 'Signup successful', user: { id: result.user.id, email } });
  } catch (error) {
    console.error('Signup error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const userMatches = await db.select().from(users).where(eq(users.email, email));
    if (userMatches.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const user = userMatches[0];

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ 
      workspaceId: user.workspaceId, 
      userId: user.id 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ message: 'Login successful', user: { id: user.id, email } });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
