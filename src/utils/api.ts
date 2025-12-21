import ILovePDFApiModule from '@ilovepdf/ilovepdf-nodejs';
import ILovePDFFileModule from '@ilovepdf/ilovepdf-nodejs/ILovePDFFile.js';
import type { ILovePDFTool, ChainOperation } from '../types/index.js';

// Handle ESM/CommonJS interop
const ILovePDFApi = ILovePDFApiModule as unknown as new (publicKey: string, secretKey: string) => ILovePDFApiInstance;
const ILovePDFFile = ILovePDFFileModule as unknown as new (path: string) => ILovePDFFileInstance;

// Type definitions for the API
interface ILovePDFFileInstance {
  // File instance properties
}

interface ILovePDFApiInstance {
  newTask: (taskType: ILovePDFTool) => TaskInstance;
  listTasks: (params?: { page?: number; tool?: string; status?: string }) => Promise<TaskInstance[]>;
  getSignatureStatus: (signatureToken: string) => Promise<unknown>;
  getSignatureList: (page: number, pageLimit: number) => Promise<unknown[]>;
  voidSignature: (signatureToken: string) => Promise<void>;
  increaseSignatureExpirationDays: (signatureToken: string, daysAmount: number) => Promise<void>;
  sendReminders: (signatureToken: string) => Promise<void>;
  downloadOriginalFiles: (signatureToken: string) => Promise<Uint8Array>;
  downloadSignedFiles: (signatureToken: string) => Promise<Uint8Array>;
  downloadAuditFiles: (signatureToken: string) => Promise<Uint8Array>;
  getReceiverInfo: (receiverTokenRequester: string) => Promise<unknown>;
  fixReceiverEmail: (receiverTokenRequester: string, email: string) => Promise<void>;
  fixReceiverPhone: (receiverTokenRequester: string, phone: string) => Promise<void>;
}

interface TaskInstance {
  id: string;
  type: ILovePDFTool;
  remainingFiles?: number;
  start: () => Promise<string>;
  addFile: (file: string | ILovePDFFileInstance, params?: { password?: string; rotate?: number }) => Promise<unknown>;
  deleteFile: (file: unknown) => Promise<void>;
  process: (params?: Record<string, unknown>) => Promise<unknown>;
  download: () => Promise<Uint8Array>;
  delete: () => Promise<void>;
  connect: (nextTool: ILovePDFTool) => Promise<TaskInstance>;
}

let apiInstance: ILovePDFApiInstance | null = null;

/**
 * Get or create the iLovePDF API instance
 */
export function getApiInstance(): ILovePDFApiInstance {
  if (!apiInstance) {
    const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const secretKey = process.env.ILOVEPDF_SECRET_KEY;

    if (!publicKey || !secretKey) {
      throw new Error(
        'Missing iLovePDF API credentials. Please set ILOVEPDF_PUBLIC_KEY and ILOVEPDF_SECRET_KEY environment variables.'
      );
    }

    apiInstance = new ILovePDFApi(publicKey, secretKey);
  }

  return apiInstance;
}

/**
 * Create a new task for a specific tool
 */
export async function createTask(toolType: ILovePDFTool): Promise<TaskInstance> {
  const instance = getApiInstance();
  const task = instance.newTask(toolType);
  await task.start();
  return task;
}

/**
 * Add a file to a task (supports both URLs and local paths)
 */
export async function addFileToTask(
  task: TaskInstance,
  filePathOrUrl: string,
  options?: { password?: string; rotate?: number }
): Promise<unknown> {
  const isUrl = filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://');

  if (isUrl) {
    return await task.addFile(filePathOrUrl, options);
  } else {
    const file = new ILovePDFFile(filePathOrUrl);
    return await task.addFile(file, options);
  }
}

/**
 * Execute a single PDF operation
 */
export async function executeTask(
  toolType: ILovePDFTool,
  files: string[],
  processParams?: Record<string, unknown>,
  fileOptions?: { password?: string; rotate?: number }[]
): Promise<Uint8Array> {
  const task = await createTask(toolType);

  // Add all files
  for (let i = 0; i < files.length; i++) {
    const options = fileOptions?.[i];
    await addFileToTask(task, files[i], options);
  }

  // Process the task
  await task.process(processParams);

  // Download and return the result
  return await task.download();
}

/**
 * Chain multiple operations together
 */
export async function chainOperations(
  initialFile: string,
  operations: ChainOperation[]
): Promise<Uint8Array> {
  if (operations.length === 0) {
    throw new Error('At least one operation is required');
  }

  // Start with the first operation
  let task = await createTask(operations[0].type);
  await addFileToTask(task, initialFile);
  await task.process(operations[0].params);

  // Chain subsequent operations
  for (let i = 1; i < operations.length; i++) {
    task = await task.connect(operations[i].type);
    await task.process(operations[i].params);
  }

  // Download the final result
  return await task.download();
}

/**
 * Get remaining API file quota
 */
export async function getRemainingFiles(): Promise<number | undefined> {
  const instance = getApiInstance();
  const task = instance.newTask('merge'); // Use any task type to check quota
  await task.start();
  return task.remainingFiles;
}

/**
 * List recent tasks
 */
export async function listTasks(params?: {
  page?: number;
  tool?: string;
  status?: string;
}) {
  const instance = getApiInstance();
  return await instance.listTasks(params);
}
