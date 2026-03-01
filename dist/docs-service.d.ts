interface SearchResult {
    topic: string;
    filename: string;
    snippet: string;
    score: number;
}
export declare function listTopics(): string[];
export declare function getDocByTopic(topic: string): string | null;
export declare function searchDocs(query: string, limit?: number): SearchResult[];
export declare function saveDoc(topic: string, content: string): void;
export declare function getAllDocsCount(): number;
export {};
//# sourceMappingURL=docs-service.d.ts.map