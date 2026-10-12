import { Router } from 'express';
import { getTraces, exportTracesAsCsv } from '../tracing/logger.js';

export const tracesRouter = Router();

// Query traces with filters
tracesRouter.get('/', (req, res) => {
  const { role, guard, failureId, status, limit } = req.query;
  const traces = getTraces({
    role: role as string,
    guard: guard as string,
    failureId: failureId as string,
    status: status as string,
    limit: limit ? parseInt(limit as string, 10) : 50,
  });
  res.json({ traces, total: traces.length });
});

// Export traces as CSV
tracesRouter.get('/export/csv', (req, res) => {
  const csv = exportTracesAsCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sahayata_traces.csv"');
  res.send(csv);
});
