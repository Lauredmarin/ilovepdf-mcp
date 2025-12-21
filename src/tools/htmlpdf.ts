import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { executeTask } from '../utils/api.js';
import { saveOutput, generateOutputFilename } from '../utils/file-handler.js';
import {
  outputDirSchema,
  outputFilenameSchema,
  pageSizeSchema,
  orientationSchema,
  marginSchema,
  viewWidthSchema,
  viewHeightSchema,
  navigationTimeoutSchema,
  delaySchema,
  removePopupsSchema,
  singlePageSchema,
} from '../utils/schemas.js';

export function registerHtmlToPdfTool(server: McpServer): void {
  server.tool(
    'html-to-pdf',
    'Convert a webpage URL to a PDF document',
    {
      url: z.string().url().describe('URL of the webpage to convert'),
      pageSize: pageSizeSchema,
      orientation: orientationSchema.describe('Page orientation'),
      margin: marginSchema.describe('Page margin in pixels'),
      viewWidth: viewWidthSchema,
      viewHeight: viewHeightSchema,
      navigationTimeout: navigationTimeoutSchema,
      delay: delaySchema,
      removePopups: removePopupsSchema,
      singlePage: singlePageSchema,
      outputDir: outputDirSchema,
      outputFilename: outputFilenameSchema,
    },
    async ({
      url, pageSize, orientation, margin, viewWidth, viewHeight,
      navigationTimeout, delay, removePopups, singlePage, outputDir, outputFilename
    }) => {
      try {
        // Extract domain for filename
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace(/\./g, '_');

        // Execute HTML to PDF task
        const result = await executeTask('htmlpdf', [url], {
          page_size: pageSize,
          page_orientation: orientation,
          page_margin: margin,
          view_width: viewWidth,
          view_height: viewHeight,
          navigation_timeout: navigationTimeout,
          delay,
          remove_popups: removePopups,
          single_page: singlePage,
        });

        // Generate output filename
        const filename = outputFilename || generateOutputFilename(domain, 'webpage');

        // Save the output
        const savedPath = await saveOutput(result, outputDir, filename);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Successfully converted webpage to PDF',
                outputPath: savedPath,
                details: {
                  url,
                  pageSize,
                  orientation,
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
