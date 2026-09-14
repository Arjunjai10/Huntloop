import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { companies } from '../schema.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

// Test route to verify RLS
router.get('/me', requireAuth, async (req, res) => {
  try {
    // req.tx is the transaction isolated by RLS
    const myCompanies = await req.tx.select().from(companies);
    res.status(200).json({ workspaceId: req.workspaceId, userId: req.userId, companies: myCompanies });
  } catch (e) {
    res.status(500).json({ error: 'Error fetching isolated data' });
  }
});

export default router;
