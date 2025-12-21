import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  splitModeSchema,
  rangesSchema,
  fixedRangeSchema,
  mergeAfterSchema,
} from '../utils/schemas.js';

export function registerSplitTool(server: McpServer): void {
  server.tool(
    'split-pdf',
    'Split a PDF file into multiple documents based on page ranges or fixed intervals',
    {
      file: fileInputSchema.describe('PDF file path or URL to split'),
      splitMode: splitModeSchema,
      ranges: rangesSchema.describe('Page ranges (e.g., "1-3,4-6,7-10") for ranges mode, or pages to remove for remove_pages mode'),
      fixedRange: fixedRangeSchema.describe('Split every N pages when using fixed_range mode'),
      mergeAfter: mergeAfterSchema,
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, splitMode, ranges, fixedRange, mergeAfter, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Build process params
        const processParams: Record<string, unknown> = {
          split_mode: splitMode,
          merge_after: mergeAfter,
        };

        if (splitMode === 'ranges' && ranges) {
          processParams.ranges = ranges;
        } else if (splitMode === 'fixed_range' && fixedRange) {
          processParams.fixed_range = fixedRange;
        } else if (splitMode === 'remove_pages' && ranges) {
          processParams.remove_pages = ranges;
        }

        // Execute split task
        const result = await executeTask('split', [file], processParams);

        // Generate output filename (will be a zip if multiple files)
        const extension = mergeAfter ? 'pdf' : 'zip';
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'split', extension);

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Successfully split PDF using ${splitMode} mode`,
                outputPath: savedPath,
                details: {
                  splitMode,
                  mergeAfter,
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
