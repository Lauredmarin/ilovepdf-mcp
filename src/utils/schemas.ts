import { z } from 'zod';

// Common schemas
export const fileInputSchema = z.string().describe('File path or URL');
export const filesInputSchema = z.array(z.string()).min(1).describe('Array of file paths or URLs');
export const outputDirSchema = z.string().optional().describe('Output directory path');
export const outputFilenameSchema = z.string().optional().describe('Custom output filename');

// Compression
export const compressionLevelSchema = z
  .enum(['low', 'recommended', 'extreme'])
  .optional()
  .default('recommended')
  .describe('Compression level: low (less compression, better quality), recommended (balanced), extreme (maximum compression)');

// Split
export const splitModeSchema = z
  .enum(['ranges', 'fixed_range', 'remove_pages'])
  .describe('Split mode: ranges (custom page ranges), fixed_range (split every N pages), remove_pages (remove specific pages)');

export const rangesSchema = z
  .string()
  .optional()
  .describe('Page ranges for split (e.g., "1-3,4-6,7-10") or pages to remove');

export const fixedRangeSchema = z
  .number()
  .optional()
  .describe('Number of pages per split when using fixed_range mode');

export const mergeAfterSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe('Merge all split files into a single PDF');

// Rotation
export const rotationSchema = z
  .number()
  .refine((val) => [0, 90, 180, 270].includes(val), {
    message: 'Rotation must be 0, 90, 180, or 270 degrees',
  })
  .describe('Rotation angle in degrees (0, 90, 180, or 270)');

// PDF/A
export const pdfaConformanceSchema = z
  .enum(['pdfa-1b', 'pdfa-1a', 'pdfa-2b', 'pdfa-2u', 'pdfa-2a', 'pdfa-3b', 'pdfa-3u', 'pdfa-3a'])
  .optional()
  .default('pdfa-2b')
  .describe('PDF/A conformance level');

// Position schemas
export const verticalPositionSchema = z
  .enum(['bottom', 'top', 'middle'])
  .optional()
  .default('bottom')
  .describe('Vertical position');

export const horizontalPositionSchema = z
  .enum(['left', 'center', 'right'])
  .optional()
  .default('center')
  .describe('Horizontal position');

// Font schemas
export const fontFamilySchema = z
  .enum([
    'Arial',
    'Arial Unicode MS',
    'Verdana',
    'Courier',
    'Times New Roman',
    'Comic Sans MS',
    'WenQuanYi Zen Hei',
    'Lohit Marathi',
  ])
  .optional()
  .default('Arial')
  .describe('Font family');

export const fontStyleSchema = z
  .enum(['null', 'Bold', 'Italic'])
  .optional()
  .describe('Font style');

export const fontSizeSchema = z
  .number()
  .min(1)
  .max(120)
  .optional()
  .default(14)
  .describe('Font size in points');

export const fontColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/)
  .optional()
  .default('#000000')
  .describe('Font color in hex format (e.g., #FF0000)');

// Watermark schemas
export const watermarkModeSchema = z
  .enum(['text', 'image'])
  .describe('Watermark mode: text or image');

export const watermarkTextSchema = z
  .string()
  .optional()
  .describe('Watermark text (required for text mode)');

export const watermarkImageSchema = z
  .string()
  .optional()
  .describe('Watermark image URL or path (required for image mode)');

export const transparencySchema = z
  .number()
  .min(0)
  .max(100)
  .optional()
  .default(50)
  .describe('Transparency percentage (0-100)');

export const watermarkLayerSchema = z
  .enum(['above', 'below'])
  .optional()
  .default('above')
  .describe('Watermark layer position');

export const mosaicSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe('Enable mosaic mode (repeat watermark across page)');

// Page number schemas
export const startingNumberSchema = z
  .number()
  .min(1)
  .optional()
  .default(1)
  .describe('Starting page number');

export const pageNumberTextSchema = z
  .string()
  .optional()
  .default('{n}')
  .describe('Page number format (use {n} for page number, {p} for total pages)');

export const facingPagesSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe('Enable facing pages mode');

export const firstCoverSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe('Skip numbering on first page (cover)');

// PDF to JPG schemas
export const pdfJpgModeSchema = z
  .enum(['pages', 'extract'])
  .optional()
  .default('pages')
  .describe('Conversion mode: pages (one image per page) or extract (extract embedded images)');

export const dpiSchema = z
  .number()
  .min(72)
  .max(300)
  .optional()
  .default(150)
  .describe('Image DPI (72-300)');

// Image to PDF schemas
export const orientationSchema = z
  .enum(['portrait', 'landscape'])
  .optional()
  .default('portrait')
  .describe('Page orientation');

export const pageSizeSchema = z
  .enum(['A3', 'A4', 'A5', 'A6', 'Letter'])
  .optional()
  .default('A4')
  .describe('Page size');

export const imagePdfPageSizeSchema = z
  .enum(['fit', 'A4', 'letter'])
  .optional()
  .default('fit')
  .describe('Page size for image to PDF conversion');

export const marginSchema = z
  .number()
  .min(0)
  .optional()
  .default(0)
  .describe('Page margin in pixels');

// HTML to PDF schemas
export const viewWidthSchema = z
  .number()
  .optional()
  .default(1024)
  .describe('Viewport width in pixels');

export const viewHeightSchema = z
  .number()
  .optional()
  .describe('Viewport height in pixels');

export const navigationTimeoutSchema = z
  .number()
  .optional()
  .default(30000)
  .describe('Navigation timeout in milliseconds');

export const delaySchema = z
  .number()
  .optional()
  .default(0)
  .describe('Delay before capture in milliseconds');

export const removePopupsSchema = z
  .boolean()
  .optional()
  .default(true)
  .describe('Remove popups and overlays');

export const singlePageSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe('Render as single continuous page');

// Extract text schemas
export const detailedSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe('Include detailed extraction with position info');

export const byWordSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe('Extract text word by word');

// OCR schemas
export const ocrLanguagesSchema = z
  .array(
    z.enum([
      'eng', 'spa', 'fra', 'deu', 'ita', 'por', 'nld', 'pol', 'rus',
      'jpn', 'chi_sim', 'chi_tra', 'kor', 'ara', 'hin',
    ])
  )
  .min(1)
  .default(['eng'])
  .describe('OCR languages (ISO 639-3 codes)');

// Password schemas
export const passwordSchema = z
  .string()
  .min(1)
  .describe('Password for the PDF');

export const filePasswordSchema = z
  .string()
  .optional()
  .describe('Password to open a protected PDF file');

// Sign schemas
export const signLanguageSchema = z
  .enum([
    'en-US', 'es', 'fr', 'it', 'de', 'pt', 'ja', 'ko',
    'zh-cn', 'zh-tw', 'ru', 'ar', 'nl', 'pl', 'sv', 'tr',
  ])
  .optional()
  .default('en-US')
  .describe('Email language for signers');

export const expirationDaysSchema = z
  .number()
  .min(1)
  .max(130)
  .optional()
  .default(7)
  .describe('Days until signature request expires');

export const certifiedSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe('Use certified signature (eIDAS, ESIGN & UETA compliant)');

export const lockOrderSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe('Force sequential signing order');

export const signerSchema = z.object({
  name: z.string().describe('Signer name'),
  email: z.string().email().describe('Signer email'),
  phone: z.string().optional().describe('Signer phone number'),
  type: z.enum(['signer', 'validator', 'witness']).optional().default('signer').describe('Signer type'),
});

export const signersSchema = z
  .array(signerSchema)
  .min(1)
  .describe('List of signers');

// Pages schema (for selective operations)
export const pagesSchema = z
  .string()
  .optional()
  .describe('Page selection (e.g., "1-3,5,7-10" or "all")');

// Chain operations schema
export const chainOperationSchema = z.object({
  type: z.enum([
    'compress', 'extract', 'htmlpdf', 'imagepdf', 'merge', 'officepdf',
    'pagenumber', 'pdfa', 'pdfjpg', 'protect', 'repair', 'rotate',
    'split', 'unlock', 'validatepdfa', 'watermark', 'editpdf', 'pdfocr',
  ]).describe('Operation type'),
  params: z.record(z.unknown()).optional().describe('Operation parameters'),
});

export const chainOperationsSchema = z
  .array(chainOperationSchema)
  .min(1)
  .describe('List of operations to chain');
