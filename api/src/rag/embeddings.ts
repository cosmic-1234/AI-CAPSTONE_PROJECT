import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config.js';

let pipelineInstance: any = null;
let pipelineLoading: Promise<any> | null = null;

async function getLocalPipeline() {
  if (pipelineInstance) return pipelineInstance;
  if (!pipelineLoading) {
    pipelineLoading = (async () => {
      try {
        const { pipeline } = await import('@xenova/transformers');
        pipelineInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          quantized: true,
        });
        return pipelineInstance;
      } catch (err) {
        console.warn('[Embeddings] Local transformers.js unavailable, falling back to deterministic dense vector hashing:', err);
        return null;
      }
    })();
  }
  return pipelineLoading;
}

/**
 * Deterministic fallback embedding generator (384-dim) for offline/airgapped environments.
 */
function createDeterministicEmbedding(text: string, dimensions = 384): number[] {
  const vector = new Array(dimensions).fill(0);
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    const sign = (hash & 1) === 0 ? 1 : -1;
    vector[idx] += sign * (1 / Math.sqrt(i + 1));
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  } else {
    vector[0] = 1.0;
  }
  return vector;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const trimmed = text.slice(0, 2000); // safety cap

  if (env.EMBEDDING_PROVIDER === 'gemini' && env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(trimmed);
      return result.embedding.values;
    } catch (err) {
      console.warn('[Embeddings] Gemini embedding failed, falling back:', err);
    }
  }

  // Local transformer pipeline
  const pipe = await getLocalPipeline();
  if (pipe) {
    try {
      const output = await pipe(trimmed, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (err) {
      console.warn('[Embeddings] Local transformer error, using fallback:', err);
    }
  }

  return createDeterministicEmbedding(trimmed);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
