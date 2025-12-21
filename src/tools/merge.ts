import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import { filesInputSchema, outputDirSchema, outputFilenameSchema } from '../utils/schemas.js';

export function registerMergeTool(server: McpServer): void {
  server.tool(
    'merge-pdfs',
    'Merge multiple PDF files into a single PDF document',
    {
      files: filesInputSchema.min(2).describe('Array of PDF file paths or URLs to merge (minimum 2)'),
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ files, outputDir, outputFilename }) => {
      try {
        // Validate files exist
        await validateFiles(files);

        // Execute merge task
        const result = await executeTask('merge', files);

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(files[0]), 'merged');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Successfully merged ${files.length} PDF files`,
                outputPath: savedPath,
                details: {
                  filesCount: files.length,
                },
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
