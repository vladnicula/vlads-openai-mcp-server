#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { validateEnvironment } from "./utils/env.js";
import { tools, toolHandlers } from "./tools/index.js";

async function main() {
  console.error("[INFO] Starting OpenAI MCP Server");

  // Validate environment variables
  try {
    validateEnvironment();
    console.error("[INFO] Environment validation passed");
  } catch (error) {
    console.error("[ERROR] Environment validation failed:", error);
    process.exit(1);
  }

  // Create server instance
  const server = new Server(
    {
      name: "OpenAI Multi-Model MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register list tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error(`[INFO] Listing ${tools.length} available tools`);
    return {
      tools: tools,
    };
  });

  // Register call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    console.error(`[INFO] Tool called: ${name}`);

    try {
      const handler = toolHandlers.get(name);
      if (!handler) {
        const errorMsg = `Unknown tool: ${name}`;
        console.error(`[ERROR] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const result = await handler(args);
      console.error(`[INFO] Tool ${name} completed successfully`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Tool ${name} failed:`, errorMsg);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: "Tool execution failed",
              message: errorMsg,
            }, null, 2),
          },
        ],
      };
    }
  });

  // Connect to transport
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[INFO] Server connected and ready");
  } catch (error) {
    console.error("[ERROR] Failed to connect server:", error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error("[FATAL] Server startup failed:", error);
  process.exit(1);
});