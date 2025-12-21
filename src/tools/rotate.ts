import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createTask, addFileToTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  rotationSchema,
} from '../utils/schemas.js';

export function registerRotateTool(server: McpServer): void {
  server.tool(
    'rotate-pdf',
    'Rotate all pages in a PDF document by a specified angle',
    {
      file: fileInputSchema.describe('PDF file path or URL to rotate'),
      rotation: rotationSchema,
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, rotation, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Create task and add file with rotation
        const task = await createTask('rotate');
        await addFileToTask(task, file, { rotate: rotation });
        await task.process();
        const result = await task.download();

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), `rotated_${rotation}`);

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Successfully rotated PDF by ${rotation} degrees`,
                outputPath: savedPath,
                details: {
                  rotation,
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
