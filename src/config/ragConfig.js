// Enhanced RAG Configuration for Gemini AI + Vector DB Integration
// Supports multiple vector databases and document processing

export const ragConfig = {
  // AI Service Configuration (keeping Gemini as primary)
  ai: {
    primary: 'gemini',
    gemini: {
      model: 'gemini-1.5-flash',
      embeddingModel: 'text-embedding-004',
      maxTokens: 8192,
      temperature: 0.7,
      apiKey: import.meta.env.VITE_GEMINI_API_KEY
    },
    // Future Ollama integration (prepared but not active)
    ollama: {
      baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
      model: 'llama3.2',
      embeddingModel: 'nomic-embed-text',
      enabled: false // Will be enabled later
    }
  },
  // Vector Database Configuration
  vectorDb: {
    provider: import.meta.env.VITE_VECTOR_DB_PROVIDER || 'none', // pinecone, qdrant, weaviate, none
    
    // Pinecone Configuration
    pinecone: {
      apiKey: import.meta.env.VITE_PINECONE_API_KEY,
      environment: import.meta.env.VITE_PINECONE_ENVIRONMENT || 'us-east-1-aws',
      indexName: import.meta.env.VITE_PINECONE_INDEX || 'rag-documents',
      dimension: 768 // Gemini embedding dimension
    },
    
    // Qdrant Configuration
    qdrant: {
      url: import.meta.env.VITE_QDRANT_URL || 'http://localhost:6333',
      apiKey: import.meta.env.VITE_QDRANT_API_KEY,
      collectionName: 'rag-documents',
      dimension: 768
    },
    
    // Weaviate Configuration
    weaviate: {
      url: import.meta.env.VITE_WEAVIATE_URL || 'http://localhost:8080',
      apiKey: import.meta.env.VITE_WEAVIATE_API_KEY,
      className: 'Document',
      dimension: 768
    }
  },

  // Document Processing Configuration
  documents: {
    // Supported file types
    supportedTypes: ['.pdf', '.txt', '.md', '.png', '.jpg', '.jpeg', '.webp', '.docx'],
    
    // File size limits (in bytes)
    maxFileSize: {
      pdf: 50 * 1024 * 1024, // 50MB
      image: 10 * 1024 * 1024, // 10MB
      text: 5 * 1024 * 1024, // 5MB
      docx: 25 * 1024 * 1024 // 25MB
    },
    
    // Text chunking configuration
    chunking: {
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ']
    },
    
    // OCR Configuration for images
    ocr: {
      enabled: true,
      language: 'eng',
      tesseractOptions: {
        logger: m => console.log(m)
      }
    }
  },

  // RAG Search Configuration
  search: {
    // Number of similar chunks to retrieve
    topK: 5,
    
    // Similarity threshold (0-1)
    similarityThreshold: 0.7,
    
    // Re-ranking options
    rerank: {
      enabled: true,
      model: 'cross-encoder'
    }
  },

  // Session Management
  session: {
    // Enable session tracking
    enabled: true,
    
    // Session timeout (ms)
    timeout: 30 * 60 * 1000, // 30 minutes
      // Mandatory user info collection
    requiredFields: ['name', 'email', 'purpose'],
    
    // Field configuration for user info form
    fieldConfig: {
      name: {
        label: 'Full Name',
        type: 'text',
        placeholder: 'Enter your full name'
      },
      email: {
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter your email address'
      },
      purpose: {
        label: 'Purpose of Chat',
        type: 'text',
        placeholder: 'What brings you here today?'
      }
    },
    
    // Session summary generation
    summaryEnabled: true,
    
    // Email notifications
    emailNotifications: {
      enabled: import.meta.env.VITE_EMAIL_NOTIFICATIONS === 'true',
      provider: 'resend', // resend, sendgrid, etc.
      apiKey: import.meta.env.VITE_EMAIL_API_KEY,
      fromEmail: import.meta.env.VITE_FROM_EMAIL || 'noreply@realitsolutions.ai',
      templates: {
        sessionSummary: 'session-summary',
        welcome: 'welcome-message'
      }
    }
  },

  // Moderation & Feedback
  moderation: {
    // Enable feedback collection
    enabled: true,
    
    // Webhook for incorrect answers
    webhook: {
      url: import.meta.env.VITE_MODERATION_WEBHOOK_URL,
      secret: import.meta.env.VITE_WEBHOOK_SECRET
    },
    
    // Database logging
    logIncorrectAnswers: true,
    
    // Auto-flagging criteria
    autoFlag: {
      lowConfidenceThreshold: 0.6,
      shortResponseThreshold: 50 // characters
    }
  },

  // Voice Configuration (existing + enhanced)
  voice: {
    // Speech-to-Text
    stt: {
      provider: 'whisper', // whisper, web-speech
      whisper: {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        model: 'whisper-1'
      },
      webSpeech: {
        language: 'en-US',
        continuous: false,
        interimResults: true
      }
    },
    
    // Text-to-Speech
    tts: {
      provider: 'elevenlabs', // elevenlabs, web-speech
      elevenlabs: {
        apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
        voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID,
        model: 'eleven_monolingual_v1'
      },
      webSpeech: {
        rate: 1,
        pitch: 1,
        volume: 0.8,
        voice: null // Will be set dynamically
      }
    }
  },

  // Storage Configuration
  storage: {
    provider: import.meta.env.VITE_STORAGE_PROVIDER || 'local', // aws-s3, gcp, azure, local
    
    aws: {
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      bucket: import.meta.env.VITE_AWS_BUCKET,
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
    },
    
    gcp: {
      projectId: import.meta.env.VITE_GCP_PROJECT_ID,
      bucket: import.meta.env.VITE_GCP_BUCKET,
      keyFilename: import.meta.env.VITE_GCP_KEY_FILE
    },
    
    local: {
      uploadPath: './uploads',
      maxFiles: 1000
    }
  },

  // Database Configuration
  database: {
    provider: import.meta.env.VITE_DATABASE_PROVIDER || 'supabase', // mongodb, postgresql, supabase
    
    mongodb: {
      uri: import.meta.env.VITE_MONGODB_URI,
      database: import.meta.env.VITE_MONGODB_DATABASE || 'rag_chatbot'
    },
    
    postgresql: {
      host: import.meta.env.VITE_POSTGRES_HOST,
      port: import.meta.env.VITE_POSTGRES_PORT || 5432,
      database: import.meta.env.VITE_POSTGRES_DB,
      user: import.meta.env.VITE_POSTGRES_USER,
      password: import.meta.env.VITE_POSTGRES_PASSWORD
    },
    
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
    }
  },

  // RAG Prompt Templates
  prompts: {
    // System prompt with RAG context
    systemWithContext: `You are Real IT Solutions AI, an intelligent assistant that helps users with document analysis, technical guidance, and creative problem-solving.

When answering questions, you have access to relevant document context provided below. Use this context to provide accurate, detailed, and helpful responses.

**Guidelines:**
- Always cite your sources when using information from the provided context
- If the context doesn't contain relevant information, clearly state this and provide general guidance
- Be conversational yet professional
- Provide actionable advice when possible
- Ask clarifying questions if needed

**Available Context:**
{context}

**User Question:** {question}

**Instructions:** Provide a comprehensive answer using the context above. If you use information from the context, mention which document or source it came from.`,

    // Welcome message with disclaimer
    welcome: `Hello! 👋 I'm your Real IT Solutions AI assistant. I can help you with:

📄 **Document Analysis** - Upload and analyze your documents
🧠 **Technical Guidance** - Get expert advice on various topics  
💡 **Creative Problem-Solving** - Brainstorm ideas and solutions
🎯 **Research Assistance** - Find insights from your uploaded content

**Disclaimer:** I provide assistance based on available information and uploaded documents. For critical decisions, please verify information and consult relevant experts.

Before we begin, I'd like to collect some basic information to provide you with the best possible assistance. This will only take a moment!`,

    // User info collection prompts
    collectUserInfo: {
      name: "What's your name? (This helps me personalize our conversation)",
      email: "What's your email address? (I'll send you a summary of our conversation)",
      purpose: "What brings you here today? What would you like to accomplish in our session?"
    },

    // Session summary template
    sessionSummary: `# Chat Session Summary

**Date:** {date}
**Duration:** {duration}
**Topics Discussed:** {topics}

## Key Points:
{keyPoints}

## Documents Referenced:
{documentsUsed}

## Action Items:
{actionItems}

## Next Steps:
{nextSteps}

---
*This summary was generated by Real IT Solutions AI*`
  },

  // Development/Debug Configuration
  debug: {
    enabled: import.meta.env.MODE === 'development',
    logLevel: 'info', // error, warn, info, debug
    showEmbeddingStats: false,
    showSearchResults: false
  }
};

// Configuration validation
export const validateConfig = () => {
  const errors = [];
  
  // Check required environment variables
  if (!ragConfig.ai.gemini.apiKey) {
    errors.push('VITE_GEMINI_API_KEY is required');
  }
  
  if (ragConfig.vectorDb.provider === 'pinecone' && !ragConfig.vectorDb.pinecone.apiKey) {
    errors.push('VITE_PINECONE_API_KEY is required when using Pinecone');
  }
  
  if (ragConfig.session.emailNotifications.enabled && !ragConfig.session.emailNotifications.apiKey) {
    errors.push('VITE_EMAIL_API_KEY is required when email notifications are enabled');
  }
  
  if (errors.length > 0) {
    console.warn('RAG Configuration Warnings:', errors);
  }
  
  return errors.length === 0;
};

// Helper functions
export const getActiveVectorDb = () => ragConfig.vectorDb[ragConfig.vectorDb.provider];
export const getActiveAI = () => ragConfig.ai[ragConfig.ai.primary];
export const isFeatureEnabled = (feature) => ragConfig[feature]?.enabled === true;

export default ragConfig;
