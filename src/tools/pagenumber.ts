import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  startingNumberSchema,
  pageNumberTextSchema,
  facingPagesSchema,
  firstCoverSchema,
  fontFamilySchema,
  fontStyleSchema,
  fontSizeSchema,
  fontColorSchema,
  pagesSchema,
} from '../utils/schemas.js';

export function registerPageNumberTool(server: McpServer): void {
  server.tool(
    'add-page-numbers',
    'Add page numbers to a PDF document',
    {
      file: fileInputSchema.describe('PDF file path or URL to add page numbers to'),
      verticalPosition: z.enum(['bottom', 'top']).optional().default('bottom').describe('Vertical position'),
      horizontalPosition: z.enum(['left', 'center', 'right']).optional().default('center').describe('Horizontal position'),
      startingNumber: startingNumberSchema,
      text: pageNumberTextSchema,
      facingPages: facingPagesSchema,
      firstCover: firstCoverSchema,
      fontFamily: fontFamilySchema,
      fontStyle: fontStyleSchema,
      fontSize: fontSizeSchema,
      fontColor: fontColorSchema,
      pages: pagesSchema,
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({
      file, verticalPosition, horizontalPosition, startingNumber,
      text, facingPages, firstCover, fontFamily, fontStyle,
      fontSize, fontColor, pages, outputDir, outputFilename
    }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Build process params
        const processParams: Record<string, unknown> = {
          vertical_position: verticalPosition,
          horizontal_position: horizontalPosition,
          starting_number: startingNumber,
          text,
          facing_pages: facingPages,
          first_cover: firstCover,
          font_family: fontFamily,
          font_style: fontStyle,
          font_size: fontSize,
          font_color: fontColor,
        };

        if (pages) {
          processParams.pages = pages;
        }

        // Execute page number task
        const result = await executeTask('pagenumber', [file], processParams);

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'numbered');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Successfully added page numbers to PDF',
                outputPath: savedPath,
                details: {
                  startingNumber,
                  position: `${verticalPosition}-${horizontalPosition}`,
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
