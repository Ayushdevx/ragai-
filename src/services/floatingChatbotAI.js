// Advanced AI service for the floating chatbot
import { generateText, chatWithHistory } from './geminiService.js';

class FloatingChatbotAI {
  constructor() {
    this.context = [];
    this.geminiHistory = [];
    this.features = {
      documentAnalysis: true,
      voiceCommands: true,
      smartSuggestions: true,
      contextAwareness: true,
      multiLanguage: true,
      realTimeAI: true
    };
    this.systemPrompt = this.buildSystemPrompt();
  }

  buildSystemPrompt() {
    return `You are an advanced AI assistant integrated into a floating chatbot widget. You provide helpful, accurate, and contextually relevant responses.

**Your Capabilities:**
- Document analysis and Q&A
- Creative brainstorming and problem-solving
- Technical guidance and code review
- Research assistance and information synthesis
- Strategic planning and recommendations

**Response Guidelines:**
- Be conversational yet professional
- Use markdown formatting for better readability
- Provide actionable advice when possible
- Keep responses concise but comprehensive
- Ask follow-up questions to better assist users
- Use emojis sparingly but effectively

**Available Features:**
- Voice input/output capabilities
- Document upload and analysis
- Real-time conversation context
- Export and sharing functionality
- Multi-language support

Always aim to be helpful, accurate, and engaging while maintaining a friendly tone.`;
  }

  // Analyze user intent from message
  analyzeIntent(message) {
    const intents = {
      greeting: /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i,
      help: /\b(help|assist|support|guide|how)\b/i,
      document: /\b(document|file|upload|analyze|pdf|text)\b/i,
      question: /\b(what|why|how|when|where|who)\b/i,
      analysis: /\b(analyze|analysis|insight|report|summary)\b/i,
      creative: /\b(idea|creative|brainstorm|suggest|inspire)\b/i,
      technical: /\b(api|code|programming|development|technical)\b/i,
      farewell: /\b(bye|goodbye|see you|thanks|thank you)\b/i
    };

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(message)) {
        return intent;
      }
    }
    
    return 'general';
  }

  // Extract entities from message
  extractEntities(message) {
    const entities = {
      documents: [],
      topics: [],
      actions: [],
      emotions: []
    };

    // Document types
    const docTypes = message.match(/\b(pdf|doc|docx|txt|csv|excel|powerpoint|presentation)\b/gi);
    if (docTypes) entities.documents = [...new Set(docTypes.map(d => d.toLowerCase()))];

    // Topics
    const topics = message.match(/\b(machine learning|ai|artificial intelligence|data science|analytics|business|finance|marketing|education|research)\b/gi);
    if (topics) entities.topics = [...new Set(topics.map(t => t.toLowerCase()))];

    // Actions
    const actions = message.match(/\b(create|generate|analyze|summarize|extract|compare|translate|explain|teach)\b/gi);
    if (actions) entities.actions = [...new Set(actions.map(a => a.toLowerCase()))];

    return entities;
  }

  // Generate contextual response
  generateResponse(message, intent, entities) {
    const responses = {
      greeting: this.getGreetingResponse(),
      help: this.getHelpResponse(entities),
      document: this.getDocumentResponse(entities),
      question: this.getQuestionResponse(message, entities),
      analysis: this.getAnalysisResponse(entities),
      creative: this.getCreativeResponse(entities),
      technical: this.getTechnicalResponse(entities),
      farewell: this.getFarewellResponse(),
      general: this.getGeneralResponse(message, entities)
    };

    return responses[intent] || responses.general;
  }

  getGreetingResponse() {
    const greetings = [
      "Hello! 👋 I'm your AI assistant, ready to help with documents, analysis, and creative tasks!",
      "Hi there! 🤖 I'm here to assist you with AI-powered insights and document analysis.",
      "Welcome! ✨ I can help you with document analysis, Q&A, creative brainstorming, and much more!"
    ];
    
    const features = [
      "\n\n**Quick Start Options:**",
      "📄 **Document Analysis** - Upload and analyze any document",
      "🧠 **AI Insights** - Get intelligent analysis and recommendations", 
      "💡 **Creative Help** - Brainstorming and idea generation",
      "🎯 **Smart Q&A** - Ask questions about your content",
      "\nWhat would you like to explore first?"
    ];

    return greetings[Math.floor(Math.random() * greetings.length)] + features.join('\n');
  }

  getHelpResponse(entities) {
    return `I'm here to help! Here are my **core capabilities**:

🔍 **Document Intelligence**
• Upload and analyze documents (PDF, Word, Excel, etc.)
• Extract key information and insights
• Generate summaries and reports
• Compare multiple documents

🧠 **AI Analysis**
• Content analysis and pattern recognition
• Data insights and trend analysis
• Risk assessment and recommendations
• Strategic planning assistance

💬 **Smart Conversations**
• Context-aware Q&A sessions
• Multi-turn conversations with memory
• Technical and creative discussions
• Real-time assistance

🎨 **Creative Support**
• Brainstorming and idea generation
• Content creation assistance
• Problem-solving strategies
• Innovation consulting

**Voice Commands** 🎤 | **Multi-language** 🌍 | **Context Memory** 🧠

What specific area interests you most?`;
  }

  getDocumentResponse(entities) {
    const docTypes = entities.documents.length > 0 ? entities.documents.join(', ') : 'any format';
    
    return `Perfect! I excel at **document analysis**. Here's what I can do:

📄 **Supported Formats**
• PDF, Word (DOC/DOCX), Excel, PowerPoint
• Text files, CSV, JSON, XML
• Images with text (OCR capability)
${entities.documents.length > 0 ? `\n*I see you mentioned: ${docTypes}*` : ''}

🔍 **Analysis Features**
• **Content Extraction** - Key points, themes, entities
• **Summarization** - Executive summaries, abstracts
• **Q&A** - Ask specific questions about content
• **Comparison** - Side-by-side document analysis
• **Data Mining** - Pattern recognition and insights

🎯 **Smart Outputs**
• Interactive reports with visualizations
• Actionable recommendations
• Risk and opportunity identification
• Compliance and quality checks

**Ready to upload a document?** Simply drag & drop or use the upload button in the main interface. I'll analyze it instantly!

*Pro tip: You can also ask me questions about documents that are already uploaded.*`;
  }

  getQuestionResponse(message, entities) {
    const questionTypes = {
      what: "I can explain concepts, define terms, and provide detailed information",
      how: "I can guide you through processes, provide step-by-step instructions, and explain methodologies",
      why: "I can analyze reasons, explain causation, and provide context",
      when: "I can help with timing, scheduling, and historical context",
      where: "I can provide location-based information and contextual guidance",
      who: "I can identify key people, roles, and stakeholders"
    };

    const questionWord = message.match(/\b(what|how|why|when|where|who)\b/i)?.[0]?.toLowerCase();
    const response = questionTypes[questionWord] || "I can provide comprehensive answers to your questions";

    return `Great question! ${response}.

**Enhanced Q&A Features:**
🎯 **Context-Aware** - I remember our conversation history
📊 **Data-Driven** - Answers backed by document analysis
🔗 **Cross-Referenced** - Links between related concepts
💡 **Actionable** - Practical recommendations included

${entities.topics.length > 0 ? `I notice you're interested in: **${entities.topics.join(', ')}**` : ''}

Feel free to ask follow-up questions - I maintain context throughout our conversation! What specific aspect would you like me to dive deeper into?`;
  }

  getAnalysisResponse(entities) {
    return `Excellent! I provide **comprehensive AI analysis** across multiple domains:

📊 **Data Analysis**
• Statistical insights and trend identification
• Predictive modeling and forecasting
• Anomaly detection and pattern recognition
• Performance metrics and KPI analysis

🧠 **Content Analysis**
• Sentiment analysis and emotion detection
• Topic modeling and theme extraction
• Readability and engagement scoring
• Competitive analysis and benchmarking

💼 **Business Intelligence**
• Market analysis and opportunity assessment
• Risk evaluation and mitigation strategies
• Process optimization recommendations
• Strategic planning and decision support

🔬 **Research Analysis**
• Literature reviews and synthesis
• Methodology evaluation
• Data validation and quality assessment
• Evidence-based recommendations

**Advanced Features:**
• Real-time analysis with live updates
• Interactive visualizations and charts
• Collaborative analysis workflows
• Export capabilities (PDF, Excel, PowerPoint)

Which type of analysis would be most valuable for your current project?`;
  }

  getCreativeResponse(entities) {
    return `Let's unlock your creativity! 🎨 I'm your **creative AI partner** with advanced brainstorming capabilities:

💡 **Idea Generation**
• Innovative solution brainstorming
• Creative problem-solving techniques
• Out-of-the-box thinking strategies
• Inspiration from diverse domains

✍️ **Content Creation**
• Writing assistance (blogs, articles, copy)
• Storytelling and narrative development
• Marketing content and campaigns
• Educational material creation

🎯 **Strategic Creativity**
• Product and service innovation
• Business model brainstorming
• User experience design ideas
• Process improvement concepts

🎨 **Design Thinking**
• User-centered design approaches
• Prototyping and concept development
• Visual storytelling techniques
• Brand and identity concepts

**Creative Methods I Use:**
• Mind mapping and association techniques
• SCAMPER methodology
• Design thinking frameworks
• Cross-industry inspiration
• Constraint-based creativity

What creative challenge are you working on? I can help generate ideas, refine concepts, or provide fresh perspectives!`;
  }

  getTechnicalResponse(entities) {
    return `Perfect! I'm equipped with **advanced technical capabilities**:

⚡ **AI & Machine Learning**
• Algorithm recommendations and optimization
• Model selection and validation strategies
• Data preprocessing and feature engineering
• Performance tuning and monitoring

🔧 **Development Support**
• Code review and optimization suggestions
• Architecture planning and best practices
• API design and integration strategies
• Testing and deployment guidance

📊 **Data Engineering**
• ETL pipeline design and optimization
• Database schema recommendations
• Real-time processing solutions
• Scalability and performance optimization

🛡️ **Security & Compliance**
• Security audit recommendations
• Compliance framework guidance
• Risk assessment and mitigation
• Data privacy and protection strategies

**Technical Specialties:**
• Cloud architecture (AWS, Azure, GCP)
• Microservices and containerization
• DevOps and CI/CD optimization
• Performance monitoring and analytics

What technical challenge can I help you solve? I can provide code examples, architectural guidance, or troubleshooting assistance!`;
  }

  getFarewellResponse() {
    const farewells = [
      "Thank you for using the AI assistant! 🙏 Feel free to return anytime for more insights and assistance.",
      "Goodbye! 👋 Remember, I'm always here when you need AI-powered help with documents, analysis, or creative projects.",
      "It was great helping you today! ✨ Don't hesitate to come back for more AI assistance and insights."
    ];

    return farewells[Math.floor(Math.random() * farewells.length)] + 
           "\n\n*Tip: I maintain conversation context, so feel free to continue where we left off!*";
  }

  getGeneralResponse(message, entities) {
    const topics = entities.topics.length > 0 ? entities.topics.join(', ') : null;
    const actions = entities.actions.length > 0 ? entities.actions.join(', ') : null;

    let response = `I understand you're interested in: **"${message}"**\n\n`;

    if (topics) {
      response += `Great topic! I have extensive knowledge about **${topics}** and can help with:\n`;
      response += `• In-depth explanations and tutorials\n`;
      response += `• Current trends and best practices\n`;
      response += `• Practical applications and examples\n`;
      response += `• Related resources and recommendations\n\n`;
    }

    if (actions) {
      response += `I can help you **${actions}** with:\n`;
      response += `• Step-by-step guidance and methodologies\n`;
      response += `• Tools and techniques recommendations\n`;
      response += `• Quality checks and optimization tips\n`;
      response += `• Templates and examples\n\n`;
    }

    response += `**How I can assist further:**\n`;
    response += `🎯 Ask specific questions for detailed answers\n`;
    response += `📄 Upload documents for analysis and insights\n`;
    response += `💡 Request creative ideas and brainstorming\n`;
    response += `🔍 Get AI-powered analysis and recommendations\n\n`;
    response += `What specific aspect would you like to explore deeper?`;

    return response;
  }
  // Process message and generate response using Gemini AI
  async processMessage(message, settings = {}) {
    try {
      // Add to context
      this.context.push({ role: 'user', content: message, timestamp: new Date() });

      // Prepare the prompt with system instructions and context
      let prompt = this.systemPrompt;
      
      // Add user preferences from settings
      if (settings.responseStyle) {
        prompt += `\n\nResponse Style: ${settings.responseStyle}`;
      }
      if (settings.responseLength) {
        prompt += `\nResponse Length: ${settings.responseLength}`;
      }

      // Add recent conversation context (last 5 exchanges)
      const recentContext = this.context.slice(-10);
      if (recentContext.length > 0) {
        prompt += '\n\nRecent Conversation Context:';
        recentContext.forEach(ctx => {
          prompt += `\n${ctx.role}: ${ctx.content}`;
        });
      }

      prompt += `\n\nUser Message: ${message}`;

      // Use Gemini API for real AI responses
      const response = await chatWithHistory(prompt, this.geminiHistory);
      
      // Update Gemini history
      this.geminiHistory = response.updatedHistory;

      // Analyze the response for intent and entities
      const intent = this.analyzeIntent(message);
      const entities = this.extractEntities(message);

      // Add response to context
      this.context.push({ 
        role: 'assistant', 
        content: response.response, 
        timestamp: new Date() 
      });

      // Keep context manageable (last 20 exchanges)
      if (this.context.length > 40) {
        this.context = this.context.slice(-40);
      }

      // Keep Gemini history manageable
      if (this.geminiHistory.length > 20) {
        this.geminiHistory = this.geminiHistory.slice(-20);
      }

      return {
        content: response.response,
        intent,
        entities,
        confidence: 0.98, // High confidence with real AI
        suggestions: this.generateSuggestions(intent, entities, response.response)
      };
    } catch (error) {
      console.error('AI Processing Error:', error);
      
      // Fallback to local processing if Gemini fails
      const fallbackResponse = this.getFallbackResponse(message);
      
      return {
        content: fallbackResponse,
        intent: 'error',
        entities: {},
        confidence: 0.5,
        suggestions: ['Try rephrasing your question', 'Check your internet connection', 'Ask about my capabilities']
      };
    }
  }

  // Fallback response when AI service fails
  getFallbackResponse(message) {
    const intent = this.analyzeIntent(message);
    const responses = {
      greeting: "Hello! I'm your AI assistant. I'm currently experiencing some connection issues, but I'm here to help! 👋",
      help: "I can assist with document analysis, creative brainstorming, technical guidance, and research. How can I help you today?",
      document: "I can help analyze documents, extract insights, and answer questions about your content. What would you like to explore?",
      analysis: "I offer comprehensive analysis including data insights, content analysis, and strategic recommendations. What type of analysis interests you?",
      creative: "I'm great at brainstorming, idea generation, and creative problem-solving! What creative challenge can I help with?",
      technical: "I can assist with code review, architecture planning, and technical guidance. What technical topic would you like to discuss?",
      general: `I understand you're asking about "${message}". I'm here to help with various tasks including analysis, creative work, and technical guidance. Could you be more specific about what you need?`
    };

    return responses[intent] || responses.general;
  }

  generateSuggestions(intent, entities) {
    const suggestionMap = {
      greeting: ['Tell me about your features', 'How can you help with documents?', 'Show me analysis capabilities'],
      help: ['Upload a document for analysis', 'Ask about AI capabilities', 'Get creative ideas'],
      document: ['Upload a PDF for analysis', 'Compare multiple documents', 'Extract key insights'],
      analysis: ['Analyze data trends', 'Generate insights report', 'Create visualizations'],
      creative: ['Brainstorm new ideas', 'Generate content', 'Solve problems creatively'],
      technical: ['Review code architecture', 'Optimize performance', 'Security recommendations']
    };

    return suggestionMap[intent] || ['Ask me anything!', 'Upload a document', 'Get AI insights'];
  }
}

export default new FloatingChatbotAI();
