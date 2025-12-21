import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  pdfaConformanceSchema,
} from '../utils/schemas.js';

export function registerPdfaTool(server: McpServer): void {
  server.tool(
    'convert-to-pdfa',
    'Convert a PDF to PDF/A format for long-term archiving',
    {
      file: fileInputSchema.describe('PDF file path or URL to convert'),
      conformance: pdfaConformanceSchema,
      allowDowngrade: z.boolean().optional().default(false).describe('Allow downgrade to a lower conformance level if needed'),
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, conformance, allowDowngrade, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Execute PDF/A conversion task
        const result = await executeTask('pdfa', [file], {
          conformance,
          allow_downgrade: allowDowngrade,
        });

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), `pdfa_${conformance}`);

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Successfully converted PDF to ${conformance.toUpperCase()} format`,
                outputPath: savedPath,
                details: {
                  conformance,
                  allowDowngrade,
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
