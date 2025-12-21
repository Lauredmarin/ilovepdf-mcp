// iLovePDF tool types
export type ILovePDFTool =
  | 'compress'
  | 'extract'
  | 'htmlpdf'
  | 'imagepdf'
  | 'merge'
  | 'officepdf'
  | 'pagenumber'
  | 'pdfa'
  | 'pdfjpg'
  | 'protect'
  | 'repair'
  | 'rotate'
  | 'split'
  | 'unlock'
  | 'validatepdfa'
  | 'watermark'
  | 'sign'
  | 'editpdf'
  | 'pdfocr';

// File input types
export interface FileInput {
  type: 'url' | 'path';
  value: string;
}

// Common process parameters
export interface CommonProcessParams {
  metas?: {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
    Trapped?: string;
  };
  ignore_errors?: boolean;
  ignore_password?: boolean;
  output_filename?: string;
  packaged_filename?: string;
  file_encryption_key?: string;
  try_pdf_repair?: boolean;
  webhook?: string;
}

// Compression levels
export type CompressionLevel = 'low' | 'recommended' | 'extreme';

// Split modes
export type SplitMode = 'ranges' | 'fixed_range' | 'remove_pages';

// PDF/A conformance levels
export type PdfaConformance =
  | 'pdfa-1b'
  | 'pdfa-1a'
  | 'pdfa-2b'
  | 'pdfa-2u'
  | 'pdfa-2a'
  | 'pdfa-3b'
  | 'pdfa-3u'
  | 'pdfa-3a';

// Page positions
export type VerticalPosition = 'bottom' | 'top' | 'middle';
export type HorizontalPosition = 'left' | 'center' | 'right';

// Font families
export type FontFamily =
  | 'Arial'
  | 'Arial Unicode MS'
  | 'Verdana'
  | 'Courier'
  | 'Times New Roman'
  | 'Comic Sans MS'
  | 'WenQuanYi Zen Hei'
  | 'Lohit Marathi';

// Font styles
export type FontStyle = 'null' | 'Bold' | 'Italic';

// Page sizes
export type PageSize = 'A3' | 'A4' | 'A5' | 'A6' | 'Letter';
export type ImagePdfPageSize = 'fit' | 'A4' | 'letter';

// Orientations
export type Orientation = 'portrait' | 'landscape';

// Watermark modes
export type WatermarkMode = 'text' | 'image';

// Watermark layer
export type WatermarkLayer = 'above' | 'below';

// PDF to JPG modes
export type PdfJpgMode = 'pages' | 'extract';

// OCR Languages (subset of common ones)
export type OcrLanguage =
  | 'eng'
  | 'spa'
  | 'fra'
  | 'deu'
  | 'ita'
  | 'por'
  | 'nld'
  | 'pol'
  | 'rus'
  | 'jpn'
  | 'chi_sim'
  | 'chi_tra'
  | 'kor'
  | 'ara'
  | 'hin';

// Sign languages
export type SignLanguage =
  | 'en-US'
  | 'es'
  | 'fr'
  | 'it'
  | 'de'
  | 'pt'
  | 'ja'
  | 'ko'
  | 'zh-cn'
  | 'zh-tw'
  | 'ru'
  | 'ar'
  | 'nl'
  | 'pl'
  | 'sv'
  | 'tr';

// Task result types
export interface TaskResult {
  success: boolean;
  outputPath?: string;
  outputPaths?: string[];
  message: string;
  error?: string;
  details?: {
    originalSize?: number;
    outputSize?: number;
    pageCount?: number;
    [key: string]: unknown;
  };
}

// Operation for chaining
export interface ChainOperation {
  type: ILovePDFTool;
  params?: Record<string, unknown>;
}

// Signer for digital signatures
export interface Signer {
  name: string;
  email: string;
  phone?: string;
  type?: 'signer' | 'validator' | 'witness';
}
