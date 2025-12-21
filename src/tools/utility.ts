import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getRemainingFiles, listTasks, chainOperations as executeChainOperations } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import { chainOperationsSchema, outputDirSchema, outputFilenameSchema } from '../utils/schemas.js';

export function registerUtilityTools(server: McpServer): void {
  // Get remaining API quota
  server.tool(
    'get-remaining-files',
    'Check how many API file operations remain in your iLovePDF quota',
    {},
    async () => {
      try {
        const remaining = await getRemainingFiles();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                remainingFiles: remaining,
                message: remaining !== undefined
                  ? `You have ${remaining} file operations remaining`
                  : 'Unable to determine remaining files',
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

  // List recent tasks
  server.tool(
    'list-tasks',
    'List recent PDF processing tasks from your iLovePDF account',
    {
      page: z.number().optional().default(1).describe('Page number for pagination'),
      tool: z.string().optional().describe('Filter by tool type (e.g., "merge", "compress")'),
      status: z.string().optional().describe('Filter by status'),
    },
    async ({ page, tool, status }) => {
      try {
        const tasks = await listTasks({ page, tool, status });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                tasks: tasks.map((t: { id: string; type: string }) => ({
                  id: t.id,
                  type: t.type,
                })),
                count: tasks.length,
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

  // Chain multiple operations
  server.tool(
    'chain-operations',
    'Chain multiple PDF operations together (e.g., compress then merge, or split then protect)',
    {
      file: z.string().describe('Initial PDF file path or URL'),
      operations: chainOperationsSchema,
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, operations, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Execute chained operations
        const result = await executeChainOperations(file, operations);

        // Generate output filename
        const operationNames = operations.map((op) => op.type).join('_');
        const filename = outputFilename || generateOutputFilename(
          extractFilename(file),
          `chained_${operationNames}`
        );

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Successfully executed ${operations.length} chained operations`,
                outputPath: savedPath,
                details: {
                  operations: operations.map((op) => op.type),
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
