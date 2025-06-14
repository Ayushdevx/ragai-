// Document Processing Service for RAG (Browser-Compatible)
// Handles PDF, text, images, and DOCX files with text extraction and chunking

import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import MarkdownIt from 'markdown-it';
import BrowserPDFProcessor from './browserPDFProcessor.js';
import { ragConfig } from '../config/ragConfig.js';

class DocumentProcessor {
  constructor() {
    this.md = new MarkdownIt();
    this.supportedTypes = ragConfig.documents.supportedTypes;
    this.chunkingConfig = ragConfig.documents.chunking;
    this.pdfProcessor = new BrowserPDFProcessor();
  }

  /**
   * Process uploaded file and extract text content
   * @param {File} file - The uploaded file
   * @param {string} userId - User ID for metadata
   * @returns {Promise<Object>} Processed document data
   */
  async processDocument(file, userId) {
    try {
      // Validate file type and size
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      console.log(`Processing document: ${file.name} (${file.type})`);

      // Extract text based on file type
      const textContent = await this.extractText(file);
      
      // Generate chunks
      const chunks = this.chunkText(textContent);
      
      // Create document metadata
      const metadata = {
        id: this.generateDocumentId(),
        userId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        textLength: textContent.length,
        chunkCount: chunks.length,
        processingStatus: 'completed'
      };

      return {
        metadata,
        textContent,
        chunks,
        success: true
      };

    } catch (error) {
      console.error('Document processing error:', error);
      return {
        metadata: {
          fileName: file.name,
          processingStatus: 'failed',
          error: error.message
        },
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate file type and size
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  validateFile(file) {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!this.supportedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${fileExtension}. Supported types: ${this.supportedTypes.join(', ')}`
      };
    }

    // Check file size
    const maxSize = this.getMaxFileSize(fileExtension);
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large. Maximum size for ${fileExtension}: ${this.formatBytes(maxSize)}`
      };
    }

    return { isValid: true };
  }

  /**
   * Extract text from different file types
   * @param {File} file - File to process
   * @returns {Promise<string>} Extracted text
   */
  async extractText(file) {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    switch (fileExtension) {
      case '.pdf':
        return await this.extractFromPDF(file);
      
      case '.txt':
        return await this.extractFromText(file);
      
      case '.md':
        return await this.extractFromMarkdown(file);
      
      case '.docx':
        return await this.extractFromDocx(file);
      
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.webp':
        return await this.extractFromImage(file);
      
      default:
        throw new Error(`Text extraction not implemented for ${fileExtension}`);
    }
  }  /**
   * Extract text from PDF files using browser-compatible processor
   * @param {File} file - PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractFromPDF(file) {
    try {
      return await this.pdfProcessor.extractTextFromPDF(file);
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      // Return a descriptive placeholder instead of throwing
      return `[PDF File: ${file.name}]
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB
PDF text extraction is currently unavailable.

You can still upload this file and the AI will be aware of its presence.
For best results, try converting the PDF to text format or copy-paste the content.

Error: ${error.message}`;
    }
  }

  /**
   * Extract text from plain text files
   * @param {File} file - Text file
   * @returns {Promise<string>} File content
   */
  async extractFromText(file) {
    try {
      return await file.text();
    } catch (error) {
      console.error('Text file reading error:', error);
      throw new Error('Failed to read text file');
    }
  }

  /**
   * Extract text from Markdown files
   * @param {File} file - Markdown file
   * @returns {Promise<string>} Extracted text (HTML converted to plain text)
   */
  async extractFromMarkdown(file) {
    try {
      const markdownContent = await file.text();
      const htmlContent = this.md.render(markdownContent);
      // Convert HTML to plain text (simple approach)
      const textContent = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      return textContent;
    } catch (error) {
      console.error('Markdown extraction error:', error);
      throw new Error('Failed to extract text from Markdown');
    }
  }

  /**
   * Extract text from DOCX files
   * @param {File} file - DOCX file
   * @returns {Promise<string>} Extracted text
   */
  async extractFromDocx(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  /**
   * Extract text from images using OCR
   * @param {File} file - Image file
   * @returns {Promise<string>} Extracted text
   */
  async extractFromImage(file) {
    try {
      if (!ragConfig.documents.ocr.enabled) {
        throw new Error('OCR is disabled in configuration');
      }

      console.log('Starting OCR processing...');
      const { data: { text } } = await Tesseract.recognize(
        file,
        ragConfig.documents.ocr.language,
        ragConfig.documents.ocr.tesseractOptions
      );
      
      console.log('OCR completed');
      return text.trim();
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract text from image using OCR');
    }
  }

  /**
   * Split text into chunks for vector embedding
   * @param {string} text - Text to chunk
   * @returns {Array<Object>} Array of text chunks with metadata
   */
  chunkText(text) {
    const { chunkSize, chunkOverlap, separators } = this.chunkingConfig;
    
    if (!text || text.length === 0) {
      return [];
    }

    // Clean and normalize text
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    const chunks = [];
    let currentPosition = 0;
    let chunkIndex = 0;

    while (currentPosition < cleanText.length) {
      let chunkEnd = Math.min(currentPosition + chunkSize, cleanText.length);
      
      // Try to find a natural break point
      if (chunkEnd < cleanText.length) {
        for (const separator of separators) {
          const separatorIndex = cleanText.lastIndexOf(separator, chunkEnd);
          if (separatorIndex > currentPosition) {
            chunkEnd = separatorIndex + separator.length;
            break;
          }
        }
      }

      const chunkText = cleanText.slice(currentPosition, chunkEnd).trim();
      
      if (chunkText.length > 0) {
        chunks.push({
          id: `chunk_${chunkIndex}`,
          text: chunkText,
          startIndex: currentPosition,
          endIndex: chunkEnd,
          length: chunkText.length,
          chunkIndex
        });
        chunkIndex++;
      }

      // Move position with overlap
      currentPosition = Math.max(chunkEnd - chunkOverlap, currentPosition + 1);
    }

    console.log(`Generated ${chunks.length} chunks from ${cleanText.length} characters`);
    return chunks;
  }

  /**
   * Get maximum file size for a file type
   * @param {string} fileExtension - File extension
   * @returns {number} Maximum size in bytes
   */
  getMaxFileSize(fileExtension) {
    const sizeMap = {
      '.pdf': ragConfig.documents.maxFileSize.pdf,
      '.docx': ragConfig.documents.maxFileSize.docx,
      '.png': ragConfig.documents.maxFileSize.image,
      '.jpg': ragConfig.documents.maxFileSize.image,
      '.jpeg': ragConfig.documents.maxFileSize.image,
      '.webp': ragConfig.documents.maxFileSize.image,
      '.txt': ragConfig.documents.maxFileSize.text,
      '.md': ragConfig.documents.maxFileSize.text
    };

    return sizeMap[fileExtension] || ragConfig.documents.maxFileSize.text;
  }

  /**
   * Format bytes to human readable format
   * @param {number} bytes - Bytes to format
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate unique document ID
   * @returns {string} Unique document ID
   */
  generateDocumentId() {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Batch process multiple documents
   * @param {Array<File>} files - Array of files to process
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of processing results
   */
  async batchProcessDocuments(files, userId) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.processDocument(file, userId);
        results.push(result);
      } catch (error) {
        results.push({
          metadata: { fileName: file.name, processingStatus: 'failed' },
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get processing statistics
   * @param {Array} processingResults - Results from document processing
   * @returns {Object} Processing statistics
   */
  getProcessingStats(processingResults) {
    const stats = {
      total: processingResults.length,
      successful: 0,
      failed: 0,
      totalChunks: 0,
      totalTextLength: 0,
      fileTypes: {}
    };

    processingResults.forEach(result => {
      if (result.success) {
        stats.successful++;
        stats.totalChunks += result.chunks?.length || 0;
        stats.totalTextLength += result.textContent?.length || 0;
      } else {
        stats.failed++;
      }

      // Count file types
      const fileType = result.metadata.fileType || 'unknown';
      stats.fileTypes[fileType] = (stats.fileTypes[fileType] || 0) + 1;
    });

    return stats;
  }
}

export default new DocumentProcessor();
