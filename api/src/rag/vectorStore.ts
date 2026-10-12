import { getDb } from '../db/index.js';
import { Chunk } from './chunker.js';
import { cosineSimilarity } from './embeddings.js';

export interface VectorSearchResult {
  chunkId: string;
  score: number;
}

export function indexVectorsInDb(chunks: Chunk[], embeddings: number[][]) {
  const db = getDb();
  const insertChunk = db.prepare(`
    INSERT OR REPLACE INTO kb_chunks (id, doc_id, title, section, version, status, access_level, token_count, content, heading_hierarchy)
    VALUES (@id, @doc_id, @title, @section, @version, @status, @access_level, @token_count, @content, @heading_hierarchy)
  `);

  const insertVector = db.prepare(`
    INSERT OR REPLACE INTO kb_vectors (chunk_id, dimensions, vector_json)
    VALUES (@chunk_id, @dimensions, @vector_json)
  `);

  const runTx = db.transaction(() => {
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const emb = embeddings[i];
      insertChunk.run({
        id: c.id,
        doc_id: c.metadata.docId,
        title: c.metadata.title,
        section: c.metadata.section,
        version: c.metadata.version,
        status: c.metadata.status,
        access_level: c.metadata.accessLevel,
        token_count: c.tokenCount,
        content: c.content,
        heading_hierarchy: c.metadata.headingHierarchy,
      });

      insertVector.run({
        chunk_id: c.id,
        dimensions: emb.length,
        vector_json: JSON.stringify(emb),
      });
    }
  });

  runTx();
}

export function searchVectorStore(queryEmbedding: number[], limit = 20): VectorSearchResult[] {
  const db = getDb();
  const rows = db.prepare('SELECT chunk_id, vector_json FROM kb_vectors').all() as Array<{
    chunk_id: string;
    vector_json: string;
  }>;

  const scored: VectorSearchResult[] = [];
  for (const row of rows) {
    const vec: number[] = JSON.parse(row.vector_json);
    const sim = cosineSimilarity(queryEmbedding, vec);
    scored.push({
      chunkId: row.chunk_id,
      score: sim,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
