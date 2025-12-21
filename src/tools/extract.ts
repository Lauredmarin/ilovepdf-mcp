import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  detailedSchema,
  byWordSchema,
} from '../utils/schemas.js';

export function registerExtractTool(server: McpServer): void {
  server.tool(
    'extract-text',
    'Extract text content from a PDF document',
    {
      file: fileInputSchema.describe('PDF file path or URL to extract text from'),
      detailed: detailedSchema,
      byWord: byWordSchema,
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, detailed, byWord, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Execute extract task
        const result = await executeTask('extract', [file], {
          detailed,
          by_word: byWord,
        });

        // Generate output filename (text file)
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'extracted', 'txt');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Successfully extracted text from PDF',
                outputPath: savedPath,
                details: {
                  detailed,
                  byWord,
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
