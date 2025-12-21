import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  pdfJpgModeSchema,
  dpiSchema,
} from '../utils/schemas.js';

export function registerPdfToJpgTool(server: McpServer): void {
  server.tool(
    'pdf-to-jpg',
    'Convert PDF pages to JPG images',
    {
      file: fileInputSchema.describe('PDF file path or URL to convert'),
      mode: pdfJpgModeSchema,
      dpi: dpiSchema,
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, mode, dpi, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Execute pdf to jpg task
        const result = await executeTask('pdfjpg', [file], {
          pdfjpg_mode: mode,
          dpi,
        });

        // Generate output filename (will be a zip with multiple images)
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'images', 'zip');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Successfully converted PDF to JPG images (${mode} mode)`,
                outputPath: savedPath,
                details: {
                  mode,
                  dpi,
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
