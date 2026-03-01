#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { listTopics, getDocByTopic, searchDocs } from "./docs-service.js";
const server = new Server({
    name: "openclaw-docs-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_topics",
                description: "List all available CLI documentation topics",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "get_doc",
                description: "Get full documentation for a specific CLI command",
                inputSchema: {
                    type: "object",
                    properties: {
                        topic: {
                            type: "string",
                            description: "The CLI command to get documentation for (e.g., 'cli-agent', 'cli-message')",
                        },
                    },
                    required: ["topic"],
                },
            },
            {
                name: "search_docs",
                description: "Search CLI documentation by query",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query/keywords",
                        },
                        limit: {
                            type: "number",
                            description: "Maximum number of results to return",
                        },
                    },
                    required: ["query"],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments;
    if (name === "list_topics") {
        const topics = listTopics();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ topics, count: topics.length }),
                },
            ],
        };
    }
    if (name === "get_doc") {
        const topic = args.topic;
        const content = getDocByTopic(topic);
        if (!content) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({ error: `Topic '${topic}' not found` }),
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ topic, content }),
                },
            ],
        };
    }
    if (name === "search_docs") {
        const query = args.query;
        const limit = args.limit || 5;
        const results = searchDocs(query, limit);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ query, results }),
                },
            ],
        };
    }
    throw new Error(`Unknown tool: ${name}`);
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    process.stderr.write(`Server error: ${error}\n`);
    process.exit(1);
});
