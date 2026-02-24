/**
 * Document Parser Utility
 * Extracts text content from various document formats (PDF, DOCX, PPTX, TXT, MD)
 */

import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParsedDocument {
  text: string;
  pageCount?: number;
  title?: string;
  metadata?: Record<string, string>;
}

export interface DocumentParseResult {
  success: boolean;
  document?: ParsedDocument;
  error?: string;
}

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<DocumentParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    const pageCount = pdf.numPages;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += `${pageText}\n\n`;
    }

    // Try to extract title from metadata or first line
    const metadata = await pdf.getMetadata().catch(() => null);
    const title =
      (metadata?.info as any)?.Title ||
      file.name.replace(/\.pdf$/i, "") ||
      fullText.split("\n")[0]?.substring(0, 100);

    return {
      success: true,
      document: {
        text: fullText.trim(),
        pageCount,
        title,
        metadata: metadata?.info as Record<string, string>,
      },
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse PDF",
    };
  }
}

/**
 * Extract text from a plain text file (TXT, MD)
 */
export async function extractTextFromTextFile(file: File): Promise<DocumentParseResult> {
  try {
    const text = await file.text();
    const title = file.name.replace(/\.(txt|md|markdown)$/i, "");

    return {
      success: true,
      document: {
        text,
        title,
      },
    };
  } catch (error) {
    console.error("Error reading text file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to read text file",
    };
  }
}

/**
 * Extract text from a DOCX file (basic implementation)
 * Note: Full DOCX parsing requires a library like mammoth.js
 * This is a simplified version that extracts raw text
 */
export async function extractTextFromDOCX(file: File): Promise<DocumentParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(arrayBuffer);

    const documentXml = await zip.file("word/document.xml")?.async("text");
    if (!documentXml) {
      return {
        success: false,
        error: "Invalid DOCX file - no document.xml found",
      };
    }

    // Simple XML text extraction (strips all tags)
    const text = documentXml
      .replace(/<w:p[^>]*>/g, "\n") // Paragraph breaks
      .replace(/<[^>]+>/g, "") // Remove all XML tags
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();

    return {
      success: true,
      document: {
        text,
        title: file.name.replace(/\.docx?$/i, ""),
      },
    };
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse DOCX",
    };
  }
}

/**
 * Extract text from a PPTX file (basic implementation)
 */
export async function extractTextFromPPTX(file: File): Promise<DocumentParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(arrayBuffer);

    let fullText = "";
    let slideCount = 0;

    // Iterate through slide files
    const slideFiles = Object.keys(zip.files).filter((name) =>
      name.match(/ppt\/slides\/slide\d+\.xml$/),
    );

    slideCount = slideFiles.length;

    for (const slidePath of slideFiles.sort()) {
      const slideXml = await zip.file(slidePath)?.async("text");
      if (slideXml) {
        // Extract text from slide XML
        const slideText = slideXml
          .replace(/<a:p[^>]*>/g, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/\s+/g, " ")
          .trim();

        if (slideText) {
          fullText += `--- Slide ${slideFiles.indexOf(slidePath) + 1} ---\n${slideText}\n\n`;
        }
      }
    }

    return {
      success: true,
      document: {
        text: fullText.trim(),
        pageCount: slideCount,
        title: file.name.replace(/\.pptx?$/i, ""),
      },
    };
  } catch (error) {
    console.error("Error parsing PPTX:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse PPTX",
    };
  }
}

/**
 * Parse any supported document type
 */
export async function parseDocument(file: File): Promise<DocumentParseResult> {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  if (fileName.endsWith(".pdf") || fileType === "application/pdf") {
    return extractTextFromPDF(file);
  }

  if (
    fileName.endsWith(".txt") ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown") ||
    fileType.startsWith("text/")
  ) {
    return extractTextFromTextFile(file);
  }

  if (
    fileName.endsWith(".docx") ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractTextFromDOCX(file);
  }

  if (
    fileName.endsWith(".pptx") ||
    fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return extractTextFromPPTX(file);
  }

  return {
    success: false,
    error: `Unsupported file type: ${file.type || fileName}`,
  };
}

/**
 * Parse multiple documents and combine their content
 */
export async function parseDocuments(files: File[]): Promise<{
  success: boolean;
  combinedText: string;
  documents: ParsedDocument[];
  errors: string[];
}> {
  const documents: ParsedDocument[] = [];
  const errors: string[] = [];
  let combinedText = "";

  for (const file of files) {
    const result = await parseDocument(file);
    if (result.success && result.document) {
      documents.push(result.document);
      combinedText += `\n\n--- ${result.document.title || file.name} ---\n${result.document.text}`;
    } else if (result.error) {
      errors.push(`${file.name}: ${result.error}`);
    }
  }

  return {
    success: documents.length > 0,
    combinedText: combinedText.trim(),
    documents,
    errors,
  };
}

export const documentParser = {
  parseDocument,
  parseDocuments,
  extractTextFromPDF,
  extractTextFromTextFile,
  extractTextFromDOCX,
  extractTextFromPPTX,
};
