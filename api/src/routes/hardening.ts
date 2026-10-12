import { Router } from 'express';
import { getHardeningConfig, updateHardeningConfig } from '../config.js';

export const hardeningRouter = Router();

hardeningRouter.get('/', (req, res) => {
  res.json(getHardeningConfig());
});

hardeningRouter.post('/toggle', (req, res) => {
  const { flag, value } = req.body;
  if (!flag || typeof value !== 'boolean') {
    return res.status(400).json({ error: 'Flag and boolean value required' });
  }
  const updated = updateHardeningConfig({ [flag]: value });
  res.json(updated);
});
