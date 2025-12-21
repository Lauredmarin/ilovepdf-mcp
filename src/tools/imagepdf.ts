import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  filesInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  orientationSchema,
  imagePdfPageSizeSchema,
  marginSchema,
  mergeAfterSchema,
} from '../utils/schemas.js';

export function registerImageToPdfTool(server: McpServer): void {
  server.tool(
    'images-to-pdf',
    'Convert images (JPG, PNG, etc.) to a PDF document',
    {
      files: filesInputSchema.describe('Array of image file paths or URLs to convert'),
      orientation: orientationSchema,
      pagesize: imagePdfPageSizeSchema,
      margin: marginSchema,
      mergeAfter: mergeAfterSchema.describe('Merge all images into a single PDF (default: false)'),
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ files, orientation, pagesize, margin, mergeAfter, outputDir, outputFilename }) => {
      try {
        // Validate files exist
        await validateFiles(files);

        // Execute image to pdf task
        const result = await executeTask('imagepdf', files, {
          orientation,
          pagesize,
          margin,
          merge_after: mergeAfter,
        });

        // Generate output filename
        const extension = mergeAfter || files.length === 1 ? 'pdf' : 'zip';
        const filename = outputFilename || generateOutputFilename(extractFilename(files[0]), 'converted', extension);

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Successfully converted ${files.length} image(s) to PDF`,
                outputPath: savedPath,
                details: {
                  imageCount: files.length,
                  orientation,
                  pagesize,
                  merged: mergeAfter,
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
