// Enhanced RAG Service integrating Gemini AI with Vector Search
// Maintains Gemini as primary AI while adding RAG capabilities
import { generateText, chatWithHistory } from './geminiService.js';
import documentProcessor from './documentProcessor.js';
import vectorService from './vectorService.js';
import ragConfig from '../config/ragConfig.js';

class RAGService {
  constructor() {
    this.isInitialized = false;
    this.documentStore = new Map(); // Track uploaded documents
    this.sessionContext = new Map(); // Session-specific context
  }

  async initialize() {
    try {
      // Initialize vector database
      await vectorService.initialize();
      this.isInitialized = true;
      console.log('RAG Service initialized successfully');
    } catch (error) {
      console.error('RAG Service initialization failed:', error);
      // Continue without RAG if vector DB fails
      console.warn('RAG features disabled - continuing with basic Gemini AI');
    }
  }

  // Process and store a document for RAG
  async processDocument(file, sessionId = 'default') {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Extract text from document
      const extractedText = await documentProcessor.extractText(file);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content found in the document');
      }

      // Create document chunks
      const chunks = await documentProcessor.createChunks(extractedText, {
        chunkSize: ragConfig.documents.chunkSize,
        overlap: ragConfig.documents.overlap
      });

      // Generate document ID
      const documentId = `${sessionId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Document metadata
      const metadata = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadTime: new Date().toISOString(),
        sessionId,
        chunkCount: chunks.length,
        originalText: extractedText.substring(0, 1000) + '...' // Preview
      };

      // Store in vector database if available
      let vectorStoreResult = null;
      if (this.isInitialized) {
        try {
          vectorStoreResult = await vectorService.storeDocumentChunks(documentId, chunks, metadata);
        } catch (error) {
          console.error('Vector storage failed, continuing without RAG:', error);
        }
      }

      // Store document info locally
      const documentInfo = {
        id: documentId,
        metadata,
        chunks,
        vectorStored: vectorStoreResult?.success || false,
        processedAt: new Date()
      };

      this.documentStore.set(documentId, documentInfo);
      
      // Add to session context
      if (!this.sessionContext.has(sessionId)) {
        this.sessionContext.set(sessionId, { documents: [], messages: [] });
      }
      
      this.sessionContext.get(sessionId).documents.push(documentInfo);

      return {
        success: true,
        documentId,
        chunkCount: chunks.length,
        vectorStored: vectorStoreResult?.success || false,
        metadata
      };
    } catch (error) {
      console.error('Document processing failed:', error);
      throw error;
    }
  }

  // Enhanced chat with RAG capabilities
  async chatWithRAG(message, sessionId = 'default', options = {}) {
    try {
      const {
        useRAG = true,
        maxContextChunks = ragConfig.retrieval.topK,
        includeHistory = true
      } = options;

      let enhancedPrompt = message;
      let relevantDocuments = [];
      let ragContext = '';

      // Get session context
      const sessionData = this.sessionContext.get(sessionId) || { documents: [], messages: [] };

      // Perform RAG search if enabled and vector service is available
      if (useRAG && this.isInitialized && sessionData.documents.length > 0) {
        try {
          // Search for relevant content
          const searchResults = await vectorService.searchSimilar(message, {
            topK: maxContextChunks,
            threshold: ragConfig.retrieval.similarityThreshold,
            filter: { sessionId }
          });

          if (searchResults.length > 0) {
            relevantDocuments = searchResults;
            ragContext = this.buildRAGContext(searchResults);
            enhancedPrompt = this.buildEnhancedPrompt(message, ragContext, sessionData.documents);
          }
        } catch (error) {
          console.error('RAG search failed, using fallback:', error);
        }
      }

      // Get conversation history
      let conversationHistory = [];
      if (includeHistory) {
        conversationHistory = sessionData.messages.slice(-ragConfig.retrieval.contextWindow || -10);
      }

      // Generate response using Gemini AI
      let response;
      if (conversationHistory.length > 0) {
        const historyForGemini = conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }));
        
        const chatResult = await chatWithHistory(enhancedPrompt, historyForGemini);
        response = chatResult.response;
        
        // Update conversation history
        sessionData.messages.push(
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'model', content: response, timestamp: new Date() }
        );
      } else {
        response = await generateText(enhancedPrompt);
        
        // Initialize conversation history
        sessionData.messages = [
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'model', content: response, timestamp: new Date() }
        ];
      }

      // Update session context
      this.sessionContext.set(sessionId, sessionData);

      return {
        response,
        ragUsed: relevantDocuments.length > 0,
        relevantDocuments: relevantDocuments.map(doc => ({
          content: doc.content.substring(0, 200) + '...',
          score: doc.score,
          source: doc.metadata?.fileName || 'Unknown',
          chunkIndex: doc.metadata?.chunkIndex
        })),
        sessionId,
        messageCount: sessionData.messages.length
      };
    } catch (error) {
      console.error('RAG chat failed:', error);
      
      // Fallback to basic Gemini chat
      try {
        const fallbackResponse = await generateText(message);
        return {
          response: fallbackResponse,
          ragUsed: false,
          error: 'RAG temporarily unavailable',
          sessionId
        };
      } catch (geminiError) {
        console.error('Gemini fallback also failed:', geminiError);
        throw new Error('AI service temporarily unavailable');
      }
    }
  }

  // Build RAG context from search results
  buildRAGContext(searchResults) {
    if (!searchResults || searchResults.length === 0) {
      return '';
    }

    const contextParts = searchResults.map((result, index) => {
      const source = result.metadata?.fileName || 'Document';
      const score = (result.score * 100).toFixed(1);
      
      return `**Context ${index + 1}** (${source}, relevance: ${score}%):\n${result.content}\n`;
    });

    return `\n--- RELEVANT DOCUMENT CONTEXT ---\n${contextParts.join('\n')}\n--- END CONTEXT ---\n`;
  }

  // Build enhanced prompt with RAG context
  buildEnhancedPrompt(userMessage, ragContext, documents) {
    const documentList = documents.map(doc => doc.metadata.fileName).join(', ');
    
    return `You are an AI assistant with access to the user's uploaded documents: ${documentList}

Use the following relevant context from these documents to provide accurate, specific answers. Always cite the source document when referencing information.

${ragContext}

**User Question**: ${userMessage}

**Instructions**:
- Provide detailed, accurate answers based on the context provided
- When referencing information from documents, mention the source document name
- If the context doesn't contain relevant information, say so clearly
- Combine your general knowledge with the document context appropriately
- Be conversational and helpful while being precise about sources`;
  }

  // Get documents for a session
  getSessionDocuments(sessionId = 'default') {
    const sessionData = this.sessionContext.get(sessionId);
    if (!sessionData || !sessionData.documents) {
      return [];
    }

    return sessionData.documents.map(doc => ({
      id: doc.id,
      name: doc.metadata.fileName,
      type: doc.metadata.fileType,
      size: doc.metadata.fileSize,
      uploadTime: doc.metadata.uploadTime,
      chunkCount: doc.metadata.chunkCount,
      vectorStored: doc.vectorStored
    }));
  }

  // Delete a document
  async deleteDocument(documentId, sessionId = 'default') {
    try {
      // Remove from vector database
      if (this.isInitialized) {
        try {
          await vectorService.deleteDocument(documentId);
        } catch (error) {
          console.error('Failed to delete from vector DB:', error);
        }
      }

      // Remove from local storage
      this.documentStore.delete(documentId);

      // Remove from session context
      const sessionData = this.sessionContext.get(sessionId);
      if (sessionData && sessionData.documents) {
        sessionData.documents = sessionData.documents.filter(doc => doc.id !== documentId);
        this.sessionContext.set(sessionId, sessionData);
      }

      return { success: true, documentId };
    } catch (error) {
      console.error('Delete document failed:', error);
      throw error;
    }
  }

  // Clear session data
  clearSession(sessionId = 'default') {
    try {
      const sessionData = this.sessionContext.get(sessionId);
      if (sessionData && sessionData.documents) {
        // Delete all documents in session
        sessionData.documents.forEach(doc => {
          this.documentStore.delete(doc.id);
        });
      }

      // Clear session context
      this.sessionContext.delete(sessionId);

      return { success: true };
    } catch (error) {
      console.error('Clear session failed:', error);
      throw error;
    }
  }

  // Search across documents
  async searchDocuments(query, sessionId = 'default', options = {}) {
    try {
      if (!this.isInitialized) {
        throw new Error('Vector search not available');
      }

      const searchResults = await vectorService.searchSimilar(query, {
        ...options,
        filter: { sessionId }
      });

      return searchResults.map(result => ({
        content: result.content,
        score: result.score,
        source: result.metadata?.fileName || 'Unknown',
        documentId: result.metadata?.documentId,
        chunkIndex: result.metadata?.chunkIndex
      }));
    } catch (error) {
      console.error('Document search failed:', error);
      throw error;
    }
  }

  // Get conversation history
  getConversationHistory(sessionId = 'default', limit = 50) {
    const sessionData = this.sessionContext.get(sessionId);
    if (!sessionData || !sessionData.messages) {
      return [];
    }

    return sessionData.messages.slice(-limit).map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));
  }

  // Generate session summary
  async generateSessionSummary(sessionId = 'default') {
    try {
      const sessionData = this.sessionContext.get(sessionId);
      if (!sessionData) {
        throw new Error('Session not found');
      }

      const { documents, messages } = sessionData;
      const documentNames = documents.map(doc => doc.metadata.fileName).join(', ');
      const messageCount = messages.length;
      const duration = this.calculateSessionDuration(messages);

      // Create summary prompt
      const summaryPrompt = `Create a comprehensive session summary for this chat conversation:

**Session Info:**
- Documents discussed: ${documentNames}
- Total messages: ${messageCount}
- Duration: ${duration}

**Conversation History:**
${messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Please provide:
1. Key topics discussed
2. Main questions asked
3. Important insights or recommendations given
4. Action items or next steps mentioned
5. Documents referenced and their relevance

Format the summary in a clear, structured way.`;

      const summary = await generateText(summaryPrompt);
      
      return {
        sessionId,
        summary,
        statistics: {
          documentCount: documents.length,
          messageCount,
          duration,
          documentNames: documentNames || 'None'
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Session summary generation failed:', error);
      throw error;
    }
  }

  // Calculate session duration
  calculateSessionDuration(messages) {
    if (!messages || messages.length === 0) return '0 minutes';
    
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    
    if (!firstMessage.timestamp || !lastMessage.timestamp) return 'Unknown';
    
    const duration = lastMessage.timestamp - firstMessage.timestamp;
    const minutes = Math.round(duration / (1000 * 60));
    
    return minutes < 1 ? 'Less than 1 minute' : `${minutes} minutes`;
  }

  // Get RAG statistics
  async getRAGStats() {
    try {
      const vectorStats = this.isInitialized ? await vectorService.getStats() : null;
      
      return {
        ragEnabled: this.isInitialized,
        vectorDatabase: vectorStats,
        documentsProcessed: this.documentStore.size,
        activeSessions: this.sessionContext.size,
        provider: ragConfig.vectorDb.provider,
        aiModel: ragConfig.ai.gemini.model
      };
    } catch (error) {
      console.error('Failed to get RAG stats:', error);
      return { error: error.message };
    }
  }
}

export default new RAGService();
