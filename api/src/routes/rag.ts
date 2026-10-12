import { Router } from 'express';
import { z } from 'zod';
import { retrieveRelevantChunks } from '../rag/retriever.js';
import { getDb } from '../db/index.js';
import { runIngestion } from '../scripts/ingest.js';

export const ragRouter = Router();

const searchSchema = z.object({
  query: z.string().min(1),
  role: z.enum(['student', 'staff', 'committee', 'admin']).default('student'),
  topK: z.number().int().min(1).max(20).default(5),
});

// Search knowledge base with hybrid retrieval + ACL
ragRouter.post('/search', async (req, res) => {
  try {
    const parsed = searchSchema.parse(req.body);
    const result = await retrieveRelevantChunks(parsed.query, parsed.role, parsed.topK);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Trigger ingestion manually
ragRouter.post('/ingest', async (req, res) => {
  try {
    await runIngestion();
    const db = getDb();
    const count = db.prepare('SELECT COUNT(*) as count FROM kb_chunks').get() as { count: number };
    res.json({ message: 'Ingestion complete', totalChunks: count.count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List all indexed chunks and manifest summary
ragRouter.get('/chunks', (req, res) => {
  const db = getDb();
  const chunks = db.prepare(`
    SELECT id, doc_id, title, section, version, status, access_level, token_count, heading_hierarchy
    FROM kb_chunks
    ORDER BY doc_id, id
  `).all();
  res.json({ chunks, total: chunks.length });
});
