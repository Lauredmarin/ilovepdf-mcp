import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
} from '../utils/schemas.js';

export function registerOfficeToPdfTool(server: McpServer): void {
  server.tool(
    'office-to-pdf',
    'Convert Microsoft Office documents (Word, Excel, PowerPoint) to PDF',
    {
      file: fileInputSchema.describe('Office document file path or URL to convert (supports .doc, .docx, .xls, .xlsx, .ppt, .pptx)'),
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Execute office to pdf task
        const result = await executeTask('officepdf', [file]);

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'converted');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Successfully converted Office document to PDF',
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
