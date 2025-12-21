import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createTask, addFileToTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  passwordSchema,
} from '../utils/schemas.js';

export function registerUnlockTool(server: McpServer): void {
  server.tool(
    'unlock-pdf',
    'Remove password protection from a PDF document',
    {
      file: fileInputSchema.describe('PDF file path or URL to unlock'),
      password: passwordSchema.describe('Current password of the PDF'),
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, password, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Create task and add file with password
        const task = await createTask('unlock');
        await addFileToTask(task, file, { password });
        await task.process();
        const result = await task.download();

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'unlocked');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Successfully removed password protection from PDF',
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
