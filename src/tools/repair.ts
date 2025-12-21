import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
} from '../utils/schemas.js';

export function registerRepairTool(server: McpServer): void {
  server.tool(
    'repair-pdf',
    'Attempt to repair a damaged or corrupted PDF document',
    {
      file: fileInputSchema.describe('PDF file path or URL to repair'),
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Execute repair task
        const result = await executeTask('repair', [file]);

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'repaired');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Successfully repaired PDF',
                outputPath: savedPath,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
              }),
            },
          ],
        };
      }
    }
  );
}
