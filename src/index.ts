#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { registerAllTools } from './tools/index.js';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in project root
// This works regardless of where the server is run from
dotenv.config({ path: join(__dirname, '..', '.env') });

// Validate required environment variables
function validateEnvironment(): void {
  const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
  const secretKey = process.env.ILOVEPDF_SECRET_KEY;

  if (!publicKey || !secretKey) {
    console.error('Error: Missing iLovePDF API credentials.');
    console.error('Please set ILOVEPDF_PUBLIC_KEY and ILOVEPDF_SECRET_KEY environment variables.');
    console.error('You can get your keys from https://developer.ilovepdf.com/user/projects');
    process.exit(1);
  }
}

// Create and configure the MCP server
async function main(): Promise<void> {
  // Validate environment on startup
  validateEnvironment();

  // Create MCP server
  const server = new McpServer({
    name: 'ilovepdf',
    version: '1.0.0',
  });

  // Register all PDF tools
  registerAllTools(server);

  // Create stdio transport for communication
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.close();
    process.exit(0);
  });
}

// Run the server
main().catch((error) => {
  console.error('Failed to start iLovePDF MCP server:', error);
  process.exit(1);
});
