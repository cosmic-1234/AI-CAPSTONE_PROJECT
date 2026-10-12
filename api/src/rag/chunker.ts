export interface ChunkMetadata {
  docId: string;
  title: string;
  section: string;
  version: string;
  status: 'current' | 'superseded';
  accessLevel: 'public' | 'staff' | 'committee';
  headingHierarchy: string;
}

export interface Chunk {
  id: string;
  content: string;
  tokenCount: number;
  metadata: ChunkMetadata;
}

// Approximate token estimation: ~4 chars per token
function estimateTokens(text: string): number {
  return Math.ceil(text.trim().split(/\s+/).length * 1.3);
}

/**
 * Parses markdown or structured text by headings, preserving section hierarchy.
 * Chunks by section (~500 tokens, 60 token overlap if exceeding section length).
 */
export function chunkDocumentBySection(
  rawText: string,
  baseMetadata: Omit<ChunkMetadata, 'section' | 'headingHierarchy'>
): Chunk[] {
  const lines = rawText.split('\n');
  const sections: { heading: string; hierarchy: string[]; content: string[] }[] = [];
  
  let currentHeading = 'Preamble';
  let currentHierarchy = ['Introduction'];
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('Illustrative - synthetic data') || trimmed.startsWith('Page ')) {
      continue;
    }

    const markdownMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    const numberedMatch = trimmed.match(/^([§\d]+(\.[\d]+)*\.?)\s+([A-Z][a-zA-Z0-9\s,\-–\(\)\/]+)$/);
    
    if (markdownMatch || (numberedMatch && numberedMatch[3].length < 80)) {
      if (currentLines.length > 0) {
        sections.push({
          heading: currentHeading,
          hierarchy: [...currentHierarchy],
          content: [...currentLines],
        });
        currentLines = [];
      }
      const title = markdownMatch ? markdownMatch[2].trim() : `${numberedMatch![1]} ${numberedMatch![3].trim()}`;
      const level = markdownMatch ? markdownMatch[1].length : (numberedMatch![1].split('.').length);
      currentHeading = title;
      currentHierarchy = currentHierarchy.slice(0, Math.max(1, level - 1));
      currentHierarchy.push(title);
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    sections.push({
      heading: currentHeading,
      hierarchy: [...currentHierarchy],
      content: [...currentLines],
    });
  }

  const chunks: Chunk[] = [];
  const TARGET_TOKENS = 500;
  const OVERLAP_TOKENS = 60;

  for (const sec of sections) {
    const sectionText = sec.content.join('\n').trim();
    if (!sectionText) continue;

    const tokens = estimateTokens(sectionText);
    const sectionId = sec.heading;

    if (tokens <= TARGET_TOKENS) {
      chunks.push({
        id: `${baseMetadata.docId}_sec_${chunks.length + 1}`,
        content: `### ${sec.heading}\n${sectionText}`,
        tokenCount: tokens,
        metadata: {
          ...baseMetadata,
          section: sectionId,
          headingHierarchy: sec.hierarchy.join(' > '),
        },
      });
    } else {
      // Split section with overlap
      const words = sectionText.split(/\s+/);
      const wordsPerChunk = Math.floor(TARGET_TOKENS / 1.3);
      const overlapWords = Math.floor(OVERLAP_TOKENS / 1.3);

      let start = 0;
      let part = 1;
      while (start < words.length) {
        const end = Math.min(start + wordsPerChunk, words.length);
        const chunkWords = words.slice(start, end);
        const chunkText = chunkWords.join(' ');

        chunks.push({
          id: `${baseMetadata.docId}_sec_${chunks.length + 1}_p${part}`,
          content: `### ${sec.heading} (Part ${part})\n${chunkText}`,
          tokenCount: estimateTokens(chunkText),
          metadata: {
            ...baseMetadata,
            section: `${sectionId} (Part ${part})`,
            headingHierarchy: sec.hierarchy.join(' > '),
          },
        });

        if (end >= words.length) break;
        start += wordsPerChunk - overlapWords;
        part++;
      }
    }
  }

  return chunks;
}
