declare function scrapePage(slug: string): Promise<{
    topic: string;
    content: string;
} | null>;
declare function scrapeAllDocs(): Promise<void>;
export { scrapeAllDocs, scrapePage };
//# sourceMappingURL=scraper.d.ts.map