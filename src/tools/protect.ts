import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  passwordSchema,
} from '../utils/schemas.js';

export function registerProtectTool(server: McpServer): void {
  server.tool(
    'protect-pdf',
    'Add password protection to a PDF document',
    {
      file: fileInputSchema.describe('PDF file path or URL to protect'),
      password: passwordSchema.describe('Password to protect the PDF with'),
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, password, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Execute protect task
        const result = await executeTask('protect', [file], { password });

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'protected');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Successfully protected PDF with password',
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
