import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import { env, brandConfig } from './config.js';
import { getDb } from './db/index.js';
import { authRouter } from './routes/auth.js';
import { ragRouter } from './routes/rag.js';
import { hardeningRouter } from './routes/hardening.js';
import { agentRouter } from './routes/agent.js';
import { tracesRouter } from './routes/traces.js';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: [env.WEB_URL, 'http://localhost:3000'],
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // Limit each IP to 300 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
});

// Health & System Info
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sahayata API',
    institute: brandConfig.institute.name,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/brand', (req, res) => {
  res.json(brandConfig);
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/rag', ragRouter);
app.use('/api/hardening', hardeningRouter);
app.use('/api/agent', agentRouter);
app.use('/api/traces', tracesRouter);

// Initialize DB tables and seed
getDb();

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    logger.info(`[Sahayata API] Server running on port ${env.PORT} (${env.NODE_ENV})`);
    logger.info(`[Sahayata API] Institute: ${brandConfig.institute.short_name}`);
  });
}

export default app;
