import * as fs from 'fs/promises';
import * as path from 'path';
import type { FileInput, TaskResult } from '../types/index.js';

/**
 * Resolve file input - determine if it's a URL or local path
 */
export function resolveFileInput(input: string): FileInput {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return { type: 'url', value: input };
  }
  return { type: 'path', value: path.resolve(input) };
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Get the default output directory
 */
export function getDefaultOutputDir(): string {
  return process.env.DEFAULT_OUTPUT_DIR || './output';
}

/**
 * Generate an output filename based on the operation
 */
export function generateOutputFilename(
  originalFilename: string,
  operation: string,
  extension: string = 'pdf'
): string {
  const baseName = path.basename(originalFilename, path.extname(originalFilename));
  const timestamp = Date.now();
  return `${baseName}_${operation}_${timestamp}.${extension}`;
}

/**
 * Save output data to a file
 */
export async function saveOutput(
  data: Uint8Array,
  outputDir?: string,
  filename?: string
): Promise<string> {
  const dir = outputDir || getDefaultOutputDir();
  await ensureDirectory(dir);

  const outputFilename = filename || `output_${Date.now()}.pdf`;
  const outputPath = path.join(dir, outputFilename);

  await fs.writeFile(outputPath, data);
  return path.resolve(outputPath);
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Create a success result
 */
export function createSuccessResult(
  message: string,
  outputPath?: string,
  details?: TaskResult['details']
): TaskResult {
  return {
    success: true,
    message,
    outputPath,
    details,
  };
}

/**
 * Create an error result
 */
export function createErrorResult(error: string): TaskResult {
  return {
    success: false,
    message: 'Operation failed',
    error,
  };
}

/**
 * Extract filename from a URL or path
 */
export function extractFilename(filePathOrUrl: string): string {
  if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
    const url = new URL(filePathOrUrl);
    return path.basename(url.pathname) || 'downloaded_file';
  }
  return path.basename(filePathOrUrl);
}

/**
 * Validate that all files exist (for local paths)
 */
export async function validateFiles(files: string[]): Promise<void> {
  for (const file of files) {
    const input = resolveFileInput(file);
    if (input.type === 'path') {
      const exists = await fileExists(input.value);
      if (!exists) {
        throw new Error(`File not found: ${file}`);
      }
    }
  }
}
