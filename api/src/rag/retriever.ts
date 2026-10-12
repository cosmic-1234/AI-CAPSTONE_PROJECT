import { getDb } from '../db/index.js';
import { generateEmbedding } from './embeddings.js';
import { searchVectorStore } from './vectorStore.js';
import { searchKeywordStore } from './keywordStore.js';
import { getHardeningConfig, brandConfig } from '../config.js';

export interface RetrievedChunk {
  id: string;
  docId: string;
  title: string;
  section: string;
  version: string;
  status: 'current' | 'superseded';
  accessLevel: 'public' | 'staff' | 'committee';
  content: string;
  headingHierarchy: string;
  score: number;
  denseRank?: number;
  bm25Rank?: number;
  citation: string;
}

export interface RetrievalResult {
  query: string;
  chunks: RetrievedChunk[];
  isLowConfidence: boolean;
  fallbackMessage?: string;
}

export async function retrieveRelevantChunks(
  query: string,
  userRole: 'student' | 'staff' | 'committee' | 'admin' = 'student',
  topK = 5
): Promise<RetrievalResult> {
  const db = getDb();
  const hardening = getHardeningConfig().hardening;

  // 1. Determine permitted access levels for role
  const allowedAccessLevels: string[] = ['public'];
  if (userRole === 'staff') {
    allowedAccessLevels.push('staff');
  } else if (userRole === 'committee' || userRole === 'admin') {
    allowedAccessLevels.push('staff', 'committee');
  }

  // 2. Perform Vector Search
  const queryEmbedding = await generateEmbedding(query);
  const vectorResults = searchVectorStore(queryEmbedding, 30);

  // 3. Perform BM25 Keyword Search
  const keywordResults = searchKeywordStore(query, 30);

  // 4. Map ranks for Reciprocal Rank Fusion (RRF k=60)
  const kRRF = 60;
  const chunkScores = new Map<string, { rrf: number; denseRank?: number; bm25Rank?: number }>();

  vectorResults.forEach((res, index) => {
    const rank = index + 1;
    const current = chunkScores.get(res.chunkId) || { rrf: 0 };
    current.denseRank = rank;
    current.rrf += 1 / (kRRF + rank);
    chunkScores.set(res.chunkId, current);
  });

  keywordResults.forEach((res, index) => {
    const rank = index + 1;
    const current = chunkScores.get(res.id) || { rrf: 0 };
    current.bm25Rank = rank;
    current.rrf += 1 / (kRRF + rank);
    chunkScores.set(res.id, current);
  });

  // 5. Fetch candidate chunk details from DB
  const candidateIds = Array.from(chunkScores.keys());
  if (candidateIds.length === 0) {
    return {
      query,
      chunks: [],
      isLowConfidence: true,
      fallbackMessage: `I could not find this in the current documents. Please contact the ${brandConfig.offices.accounts?.name || 'Accounts Office'} (${brandConfig.offices.accounts?.email || 'accounts@example.ac.in'}).`,
    };
  }

  const placeholders = candidateIds.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT id, doc_id, title, section, version, status, access_level, content, heading_hierarchy
    FROM kb_chunks
    WHERE id IN (${placeholders})
  `).all(...candidateIds) as any[];

  // 6. Filter by ACL and hardening policy
  const filteredChunks: RetrievedChunk[] = [];
  for (const row of rows) {
    // ACL Enforcement Guard (F4)
    if (hardening.retrieval_acl_enforcement) {
      if (!allowedAccessLevels.includes(row.access_level)) {
        continue; // strictly block unauthorized documents at query level
      }
    }

    // Policy Supersession Guard (F1)
    if (hardening.enforce_current_policy_only) {
      if (row.status === 'superseded') {
        continue; // strictly block superseded policies
      }
    }

    const scoreData = chunkScores.get(row.id)!;
    filteredChunks.push({
      id: row.id,
      docId: row.doc_id,
      title: row.title,
      section: row.section,
      version: row.version,
      status: row.status,
      accessLevel: row.access_level,
      content: row.content,
      headingHierarchy: row.heading_hierarchy,
      score: scoreData.rrf,
      denseRank: scoreData.denseRank,
      bm25Rank: scoreData.bm25Rank,
      citation: `${row.title}, §${row.section}, ${row.version}`,
    });
  }

  // Sort by fused RRF score descending
  filteredChunks.sort((a, b) => b.score - a.score);
  const topChunks = filteredChunks.slice(0, topK);

  // 7. Threshold Guard (F13)
  const bestCosineSimilarity = vectorResults[0]?.score ?? 0;
  const hasKeywordMatches = keywordResults.length > 0;
  
  const isBelowThreshold = topChunks.length === 0 || (
    hardening.enforce_retrieval_threshold &&
    !hasKeywordMatches &&
    bestCosineSimilarity < hardening.min_relevance_threshold
  );

  if (isBelowThreshold) {
    return {
      query,
      chunks: topChunks,
      isLowConfidence: true,
      fallbackMessage: `I could not find this in the current documents. Please contact the ${brandConfig.offices.accounts?.name || 'Accounts Office'} (${brandConfig.offices.accounts?.email || 'accounts@example.ac.in'}) or Aid Committee.`,
    };
  }

  return {
    query,
    chunks: topChunks,
    isLowConfidence: false,
  };
}
