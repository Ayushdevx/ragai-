// Browser-Compatible PDF Text Extractor
// Alternative PDF processing that works reliably in browsers

class BrowserPDFProcessor {
  constructor() {
    this.pdfLib = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Use a more reliable CDN for PDF.js
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = () => {
          if (window.pdfjsLib) {
            this.pdfLib = window.pdfjsLib;
            this.pdfLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            this.initialized = true;
            resolve();
          } else {
            reject(new Error('PDF.js failed to load'));
          }
        };
        script.onerror = () => reject(new Error('Failed to load PDF.js'));
      });
      
    } catch (error) {
      console.warn('PDF.js initialization failed:', error);
      this.initialized = false;
    }
  }

  async extractTextFromPDF(file) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.pdfLib) {
        throw new Error('PDF.js not available');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await this.pdfLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map(item => item.str || '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (pageText) {
            fullText += pageText + '\n\n';
          }
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          fullText += `[Page ${pageNum} - Text extraction failed]\n\n`;
        }
      }

      return fullText.trim() || `[PDF processed: ${file.name} - No readable text found]`;
      
    } catch (error) {
      console.error('PDF processing error:', error);
      
      // Return a descriptive placeholder instead of throwing
      return `[PDF File: ${file.name}]
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB
PDF text extraction temporarily unavailable.
Please ensure you have an internet connection and try again.

Error: ${error.message}`;
    }
  }

  isSupported() {
    return typeof window !== 'undefined' && this.initialized;
  }
}

export default BrowserPDFProcessor;
