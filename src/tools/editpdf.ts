import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createTask, addFileToTask } from '../utils/api.js';
import { saveOutput, validateFiles, generateOutputFilename, extractFilename } from '../utils/file-handler.js';
import {
  fileInputSchema,
  outputDirSchema,
  outputFilenameSchema,
} from '../utils/schemas.js';

// Element schemas for editing
const textElementSchema = z.object({
  type: z.literal('text'),
  text: z.string().describe('Text content to add'),
  coordinates: z.object({
    x: z.number().describe('X position in points from left'),
    y: z.number().describe('Y position in points from bottom'),
  }),
  pages: z.string().optional().default('1').describe('Pages to apply to (e.g., "1" or "1,3,5" or "all")'),
  fontSize: z.number().optional().default(12).describe('Font size in points'),
  fontFamily: z.string().optional().default('Arial').describe('Font family'),
  fontColor: z.string().optional().default('#000000').describe('Font color in hex'),
  bold: z.boolean().optional().default(false).describe('Bold text'),
  italic: z.boolean().optional().default(false).describe('Italic text'),
});

const imageElementSchema = z.object({
  type: z.literal('image'),
  image: z.string().describe('Image file path or URL'),
  coordinates: z.object({
    x: z.number().describe('X position in points from left'),
    y: z.number().describe('Y position in points from bottom'),
  }),
  pages: z.string().optional().default('1').describe('Pages to apply to'),
  width: z.number().optional().describe('Image width in points'),
  height: z.number().optional().describe('Image height in points'),
});

const elementSchema = z.discriminatedUnion('type', [textElementSchema, imageElementSchema]);

export function registerEditTool(server: McpServer): void {
  server.tool(
    'edit-pdf',
    'Add text or images to specific positions in a PDF document',
    {
      file: fileInputSchema.describe('PDF file path or URL to edit'),
      elements: z.array(elementSchema).min(1).describe('Array of text or image elements to add'),
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({ file, elements, outputDir, outputFilename }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Create edit task
        const task = await createTask('editpdf');
        await addFileToTask(task, file);

        // Convert elements to the format expected by the API
        const apiElements = elements.map((element) => {
          if (element.type === 'text') {
            return {
              type: 'text',
              text: element.text,
              coordinates: `${element.coordinates.x} ${element.coordinates.y}`,
              pages: element.pages,
              font_size: element.fontSize,
              font_family: element.fontFamily,
              font_color: element.fontColor,
              bold: element.bold,
              italic: element.italic,
            };
          } else {
            return {
              type: 'image',
              image: element.image,
              coordinates: `${element.coordinates.x} ${element.coordinates.y}`,
              pages: element.pages,
              width: element.width,
              height: element.height,
            };
          }
        });

        // Process with elements
        await task.process({ elements: apiElements });
        const result = await task.download();

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(extractFilename(file), 'edited');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Successfully added ${elements.length} element(s) to PDF`,
                outputPath: savedPath,
                details: {
                  elementCount: elements.length,
                  textElements: elements.filter((e) => e.type === 'text').length,
                  imageElements: elements.filter((e) => e.type === 'image').length,
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
