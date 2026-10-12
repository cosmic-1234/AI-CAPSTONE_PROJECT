import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { env } from '../config.js';
import { runIngestion } from '../scripts/ingest.js';

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(env.DATABASE_PATH);
    dbInstance.pragma('journal_mode = WAL');
    initTables(dbInstance);
    seedInitialData(dbInstance);
  }
  return dbInstance;
}

function initTables(db: Database.Database) {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('student', 'staff', 'committee', 'admin')),
      programme TEXT,
      batch TEXT,
      annual_family_income REAL,
      cgpa REAL,
      category TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Applications table
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id),
      scheme_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'submitted', 'under_verification', 'committee_review', 'approved', 'rejected', 'disbursed')),
      requested_amount REAL,
      recommended_amount REAL,
      approved_amount REAL,
      submitted_at DATETIME,
      verification_status TEXT,
      committee_decision TEXT,
      decision_rationale TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Knowledge Base Chunks
    CREATE TABLE IF NOT EXISTS kb_chunks (
      id TEXT PRIMARY KEY,
      doc_id TEXT NOT NULL,
      title TEXT NOT NULL,
      section TEXT NOT NULL,
      version TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('current', 'superseded')),
      access_level TEXT NOT NULL CHECK(access_level IN ('public', 'staff', 'committee')),
      token_count INTEGER NOT NULL,
      content TEXT NOT NULL,
      heading_hierarchy TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Embedded vectors table (dense embeddings for cosine similarity)
    CREATE TABLE IF NOT EXISTS kb_vectors (
      chunk_id TEXT PRIMARY KEY REFERENCES kb_chunks(id) ON DELETE CASCADE,
      dimensions INTEGER NOT NULL,
      vector_json TEXT NOT NULL
    );

    -- LLM Prompt & Response Cache
    CREATE TABLE IF NOT EXISTS llm_cache (
      prompt_hash TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      response_text TEXT NOT NULL,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Trace Logging for Observability
    CREATE TABLE IF NOT EXISTS traces (
      run_id TEXT PRIMARY KEY,
      session_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      role TEXT NOT NULL,
      user_id TEXT,
      raw_input TEXT,
      masked_input TEXT NOT NULL,
      route TEXT NOT NULL,
      retrieved_chunks_json TEXT,
      prompts_json TEXT,
      output TEXT NOT NULL,
      guards_fired_json TEXT,
      tool_calls_json TEXT,
      prompt_tokens INTEGER DEFAULT 0,
      completion_tokens INTEGER DEFAULT 0,
      latency_ms INTEGER DEFAULT 0,
      latency_breakdown_json TEXT,
      inr_cost REAL DEFAULT 0,
      status TEXT NOT NULL,
      failure_id TEXT
    );

    -- Notifications outbox (mock with human approval & idempotency)
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT UNIQUE NOT NULL,
      student_id TEXT NOT NULL REFERENCES users(id),
      template TEXT NOT NULL,
      payload_json TEXT,
      status TEXT NOT NULL CHECK(status IN ('pending_approval', 'approved', 'rejected', 'sent')),
      created_by TEXT NOT NULL,
      approved_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at DATETIME
    );

    -- Disbursement notes (mock with committee approval & idempotency)
    CREATE TABLE IF NOT EXISTS disbursement_notes (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT UNIQUE NOT NULL,
      application_id TEXT NOT NULL REFERENCES applications(id),
      amount REAL NOT NULL,
      remarks TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending_approval', 'approved', 'rejected', 'disbursed')),
      created_by TEXT NOT NULL,
      approved_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      disbursed_at DATETIME
    );
  `);
}

function seedInitialData(db: Database.Database) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const studentsFile = path.join(env.DATA_DIR, 'students.csv');
    if (fs.existsSync(studentsFile)) {
      const csvData = fs.readFileSync(studentsFile, 'utf8');
      const records = parse(csvData, { columns: true, skip_empty_lines: true });
      const insert = db.prepare(`
        INSERT OR IGNORE INTO users (id, name, email, role, programme, batch, annual_family_income, cgpa, category, phone)
        VALUES (@id, @name, @email, @role, @programme, @batch, @annual_family_income, @cgpa, @category, @phone)
      `);
      const insertMany = db.transaction((rows: any[]) => {
        for (const row of rows) {
          insert.run({
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            programme: row.programme || null,
            batch: row.batch || null,
            annual_family_income: parseFloat(row.annual_family_income) || 0,
            cgpa: parseFloat(row.cgpa) || 0,
            category: row.category || 'General',
            phone: row.phone || null,
          });
        }
      });
      insertMany(records);
      console.log(`[DB] Seeded ${records.length} users from students.csv`);
    }
  }

  const appCount = db.prepare('SELECT COUNT(*) as count FROM applications').get() as { count: number };
  if (appCount.count === 0) {
    const appsFile = path.join(env.DATA_DIR, 'applications.csv');
    if (fs.existsSync(appsFile)) {
      const csvData = fs.readFileSync(appsFile, 'utf8');
      const records = parse(csvData, { columns: true, skip_empty_lines: true });
      const insert = db.prepare(`
        INSERT OR IGNORE INTO applications (id, student_id, scheme_id, status, requested_amount, recommended_amount, approved_amount, submitted_at, verification_status, committee_decision, decision_rationale)
        VALUES (@id, @student_id, @scheme_id, @status, @requested_amount, @recommended_amount, @approved_amount, @submitted_at, @verification_status, @committee_decision, @decision_rationale)
      `);
      const insertMany = db.transaction((rows: any[]) => {
        for (const row of rows) {
          insert.run({
            id: row.id,
            student_id: row.student_id,
            scheme_id: row.scheme_id,
            status: row.status,
            requested_amount: parseFloat(row.requested_amount) || 0,
            recommended_amount: parseFloat(row.recommended_amount) || 0,
            approved_amount: parseFloat(row.approved_amount) || 0,
            submitted_at: row.submitted_at || null,
            verification_status: row.verification_status || null,
            committee_decision: row.committee_decision || null,
            decision_rationale: row.decision_rationale || null,
          });
        }
      });
      insertMany(records);
      console.log(`[DB] Seeded ${records.length} applications from applications.csv`);
    }
  }

  // Auto-ingest Knowledge Base if empty (guarantees fresh database on ephemeral cloud deploys)
  try {
    const chunkCount = db.prepare('SELECT COUNT(*) as count FROM kb_chunks').get() as { count: number };
    if (chunkCount.count === 0) {
      console.log('[DB] No KB chunks found. Triggering automatic background ingestion...');
      runIngestion().catch((err) => console.error('[DB] Auto-ingestion error:', err));
    }
  } catch (err) {
    console.warn('[DB] Could not check kb_chunks table:', err);
  }
}
