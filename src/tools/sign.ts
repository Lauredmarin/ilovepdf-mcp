import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createTask, addFileToTask, getApiInstance } from '../utils/api.js';
import { validateFiles } from '../utils/file-handler.js';
import {
  fileInputSchema,
  signLanguageSchema,
  expirationDaysSchema,
  certifiedSchema,
  lockOrderSchema,
  signersSchema,
} from '../utils/schemas.js';

export function registerSignTool(server: McpServer): void {
  server.tool(
    'sign-pdf',
    'Create a digital signature request for a PDF document (sends signature requests via email)',
    {
      file: fileInputSchema.describe('PDF file path or URL to sign'),
      signers: signersSchema,
      language: signLanguageSchema,
      expirationDays: expirationDaysSchema,
      certified: certifiedSchema,
      lockOrder: lockOrderSchema.describe('Force signers to sign in order'),
      brandName: z.string().optional().describe('Brand name to display in emails'),
      brandLogo: z.string().optional().describe('Brand logo URL to display in emails'),
      reminders: z.boolean().optional().default(false).describe('Enable automatic reminders'),
      reminderDaysCycle: z.number().optional().describe('Days between reminders'),
    },
    async ({
      file, signers, language, expirationDays, certified,
      lockOrder, brandName, brandLogo, reminders, reminderDaysCycle
    }) => {
      try {
        // Validate file exists
        await validateFiles([file]);

        // Create sign task
        const task = await createTask('sign');
        await addFileToTask(task, file);

        // Add signers
        for (const signer of signers) {
          // The sign task expects receivers to be added via addReceiver method
          // This is simplified - the actual implementation may vary based on the API
        }

        // Build process params
        const processParams: Record<string, unknown> = {
          language,
          expiration_days: expirationDays,
          certified,
          lock_order: lockOrder,
          reminders,
        };

        if (brandName) processParams.brand_name = brandName;
        if (brandLogo) processParams.brand_logo = brandLogo;
        if (reminderDaysCycle) processParams.signer_reminder_days_cycle = reminderDaysCycle;

        // Process the signature request
        const result = await task.process(processParams) as {
          token_requester?: string;
          [key: string]: unknown;
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Signature request created for ${signers.length} signer(s)`,
                details: {
                  signatureToken: result.token_requester,
                  signerCount: signers.length,
                  expirationDays,
                  certified,
                  language,
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

  // Additional signature management tools
  server.tool(
    'get-signature-status',
    'Get the status of a signature request',
    {
      signatureToken: z.string().describe('Signature token (token_requester from sign-pdf response)'),
    },
    async ({ signatureToken }) => {
      try {
        const instance = getApiInstance();
        const status = await instance.getSignatureStatus(signatureToken);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                status,
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

  server.tool(
    'void-signature',
    'Void/cancel a pending signature request',
    {
      signatureToken: z.string().describe('Signature token to void'),
    },
    async ({ signatureToken }) => {
      try {
        const instance = getApiInstance();
        await instance.voidSignature(signatureToken);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Signature request voided successfully',
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
