import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerMergeTool } from './merge.js';
import { registerSplitTool } from './split.js';
import { registerCompressTool } from './compress.js';
import { registerRotateTool } from './rotate.js';
import { registerProtectTool } from './protect.js';
import { registerUnlockTool } from './unlock.js';
import { registerRepairTool } from './repair.js';
import { registerWatermarkTool } from './watermark.js';
import { registerPageNumberTool } from './pagenumber.js';
import { registerPdfToJpgTool } from './pdfjpg.js';
import { registerImageToPdfTool } from './imagepdf.js';
import { registerHtmlToPdfTool } from './htmlpdf.js';
import { registerOfficeToPdfTool } from './officepdf.js';
import { registerPdfaTool } from './pdfa.js';
import { registerValidatePdfaTool } from './validatepdfa.js';
import { registerExtractTool } from './extract.js';
import { registerOcrTool } from './pdfocr.js';
import { registerEditTool } from './editpdf.js';
import { registerSignTool } from './sign.js';
import { registerUtilityTools } from './utility.js';

/**
 * Register all PDF tools with the MCP server
 */
export function registerAllTools(server: McpServer): void {
  // Core operations
  registerMergeTool(server);
  registerSplitTool(server);
  registerCompressTool(server);
  registerRotateTool(server);
  registerProtectTool(server);
  registerUnlockTool(server);
  registerRepairTool(server);

  // Enhancement operations
  registerWatermarkTool(server);
  registerPageNumberTool(server);

  // Conversion operations
  registerPdfToJpgTool(server);
  registerImageToPdfTool(server);
  registerHtmlToPdfTool(server);
  registerOfficeToPdfTool(server);
  registerPdfaTool(server);
  registerValidatePdfaTool(server);

  // Text operations
  registerExtractTool(server);
  registerOcrTool(server);

  // Edit operations
  registerEditTool(server);

  // Signature operations
  registerSignTool(server);

  // Utility operations
  registerUtilityTools(server);
}
