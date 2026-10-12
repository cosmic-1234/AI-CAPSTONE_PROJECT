import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { env } from '../config.js';
import { chunkDocumentBySection, Chunk } from '../rag/chunker.js';
import { generateEmbedding } from '../rag/embeddings.js';
import { indexVectorsInDb } from '../rag/vectorStore.js';
import { indexChunksInKeywordStore } from '../rag/keywordStore.js';

interface ManifestItem {
  doc_id: string;
  title: string;
  owner: string;
  version_date: string;
  status: 'current' | 'superseded';
  access_level: 'public' | 'staff' | 'committee';
  filename?: string;
}

async function extractFileText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    // Markdown or text
    return buffer.toString('utf8');
  }
}

export async function runIngestion() {
  console.log('[Ingest] Starting Knowledge Base ingestion...');
  const kbDir = env.KNOWLEDGE_BASE_DIR;
  if (!fs.existsSync(kbDir)) {
    console.error(`[Ingest] Knowledge base directory not found at: ${kbDir}`);
    return;
  }

  // Check for manifest.csv
  const manifestFile = path.join(kbDir, 'manifest.csv');
  const manifestMap = new Map<string, ManifestItem>();

  if (fs.existsSync(manifestFile)) {
    try {
      const manifestCsv = fs.readFileSync(manifestFile, 'utf8');
      const records = parse(manifestCsv, { columns: true, skip_empty_lines: true }) as any[];
      for (const rec of records) {
        const fname = rec.file?.trim() || rec.filename?.trim();
        manifestMap.set(rec.doc_id.trim().toLowerCase(), {
          doc_id: rec.doc_id.trim(),
          title: rec.title.trim(),
          owner: rec.owner?.trim() || 'Aid Committee',
          version_date: rec.version_date?.trim() || rec.version?.trim() || '2026-27',
          status: (rec.status?.trim().toLowerCase() === 'superseded' ? 'superseded' : 'current') as any,
          access_level: (rec.access_level?.trim().toLowerCase() || 'public') as any,
          filename: fname,
        });
      }
      console.log(`[Ingest] Loaded manifest with ${manifestMap.size} documents.`);
    } catch (err) {
      console.warn('[Ingest] Could not parse manifest.csv:', err);
    }
  }

  const allFiles = fs.readdirSync(kbDir).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ['.md', '.txt', '.pdf', '.docx'].includes(ext) && !file.toLowerCase().includes('readme');
  });

  if (allFiles.length === 0) {
    console.log('[Ingest] No policy files found in knowledge_base directory yet.');
    console.log('[Ingest] User will provide documents in knowledge_base/. Ingestion is ready to run whenever files are placed.');
    return;
  }

  console.log(`[Ingest] Found ${allFiles.length} documents to process:`, allFiles);
  const allChunks: Chunk[] = [];

  for (const file of allFiles) {
    const filePath = path.join(kbDir, file);
    const basename = path.basename(file, path.extname(file));
    
    // Attempt match in manifest
    let docMeta = Array.from(manifestMap.values()).find(
      (m) => m.filename === file || (m.filename && file.toLowerCase().includes(m.filename.toLowerCase())) || basename.toLowerCase().includes(m.doc_id.toLowerCase())
    );

    if (!docMeta) {
      // Default heuristic metadata from filename
      const isSuperseded = file.toLowerCase().includes('superseded') || file.toLowerCase().includes('2025');
      const isStaff = file.toLowerCase().includes('sop') || file.toLowerCase().includes('charter') || file.toLowerCase().includes('committee');
      docMeta = {
        doc_id: basename,
        title: basename.replace(/_/g, ' '),
        owner: 'Academic / Aid Committee',
        version_date: isSuperseded ? '2025-26' : '2026-27',
        status: isSuperseded ? 'superseded' : 'current',
        access_level: isStaff ? 'staff' : 'public',
      };
    }

    try {
      console.log(`[Ingest] Parsing: ${file} (doc_id: ${docMeta.doc_id}, status: ${docMeta.status}, access: ${docMeta.access_level})`);
      const text = await extractFileText(filePath);
      const chunks = chunkDocumentBySection(text, {
        docId: docMeta.doc_id,
        title: docMeta.title,
        version: docMeta.version_date,
        status: docMeta.status,
        accessLevel: docMeta.access_level,
      });

      console.log(`[Ingest] -> Generated ${chunks.length} chunks for ${file}`);
      allChunks.push(...chunks);
    } catch (err) {
      console.error(`[Ingest] Error processing ${file}:`, err);
    }
  }

  if (allChunks.length === 0) {
    console.log('[Ingest] No chunks generated.');
    return;
  }

  console.log(`[Ingest] Computing embeddings for ${allChunks.length} chunks...`);
  const embeddings: number[][] = [];
  for (let i = 0; i < allChunks.length; i++) {
    const emb = await generateEmbedding(allChunks[i].content);
    embeddings.push(emb);
    if ((i + 1) % 10 === 0 || i === allChunks.length - 1) {
      console.log(`[Ingest] Embedded ${i + 1}/${allChunks.length} chunks`);
    }
  }

  console.log('[Ingest] Saving chunks and dense vectors to database...');
  indexVectorsInDb(allChunks, embeddings);

  console.log('[Ingest] Indexing into BM25 keyword store...');
  indexChunksInKeywordStore(allChunks);

  console.log(`[Ingest] Successfully indexed ${allChunks.length} chunks across ${allFiles.length} documents!`);
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('ingest')) {
  runIngestion().catch((err) => {
    console.error('[Ingest] Fatal error during ingestion:', err);
    process.exit(1);
  });
}
