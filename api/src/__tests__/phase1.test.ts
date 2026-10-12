import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from '../db/index.js';
import { chunkDocumentBySection } from '../rag/chunker.js';
import { generateEmbedding, cosineSimilarity } from '../rag/embeddings.js';
import { indexChunksInKeywordStore, searchKeywordStore } from '../rag/keywordStore.js';
import { indexVectorsInDb, searchVectorStore } from '../rag/vectorStore.js';
import { retrieveRelevantChunks } from '../rag/retriever.js';
import { updateHardeningConfig } from '../config.js';

describe('Phase 1: Architecture, Ingestion & Hybrid Retrieval', () => {
  beforeAll(() => {
    // Ensure DB is initialized
    const db = getDb();
    expect(db).toBeDefined();
  });

  it('1. Initializes SQLite database and seeds synthetic users', () => {
    const db = getDb();
    const users = db.prepare('SELECT * FROM users').all() as any[];
    expect(users.length).toBeGreaterThan(0);
    const amit = users.find((u) => u.id === 'std_01');
    expect(amit).toBeDefined();
    expect(amit.name).toBe('Amit Kumar');
    expect(amit.role).toBe('student');
  });

  it('2. Chunks documents by section while preserving headings and hierarchy', () => {
    const sampleDoc = `
# 01 Scholarship Policy 2026-27

## §1. Overview
The Indian Institute of Management Bodh Gaya provides financial assistance to deserving students.

## §2. Eligibility Criteria
Candidates must be enrolled in the full-time PGP or IPM programme.

## §3. Need-Based Financial Assistance
Tuition fee waivers are structured based on annual gross family income.
    `.trim();

    const chunks = chunkDocumentBySection(sampleDoc, {
      docId: 'doc_01',
      title: 'Scholarship Policy 2026-27',
      version: '2026-27',
      status: 'current',
      accessLevel: 'public',
    });

    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks[0].metadata.title).toBe('Scholarship Policy 2026-27');
    expect(chunks[0].metadata.section).toBe('§1. Overview');
    expect(chunks[0].tokenCount).toBeGreaterThan(0);
  });

  it('3. Generates dense embeddings and computes cosine similarity correctly', async () => {
    const emb1 = await generateEmbedding('tuition fee waiver criteria');
    const emb2 = await generateEmbedding('fee waiver eligibility and income limits');
    const emb3 = await generateEmbedding('unrelated recipe for chocolate cake');

    expect(emb1.length).toBeGreaterThan(0);
    expect(emb2.length).toBe(emb1.length);

    const simRelated = cosineSimilarity(emb1, emb2);
    const simUnrelated = cosineSimilarity(emb1, emb3);

    expect(simRelated).toBeGreaterThan(simUnrelated);
  }, 30000);

  it('4. Indexes and performs lexical search using MiniSearch BM25', () => {
    const testChunks = [
      {
        id: 'chunk_test_1',
        content: 'Income certificate must be issued by a competent revenue authority not below Tehsildar rank.',
        tokenCount: 20,
        metadata: {
          docId: 'doc_sop',
          title: 'Income Verification SOP',
          section: '§2. Authority',
          version: '2026-27',
          status: 'current' as const,
          accessLevel: 'staff' as const,
          headingHierarchy: 'Verification > Authority',
        },
      },
      {
        id: 'chunk_test_2',
        content: 'Director Merit Scholarship awards INR 1,00,000 for top academic achievers with CGPA above 8.5.',
        tokenCount: 22,
        metadata: {
          docId: 'doc_merit',
          title: 'Merit Scholarship Rules',
          section: '§1. Awards',
          version: '2026-27',
          status: 'current' as const,
          accessLevel: 'public' as const,
          headingHierarchy: 'Awards > Director Merit',
        },
      },
    ];

    indexChunksInKeywordStore(testChunks);
    const results = searchKeywordStore('Tehsildar income certificate');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('chunk_test_1');
  });

  it('5. Enforces Role-based Access Control (ACL) at query level', async () => {
    // Insert a public chunk and a staff-only chunk
    const testChunks = [
      {
        id: 'acl_chunk_pub',
        content: 'General public guidelines for financial aid application process.',
        tokenCount: 15,
        metadata: {
          docId: 'doc_pub',
          title: 'Public Guide',
          section: '§1',
          version: '2026-27',
          status: 'current' as const,
          accessLevel: 'public' as const,
          headingHierarchy: 'Public Guide',
        },
      },
      {
        id: 'acl_chunk_staff',
        content: 'Internal confidential SOP for verifying student ITR submissions and fraud checks.',
        tokenCount: 18,
        metadata: {
          docId: 'doc_staff',
          title: 'Internal Audit SOP',
          section: '§9',
          version: '2026-27',
          status: 'current' as const,
          accessLevel: 'staff' as const,
          headingHierarchy: 'Audit > Fraud Checks',
        },
      },
    ];

    const emb1 = await generateEmbedding(testChunks[0].content);
    const emb2 = await generateEmbedding(testChunks[1].content);

    indexVectorsInDb(testChunks, [emb1, emb2]);
    indexChunksInKeywordStore(testChunks);

    // Ensure ACL guard is ON
    updateHardeningConfig({ retrieval_acl_enforcement: true });

    // Search as student
    const studentRes = await retrieveRelevantChunks('confidential SOP fraud checks', 'student', 5);
    const hasStaffChunk = studentRes.chunks.some((c) => c.accessLevel === 'staff');
    expect(hasStaffChunk).toBe(false);

    // Search as staff
    const staffRes = await retrieveRelevantChunks('confidential SOP fraud checks', 'staff', 5);
    const staffHasChunk = staffRes.chunks.some((c) => c.id === 'acl_chunk_staff');
    expect(staffHasChunk).toBe(true);
  });

  it('6. Blocks superseded documents when hardening.enforce_current_policy_only is true (F1 guard)', async () => {
    const testChunks = [
      {
        id: 'doc_2025_superseded',
        content: 'In 2025-26, the maximum income threshold for aid was INR 2,00,000 only.',
        tokenCount: 16,
        metadata: {
          docId: 'doc_01a',
          title: 'Scholarship Policy 2025-26',
          section: '§2. Outdated Thresholds',
          version: '2025-26',
          status: 'superseded' as const,
          accessLevel: 'public' as const,
          headingHierarchy: 'Old Rules',
        },
      },
    ];

    const emb = await generateEmbedding(testChunks[0].content);
    indexVectorsInDb(testChunks, [emb]);
    indexChunksInKeywordStore(testChunks);

    // With guard ON: should NOT retrieve superseded doc
    updateHardeningConfig({ enforce_current_policy_only: true });
    const guardedRes = await retrieveRelevantChunks('maximum income threshold 2025', 'student', 5);
    const foundGuarded = guardedRes.chunks.some((c) => c.id === 'doc_2025_superseded');
    expect(foundGuarded).toBe(false);

    // With guard OFF: reproduces failure F1 (returns outdated policy)
    updateHardeningConfig({ enforce_current_policy_only: false });
    const unguardedRes = await retrieveRelevantChunks('maximum income threshold 2025', 'student', 5);
    const foundUnguarded = unguardedRes.chunks.some((c) => c.id === 'doc_2025_superseded');
    expect(foundUnguarded).toBe(true);

    // Reset back to secure state
    updateHardeningConfig({ enforce_current_policy_only: true });
  });

  it('7. Emits low-confidence fallback when query is out of domain or below threshold (F13 guard)', async () => {
    updateHardeningConfig({ enforce_retrieval_threshold: true });
    const res = await retrieveRelevantChunks('xyzabc totally bogus query with zero relevance to anything 99999', 'student', 5);
    expect(res.isLowConfidence).toBe(true);
    expect(res.fallbackMessage).toContain('I could not find this in the current documents');
  });
});
