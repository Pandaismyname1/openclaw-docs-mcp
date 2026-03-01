import * as fs from "fs";
import * as path from "path";

const DOCS_DIR = path.join(process.cwd(), "docs");

interface DocFile {
  filename: string;
  topic: string;
  content: string;
}

interface SearchResult {
  topic: string;
  filename: string;
  snippet: string;
  score: number;
}

function ensureDocsDir() {
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
}

function getAllDocs(): DocFile[] {
  ensureDocsDir();
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith(".md"));
  
  return files.map(filename => {
    const content = fs.readFileSync(path.join(DOCS_DIR, filename), "utf-8");
    const topic = filename.replace(".md", "");
    return { filename, topic, content };
  });
}

export function listTopics(): string[] {
  const docs = getAllDocs();
  return docs.map(d => d.topic);
}

export function getDocByTopic(topic: string): string | null {
  const docs = getAllDocs();
  const doc = docs.find(d => d.topic.toLowerCase() === topic.toLowerCase());
  return doc?.content || null;
}

export function searchDocs(query: string, limit: number = 5): SearchResult[] {
  const docs = getAllDocs();
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);
  
  const results: SearchResult[] = [];
  
  for (const doc of docs) {
    const contentLower = doc.content.toLowerCase();
    let score = 0;
    
    for (const term of queryTerms) {
      if (doc.topic.toLowerCase().includes(term)) {
        score += 10;
      }
      if (contentLower.includes(term)) {
        score += 1;
        const idx = contentLower.indexOf(term);
        const start = Math.max(0, idx - 50);
        const end = Math.min(doc.content.length, idx + term.length + 50);
      }
    }
    
    if (score > 0) {
      let snippet = "";
      const firstTerm = queryTerms[0];
      if (firstTerm) {
        const idx = contentLower.indexOf(firstTerm);
        if (idx !== -1) {
          const start = Math.max(0, idx - 100);
          const end = Math.min(doc.content.length, idx + firstTerm.length + 200);
          snippet = (start > 0 ? "..." : "") + 
                    doc.content.slice(start, end).trim() + 
                    (end < doc.content.length ? "..." : "");
        }
      }
      
      if (!snippet) {
        snippet = doc.content.slice(0, 300) + (doc.content.length > 300 ? "..." : "");
      }
      
      results.push({
        topic: doc.topic,
        filename: doc.filename,
        snippet,
        score
      });
    }
  }
  
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function saveDoc(topic: string, content: string): void {
  ensureDocsDir();
  const filename = `${topic}.md`;
  fs.writeFileSync(path.join(DOCS_DIR, filename), content, "utf-8");
}

export function getAllDocsCount(): number {
  return getAllDocs().length;
}
