import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";

const DOCS_DIR = path.join(process.cwd(), "docs");
const BASE_URL = "https://docs.openclaw.ai";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

const CLI_PAGES = [
  "cli",
  "cli/acp",
  "cli/agent",
  "cli/agents",
  "cli/approvals",
  "cli/browser",
  "cli/channels",
  "cli/clawbot",
  "cli/completion",
  "cli/config",
  "cli/configure",
  "cli/cron",
  "cli/daemon",
  "cli/dashboard",
  "cli/devices",
  "cli/directory",
  "cli/dns",
  "cli/docs",
  "cli/doctor",
  "cli/gateway",
  "cli/health",
  "cli/hooks",
  "cli/logs",
  "cli/memory",
  "cli/message",
  "cli/models",
  "cli/node",
  "cli/nodes",
  "cli/onboard",
  "cli/pairing",
  "cli/plugins",
  "cli/qr",
  "cli/reset",
  "cli/sandbox",
  "cli/secrets",
  "cli/security",
  "cli/sessions",
  "cli/setup",
  "cli/skills",
  "cli/status",
  "cli/system",
  "cli/tui",
  "cli/uninstall",
  "cli/update",
  "cli/voicecall",
  "cli/webhooks",
];

function ensureDocsDir() {
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
}

function slugToFilename(slug: string): string {
  return slug.replace(/\//g, "-") + ".md";
}

async function scrapePage(slug: string): Promise<{ topic: string; content: string } | null> {
  const url = `${BASE_URL}/${slug}`;
  
  console.error(`Scraping: ${url}`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    
    const html = await page.content();
    
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const mainContent = document.querySelector("#content");
    const mdxContent = document.querySelector(".mdx-content");
    const content = mainContent || mdxContent;
    
    if (!content) {
      console.error(`No content found for ${url}`);
      await browser.close();
      return null;
    }
    
    const clone = content.cloneNode(true) as HTMLElement;
    
    const navElements = clone.querySelectorAll("nav, header, footer, .sidebar, #sidebar, [class*='nav'], [class*='sidebar']");
    navElements.forEach(el => el.remove());
    
    const scriptElements = clone.querySelectorAll("script, style");
    scriptElements.forEach(el => el.remove());
    
    const h1 = clone.querySelector("h1");
    const topic = h1?.textContent?.trim() || slug.split("/").pop() || slug;
    
    const markdown = turndownService.turndown(clone.innerHTML);
    
    await browser.close();
    
    return { topic, content: markdown };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    await browser.close();
    return null;
  }
}

async function scrapeAllDocs() {
  ensureDocsDir();
  
  console.error(`Starting CLI docs scrape... (${CLI_PAGES.length} pages)`);
  
  let successCount = 0;
  
  for (const page of CLI_PAGES) {
    const result = await scrapePage(page);
    
    if (result) {
      const filename = slugToFilename(page);
      const filepath = path.join(DOCS_DIR, filename);
      const markdownContent = `# ${result.topic}\n\n${result.content}`;
      fs.writeFileSync(filepath, markdownContent, "utf-8");
      console.error(`Saved: ${filename} (${result.content.length} chars)`);
      successCount++;
    }
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.error(`\nScraping complete! ${successCount}/${CLI_PAGES.length} pages saved to ${DOCS_DIR}`);
}

export { scrapeAllDocs, scrapePage };

if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeAllDocs().catch(console.error);
}
