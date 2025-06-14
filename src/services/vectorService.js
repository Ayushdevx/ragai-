// Vector Database Service for RAG Implementation
// Supports multiple vector databases (Pinecone, Qdrant, Weaviate)
import ragConfig from '../config/ragConfig.js';

class VectorService {
  constructor() {
    this.provider = ragConfig.vectorDb.provider;
    this.client = null;
    this.isInitialized = false;
  }
  async initialize() {
    try {
      if (this.provider === 'none') {
        console.log('Vector database provider set to "none" - RAG features will be disabled');
        throw new Error('Vector database disabled by configuration');
      }
      
      switch (this.provider) {
        case 'pinecone':
          await this.initializePinecone();
          break;
        case 'qdrant':
          await this.initializeQdrant();
          break;
        case 'weaviate':
          await this.initializeWeaviate();
          break;
        default:
          throw new Error(`Unsupported vector database provider: ${this.provider}`);
      }
      this.isInitialized = true;
      console.log(`Vector database (${this.provider}) initialized successfully`);
    } catch (error) {
      console.error(`Failed to initialize vector database (${this.provider}):`, error);
      throw error;
    }
  }

  async initializePinecone() {
    try {
      const { Pinecone } = await import('@pinecone-database/pinecone');
      const config = ragConfig.vectorDb.pinecone;
      
      this.client = new Pinecone({
        apiKey: config.apiKey,
        environment: config.environment
      });

      // Check if index exists, create if not
      const indexList = await this.client.listIndexes();
      const indexExists = indexList.indexes?.some(index => index.name === config.indexName);
      
      if (!indexExists) {
        await this.client.createIndex({
          name: config.indexName,
          dimension: config.dimension,
          metric: 'cosine'
        });
        console.log(`Created Pinecone index: ${config.indexName}`);
      }
      
      this.index = this.client.index(config.indexName);
    } catch (error) {
      console.error('Pinecone initialization failed:', error);
      throw error;
    }
  }

  async initializeQdrant() {
    try {
      const { QdrantClient } = await import('@qdrant/js-client-rest');
      const config = ragConfig.vectorDb.qdrant;
      
      this.client = new QdrantClient({
        url: config.url,
        apiKey: config.apiKey
      });

      // Check if collection exists, create if not
      try {
        await this.client.getCollection(config.collectionName);
      } catch (error) {
        if (error.status === 404) {
          await this.client.createCollection(config.collectionName, {
            vectors: {
              size: config.dimension,
              distance: 'Cosine'
            }
          });
          console.log(`Created Qdrant collection: ${config.collectionName}`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Qdrant initialization failed:', error);
      throw error;
    }
  }

  async initializeWeaviate() {
    try {
      const weaviate = await import('weaviate-ts-client');
      const config = ragConfig.vectorDb.weaviate;
      
      this.client = weaviate.default.client({
        scheme: config.url.startsWith('https') ? 'https' : 'http',
        host: config.url.replace(/^https?:\/\//, ''),
        apiKey: config.apiKey ? weaviate.apiKey(config.apiKey) : null
      });

      // Check if class exists, create if not
      try {
        await this.client.schema.classGetter().withClassName(config.className).do();
      } catch (error) {
        if (error.statusCode === 404) {
          const classSchema = {
            class: config.className,
            vectorizer: 'none',
            properties: [
              {
                name: 'content',
                dataType: ['text']
              },
              {
                name: 'metadata',
                dataType: ['object']
              }
            ]
          };
          
          await this.client.schema.classCreator().withClass(classSchema).do();
          console.log(`Created Weaviate class: ${config.className}`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Weaviate initialization failed:', error);
      throw error;
    }
  }

  // Generate embeddings using Gemini
  async generateEmbedding(text) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(ragConfig.ai.gemini.apiKey);
      const model = genAI.getGenerativeModel({ model: ragConfig.ai.gemini.embeddingModel });
      
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw error;
    }
  }

  // Store document chunks with embeddings
  async storeDocumentChunks(documentId, chunks, metadata = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const vectors = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await this.generateEmbedding(chunk.content);
        
        const vectorData = {
          id: `${documentId}_chunk_${i}`,
          values: embedding,
          metadata: {
            ...metadata,
            documentId,
            chunkIndex: i,
            content: chunk.content,
            type: 'document_chunk',
            timestamp: new Date().toISOString(),
            ...chunk.metadata
          }
        };
        
        vectors.push(vectorData);
      }

      switch (this.provider) {
        case 'pinecone':
          await this.storePineconeVectors(vectors);
          break;
        case 'qdrant':
          await this.storeQdrantVectors(vectors);
          break;
        case 'weaviate':
          await this.storeWeaviateVectors(vectors);
          break;
      }

      return {
        success: true,
        vectorCount: vectors.length,
        documentId
      };
    } catch (error) {
      console.error('Failed to store document chunks:', error);
      throw error;
    }
  }

  async storePineconeVectors(vectors) {
    const batchSize = 100; // Pinecone batch limit
    
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.index.upsert(batch);
    }
  }

  async storeQdrantVectors(vectors) {
    const config = ragConfig.vectorDb.qdrant;
    const points = vectors.map(vector => ({
      id: vector.id,
      vector: vector.values,
      payload: vector.metadata
    }));

    await this.client.upsert(config.collectionName, { points });
  }

  async storeWeaviateVectors(vectors) {
    const config = ragConfig.vectorDb.weaviate;
    
    for (const vector of vectors) {
      await this.client.data
        .creator()
        .withClassName(config.className)
        .withId(vector.id)
        .withVector(vector.values)
        .withProperties({
          content: vector.metadata.content,
          metadata: vector.metadata
        })
        .do();
    }
  }

  // Search for similar documents
  async searchSimilar(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        topK = ragConfig.retrieval.topK,
        threshold = ragConfig.retrieval.similarityThreshold,
        filter = {}
      } = options;

      const queryEmbedding = await this.generateEmbedding(query);
      
      let results;
      switch (this.provider) {
        case 'pinecone':
          results = await this.searchPinecone(queryEmbedding, topK, threshold, filter);
          break;
        case 'qdrant':
          results = await this.searchQdrant(queryEmbedding, topK, threshold, filter);
          break;
        case 'weaviate':
          results = await this.searchWeaviate(queryEmbedding, topK, threshold, filter);
          break;
      }

      return results.map(result => ({
        content: result.metadata?.content || result.content,
        score: result.score,
        metadata: result.metadata,
        id: result.id
      }));
    } catch (error) {
      console.error('Similarity search failed:', error);
      throw error;
    }
  }

  async searchPinecone(vector, topK, threshold, filter) {
    const queryResponse = await this.index.query({
      vector,
      topK,
      includeMetadata: true,
      filter
    });

    return queryResponse.matches
      .filter(match => match.score >= threshold)
      .map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata
      }));
  }

  async searchQdrant(vector, topK, threshold, filter) {
    const config = ragConfig.vectorDb.qdrant;
    
    const searchParams = {
      vector,
      limit: topK,
      with_payload: true,
      score_threshold: threshold
    };

    if (Object.keys(filter).length > 0) {
      searchParams.filter = filter;
    }

    const response = await this.client.search(config.collectionName, searchParams);
    
    return response.map(point => ({
      id: point.id,
      score: point.score,
      metadata: point.payload
    }));
  }

  async searchWeaviate(vector, topK, threshold, filter) {
    const config = ragConfig.vectorDb.weaviate;
    
    let query = this.client.graphql
      .get()
      .withClassName(config.className)
      .withFields('content metadata')
      .withNearVector({
        vector,
        certainty: threshold
      })
      .withLimit(topK);

    // Apply filters if provided
    if (Object.keys(filter).length > 0) {
      query = query.withWhere({
        operator: 'And',
        operands: Object.entries(filter).map(([key, value]) => ({
          path: [key],
          operator: 'Equal',
          valueString: value
        }))
      });
    }

    const response = await query.do();
    const results = response.data.Get[config.className] || [];
    
    return results.map((result, index) => ({
      id: `result_${index}`,
      score: result._additional?.certainty || 0,
      content: result.content,
      metadata: result.metadata
    }));
  }

  // Delete document chunks
  async deleteDocument(documentId) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      switch (this.provider) {
        case 'pinecone':
          await this.deletePineconeDocument(documentId);
          break;
        case 'qdrant':
          await this.deleteQdrantDocument(documentId);
          break;
        case 'weaviate':
          await this.deleteWeaviateDocument(documentId);
          break;
      }

      return { success: true, documentId };
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  async deletePineconeDocument(documentId) {
    // Pinecone doesn't support prefix deletion in all plans
    // We'll need to track chunk IDs in metadata or use a different approach
    const filter = { documentId: { $eq: documentId } };
    await this.index.deleteMany(filter);
  }

  async deleteQdrantDocument(documentId) {
    const config = ragConfig.vectorDb.qdrant;
    
    await this.client.delete(config.collectionName, {
      filter: {
        must: [
          {
            key: 'documentId',
            match: { value: documentId }
          }
        ]
      }
    });
  }

  async deleteWeaviateDocument(documentId) {
    const config = ragConfig.vectorDb.weaviate;
    
    await this.client.batch
      .objectsBatchDeleter()
      .withClassName(config.className)
      .withWhere({
        path: ['documentId'],
        operator: 'Equal',
        valueString: documentId
      })
      .do();
  }

  // Get storage statistics
  async getStats() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      switch (this.provider) {
        case 'pinecone':
          return await this.getPineconeStats();
        case 'qdrant':
          return await this.getQdrantStats();
        case 'weaviate':
          return await this.getWeaviateStats();
        default:
          return { error: 'Unsupported provider' };
      }
    } catch (error) {
      console.error('Failed to get vector database stats:', error);
      return { error: error.message };
    }
  }

  async getPineconeStats() {
    const stats = await this.index.describeIndexStats();
    return {
      provider: 'pinecone',
      totalVectors: stats.totalVectorCount,
      dimension: stats.dimension,
      indexFullness: stats.indexFullness,
      namespaces: stats.namespaces
    };
  }

  async getQdrantStats() {
    const config = ragConfig.vectorDb.qdrant;
    const info = await this.client.getCollection(config.collectionName);
    
    return {
      provider: 'qdrant',
      totalVectors: info.vectors_count,
      dimension: info.config.params.vectors.size,
      status: info.status
    };
  }

  async getWeaviateStats() {
    const config = ragConfig.vectorDb.weaviate;
    
    const response = await this.client.graphql
      .aggregate()
      .withClassName(config.className)
      .withFields('meta { count }')
      .do();
    
    const count = response.data?.Aggregate?.[config.className]?.[0]?.meta?.count || 0;
    
    return {
      provider: 'weaviate',
      totalVectors: count,
      className: config.className
    };
  }
}

export default new VectorService();
