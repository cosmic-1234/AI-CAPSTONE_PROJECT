import MiniSearch from 'minisearch';
import { Chunk } from './chunker.js';

let miniSearchInstance: MiniSearch<any> | null = null;

export function getKeywordIndex(): MiniSearch<any> {
  if (!miniSearchInstance) {
    miniSearchInstance = new MiniSearch({
      fields: ['title', 'section', 'content', 'headingHierarchy'],
      storeFields: ['id', 'docId', 'title', 'section', 'version', 'status', 'accessLevel', 'content', 'headingHierarchy'],
      searchOptions: {
        boost: { title: 3, section: 2, headingHierarchy: 1.5, content: 1 },
        prefix: true,
        fuzzy: 0.2,
      },
    });
  }
  return miniSearchInstance;
}

export function indexChunksInKeywordStore(chunks: Chunk[]) {
  const index = getKeywordIndex();
  // Clear any existing index documents with same IDs
  const documents = chunks.map((c) => ({
    id: c.id,
    docId: c.metadata.docId,
    title: c.metadata.title,
    section: c.metadata.section,
    version: c.metadata.version,
    status: c.metadata.status,
    accessLevel: c.metadata.accessLevel,
    headingHierarchy: c.metadata.headingHierarchy,
    content: c.content,
  }));
  index.removeAll();
  index.addAll(documents);
}

export function searchKeywordStore(query: string, limit = 20) {
  const index = getKeywordIndex();
  return index.search(query, {
    combineWith: 'OR',
    prefix: true,
  }).slice(0, limit);
}
