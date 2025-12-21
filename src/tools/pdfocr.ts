import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  ocrLanguagesSchema,
} from '../utils/schemas.js';

export function registerOcrTool(server: McpServer): void {
  server.tool(
    'ocr-pdf',
    'Perform OCR (Optical Character Recognition) on a scanned PDF to make it searchable',
    {
      file: fileInputSchema.describe('PDF file path or URL to perform OCR on'),
      languages: ocrLanguagesSchema,
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, languages, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Execute OCR task
        const result = await executeTask('pdfocr', [file], {
          ocr_languages: languages,
        });

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'ocr');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Successfully performed OCR on PDF',
                outputPath: savedPath,
                details: {
                  languages,
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
