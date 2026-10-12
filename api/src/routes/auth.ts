import { Router } from 'express';
import { getDb } from '../db/index.js';

export const authRouter = Router();

// List all mock users for role selection
authRouter.get('/users', (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, name, email, role, programme, batch, annual_family_income, cgpa, category FROM users ORDER BY role, name').all();
  res.json({ users });
});

// Get user profile by ID
authRouter.get('/user/:id', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, role, programme, batch, annual_family_income, cgpa, category, phone FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});
