# iLovePDF MCP Server

An MCP (Model Context Protocol) server that exposes [iLovePDF](https://www.ilovepdf.com/) API operations as tools for LLM clients like Claude. Process PDFs directly from your AI conversations - merge, split, compress, convert, and more.

## Features

- **22 PDF tools** covering all major PDF operations
- **Supports both local files and URLs** as input
- **Customizable output** with user-specified directories and filenames
- **Operation chaining** for complex workflows
- **Full TypeScript support** with type definitions

## Available Tools

### Core Operations
| Tool | Description |
|------|-------------|
| `merge-pdfs` | Merge multiple PDF files into one |
| `split-pdf` | Split PDF by page ranges, fixed intervals, or remove pages |
| `compress-pdf` | Reduce PDF file size (low/recommended/extreme) |
| `rotate-pdf` | Rotate pages by 90, 180, or 270 degrees |
| `protect-pdf` | Add password protection |
| `unlock-pdf` | Remove password protection |
| `repair-pdf` | Repair damaged PDFs |

### Conversion Operations
| Tool | Description |
|------|-------------|
| `pdf-to-jpg` | Convert PDF pages to JPG images |
| `images-to-pdf` | Convert images to PDF |
| `html-to-pdf` | Convert webpages to PDF |
| `office-to-pdf` | Convert Word, Excel, PowerPoint to PDF |
| `convert-to-pdfa` | Convert to PDF/A archive format |
| `validate-pdfa` | Validate PDF/A compliance |

### Enhancement Operations
| Tool | Description |
|------|-------------|
| `add-watermark` | Add text or image watermarks |
| `add-page-numbers` | Add page numbers with custom formatting |
| `extract-text` | Extract text content from PDF |
| `ocr-pdf` | OCR scanned PDFs (100+ languages) |
| `edit-pdf` | Add text or images to specific positions |

### Signature Operations
| Tool | Description |
|------|-------------|
| `sign-pdf` | Create digital signature requests |
| `get-signature-status` | Check signature request status |
| `void-signature` | Cancel pending signature requests |

### Utility Operations
| Tool | Description |
|------|-------------|
| `chain-operations` | Chain multiple operations together |
| `list-tasks` | List recent API tasks |
| `get-remaining-files` | Check API quota |

## Installation

### Prerequisites

- Node.js 18 or higher
- iLovePDF API credentials (get them at [developer.ilovepdf.com](https://developer.ilovepdf.com))

### Install from npm

```bash
npm install -g ilovepdf-mcp
```

### Install from source

```bash
git clone https://github.com/yourusername/ilovepdf-mcp.git
cd ilovepdf-mcp
npm install
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
ILOVEPDF_PUBLIC_KEY=your_public_key_here
ILOVEPDF_SECRET_KEY=your_secret_key_here
DEFAULT_OUTPUT_DIR=./output
```

Or set environment variables directly in your shell.

### Claude Desktop Integration

Add to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

**Option 1: Using .env file (recommended)**

If you've set up your `.env` file with API keys, you only need:

```json
{
  "mcpServers": {
    "ilovepdf": {
      "command": "node",
      "args": ["/path/to/ilovepdf-mcp/dist/index.js"]
    }
  }
}
```

**Option 2: Keys in config only**

If you prefer not to use a `.env` file:

```json
{
  "mcpServers": {
    "ilovepdf": {
      "command": "node",
      "args": ["/path/to/ilovepdf-mcp/dist/index.js"],
      "env": {
        "ILOVEPDF_PUBLIC_KEY": "your_public_key",
        "ILOVEPDF_SECRET_KEY": "your_secret_key",
        "DEFAULT_OUTPUT_DIR": "/path/to/output"
      }
    }
  }
}
```

If installed globally via npm:

```json
{
  "mcpServers": {
    "ilovepdf": {
      "command": "ilovepdf-mcp"
    }
  }
}
```

## Usage Examples

Once configured, you can use natural language in Claude to process PDFs:

### Merge PDFs
> "Merge these three PDF files: report1.pdf, report2.pdf, and appendix.pdf"

### Compress PDF
> "Compress my large-document.pdf using extreme compression"

### Convert to Images
> "Convert this PDF to JPG images at 300 DPI"

### Add Watermark
> "Add a 'CONFIDENTIAL' watermark to all pages of contract.pdf"

### Chain Operations
> "Compress then merge these PDFs: file1.pdf, file2.pdf, file3.pdf"

### OCR
> "Make this scanned PDF searchable using English and Spanish OCR"

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Clean build artifacts
npm run clean
```

## API Reference

### Common Parameters

Most tools accept these common parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` / `files` | string / string[] | Input file path(s) or URL(s) |
| `outputDir` | string? | Output directory (default: `./output`) |
| `outputFilename` | string? | Custom output filename |

### Response Format

All tools return a consistent JSON response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "outputPath": "/path/to/output.pdf",
  "details": {
    "originalSize": "5.2 MB",
    "outputSize": "1.3 MB"
  }
}
```

On error:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Troubleshooting

### "Missing iLovePDF API credentials"
Ensure `ILOVEPDF_PUBLIC_KEY` and `ILOVEPDF_SECRET_KEY` are set in your environment or `.env` file.

### "File not found"
- Check the file path is correct and accessible
- For URLs, ensure they are publicly accessible

### "API quota exceeded"
Use `get-remaining-files` to check your quota. Upgrade your iLovePDF plan if needed.

## License

MIT

## Credits

- [iLovePDF](https://www.ilovepdf.com/) for their excellent PDF API
- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
- Built with [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
