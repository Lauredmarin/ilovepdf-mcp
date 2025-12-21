import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createTask, addFileToTask } from '../utils/api.js';
import { validateFiles } from '../utils/file-handler.js';
import {
  fileInputSchema,
  pdfaConformanceSchema,
} from '../utils/schemas.js';

export function registerValidatePdfaTool(server: McpServer): void {
  server.tool(
    'validate-pdfa',
    'Validate if a PDF conforms to PDF/A standards',
    {
      file: fileInputSchema.describe('PDF file path or URL to validate'),
      conformance: pdfaConformanceSchema.describe('PDF/A conformance level to validate against'),
    },
    async ({ file, conformance }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Create and execute validation task
        const task = await createTask('validatepdfa');
        await addFileToTask(task, file);
        const processResult = await task.process({ conformance }) as {
          validations?: Array<{
            server_filename: string;
            status: string;
          }>;
        };

        // Get validation results
        const validations = processResult.validations || [];
        const isValid = validations.every((v) => v.status === 'Valid');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: isValid
                  ? `PDF is valid ${conformance.toUpperCase()}`
                  : `PDF does not conform to ${conformance.toUpperCase()}`,
                details: {
                  conformance,
                  isValid,
                  validations: validations.map((v) => ({
                    filename: v.server_filename,
                    status: v.status,
                  })),
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
