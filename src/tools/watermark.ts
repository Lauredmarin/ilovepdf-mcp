import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { executeTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
  watermarkModeSchema,
  watermarkTextSchema,
  watermarkImageSchema,
  verticalPositionSchema,
  horizontalPositionSchema,
  transparencySchema,
  watermarkLayerSchema,
  mosaicSchema,
  fontFamilySchema,
  fontStyleSchema,
  fontSizeSchema,
  fontColorSchema,
  pagesSchema,
} from '../utils/schemas.js';
import { z } from 'zod';

export function registerWatermarkTool(server: McpServer): void {
  server.tool(
    'add-watermark',
    'Add a text or image watermark to a PDF document',
    {
      file: fileInputSchema.describe('PDF file path or URL to watermark'),
      mode: watermarkModeSchema,
      text: watermarkTextSchema,
      image: watermarkImageSchema,
      verticalPosition: verticalPositionSchema,
      horizontalPosition: horizontalPositionSchema,
      transparency: transparencySchema,
      layer: watermarkLayerSchema,
      mosaic: mosaicSchema,
      rotation: z.number().min(-180).max(180).optional().default(0).describe('Rotation angle in degrees'),
      fontFamily: fontFamilySchema,
      fontStyle: fontStyleSchema,
      fontSize: fontSizeSchema,
      fontColor: fontColorSchema,
      pages: pagesSchema,
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({
      file, mode, text, image, verticalPosition, horizontalPosition,
      transparency, layer, mosaic, rotation, fontFamily, fontStyle,
      fontSize, fontColor, pages, outputDir, outputFilename
    }) => {
      try {
        // Validate inputs
        if (mode === 'text' && !text) {
          throw new Error('Text is required for text watermark mode');
        }
        if (mode === 'image' && !image) {
          throw new Error('Image is required for image watermark mode');
        }

        // Validate file exists
        await validateFiles([file]);

        // Build process params
        const processParams: Record<string, unknown> = {
          mode,
          vertical_position: verticalPosition,
          horizontal_position: horizontalPosition,
          transparency,
          layer,
          mosaic,
          rotation,
        };

        if (mode === 'text') {
          processParams.text = text;
          processParams.font_family = fontFamily;
          processParams.font_style = fontStyle;
          processParams.font_size = fontSize;
          processParams.font_color = fontColor;
        } else {
          processParams.image = image;
        }

        if (pages) {
          processParams.pages = pages;
        }

        // Execute watermark task
        const result = await executeTask('watermark', [file], processParams);

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'watermarked');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Successfully added ${mode} watermark to PDF`,
                outputPath: savedPath,
                details: {
                  mode,
                  text: mode === 'text' ? text : undefined,
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
