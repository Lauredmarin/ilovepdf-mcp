import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename, getFileSize, formatFileSize, resolveFileInput } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  compressionLevelSchema,
} from '../utils/schemas.js';

export function registerCompressTool(server: McpServer): void {
  server.tool(
    'compress-pdf',
    'Reduce the file size of a PDF document while maintaining quality',
    {
      file: fileInputSchema.describe('PDF file path or URL to compress'),
      compressionLevel: compressionLevelSchema,
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, compressionLevel, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Get original file size if it's a local file
        let originalSize: number | undefined;
        const fileInput = resolveFileInput(file);
        if (fileInput.type === 'path') {
          originalSize = await getFileSize(fileInput.value);
        }

        // Execute compress task
        const result = await executeTask('compress', [file], {
          compression_level: compressionLevel,
        });

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'compressed');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        // Get output file size
        const outputSize = await getFileSize(savedPath);

        // Calculate compression ratio
        const compressionRatio = originalSize
          ? ((1 - outputSize / originalSize) * 100).toFixed(1)
          : undefined;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Successfully compressed PDF${compressionRatio ? ` (${compressionRatio}% reduction)` : ''}`,
                outputPath: savedPath,
                details: {
                  compressionLevel,
                  originalSize: originalSize ? formatFileSize(originalSize) : undefined,
                  outputSize: formatFileSize(outputSize),
                  compressionRatio: compressionRatio ? `${compressionRatio}%` : undefined,
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
