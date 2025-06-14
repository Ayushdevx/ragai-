import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './AppIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import floatingChatbotAI from '../services/floatingChatbotAI';
import ragService from '../services/ragService';
import sessionService from '../services/sessionService';
import ChatbotSettings from './ChatbotSettings';
import voiceInterface from '../services/voiceInterface';
import webSpeechService from '../services/webSpeechService';
import FileUpload from './FileUpload';
import UserInfoModal from './UserInfoModal';
import ModerationPanel from './ModerationPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import AIInsights from './AIInsights';
import EnhancedVoicePanel from './EnhancedVoicePanel';
import { useToast } from './Toast';
import analyticsService from '../services/analyticsService';

const EnhancedFloatingChatbot = () => {
  const { showToast, ToastContainer } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(false);const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! 👋 I\'m your Real IT Solutions AI assistant. I can help you with document analysis, creative brainstorming, technical guidance, and much more! How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [settings, setSettings] = useState({
    autoOpen: false,
    soundNotifications: true,
    showTyping: true,
    responseStyle: 'friendly',
    responseLength: 'balanced',
    smartSuggestions: true,
    contextMemory: true,
    theme: 'auto',
    position: 'bottom-right',
    animations: true,
    saveHistory: true,
    analytics: false,
    voiceEnabled: true,
    autoSpeak: false  });
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [speechSupport, setSpeechSupport] = useState({ speechToText: false, textToSpeech: false });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showEnhancedVoicePanel, setShowEnhancedVoicePanel] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  // Initialize services and session
  useEffect(() => {
    const initializeServices = async () => {
      try {        // Initialize RAG service
        await ragService.initialize();
        setRagEnabled(true);
        
        // Initialize session service
        await sessionService.initialize();
        
        // Initialize Web Speech Service
        await webSpeechService.initialize();
        const support = webSpeechService.isSupported();
        setSpeechSupport(support);
        
        // Set up speech event handlers
        webSpeechService.setOnResult((result) => {
          if (result.isFinal) {
            setInputMessage(result.final);
            setIsListening(false);
            // Auto-send the message
            handleSendMessage(result.final);
          }
        });
        
        webSpeechService.setOnStart(() => {
          setIsListening(true);
          setVoiceError(null);
        });
        
        webSpeechService.setOnEnd(() => {
          setIsListening(false);
        });
        
        webSpeechService.setOnError((error) => {
          setVoiceError(error);
          setIsListening(false);
          showToast(`Voice error: ${error}`, 'error');
        });
        
        // Create new session
        const newSessionId = sessionService.createSession();
        setSessionId(newSessionId);
        
        // Check if user info is required
        if (sessionService.isUserInfoRequired(newSessionId)) {
          setShowUserInfoModal(true);
        }
        
        console.log('RAG services initialized successfully');
      } catch (error) {
        console.error('Service initialization failed:', error);
        // Continue with basic functionality
        const newSessionId = 'session_' + Date.now();
        setSessionId(newSessionId);
      }
    };

    if (isOpen && !sessionId) {
      initializeServices();
    }
  }, [isOpen, sessionId]);

  // Load uploaded documents for session
  useEffect(() => {
    if (sessionId && ragEnabled) {
      const documents = ragService.getSessionDocuments(sessionId);
      setUploadedDocuments(documents);
    }
  }, [sessionId, ragEnabled]);

  // Quick action buttons with enhanced options
  const quickActions = [
    { icon: 'HelpCircle', text: 'How can I help?', action: 'help', gradient: 'from-blue-500 to-cyan-500' },
    { icon: 'FileText', text: 'Document Q&A', action: 'document', gradient: 'from-green-500 to-teal-500' },
    { icon: 'Brain', text: 'AI Analysis', action: 'analysis', gradient: 'from-purple-500 to-pink-500' },
    { icon: 'Lightbulb', text: 'Get Ideas', action: 'ideas', gradient: 'from-orange-500 to-red-500' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        toggleChatbot();
      }
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      // Voice shortcuts (only when chatbot is open)
      if (isOpen) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
          event.preventDefault();
          handleVoiceToggle();
        }
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
          event.preventDefault();
          if (voiceModeActive) {
            stopConversationMode();
          } else {
            startConversationMode();
          }
        }
        if ((event.ctrlKey || event.metaKey) && event.key === 't') {
          event.preventDefault();
          testVoiceFeatures();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, voiceModeActive]);
  // Enhanced AI response with RAG capabilities
  const getAIResponse = async (userMessage) => {
    try {
      if (ragEnabled && sessionId) {
        // Use RAG service for enhanced responses
        const ragResponse = await ragService.chatWithRAG(userMessage, sessionId, {
          useRAG: uploadedDocuments.length > 0,
          includeHistory: settings.contextMemory
        });

        // Record interaction in session
        sessionService.recordInteraction(sessionId, {
          type: 'chat',
          userMessage,
          aiResponse: ragResponse.response,
          ragUsed: ragResponse.ragUsed,
          documentsReferenced: ragResponse.relevantDocuments
        });

        setSuggestions(ragResponse.suggestions || []);
        return {
          content: ragResponse.response,
          ragUsed: ragResponse.ragUsed,
          relevantDocuments: ragResponse.relevantDocuments
        };
      } else {
        // Fallback to basic AI service
        const aiResponse = await floatingChatbotAI.processMessage(userMessage, settings);
        setSuggestions(aiResponse.suggestions || []);
        return { content: aiResponse.content };
      }
    } catch (error) {
      console.error('AI Response Error:', error);
      return { 
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
      };
    }  };

  // File upload handler
  const handleFileUpload = async (file, sessionId) => {
    try {
      setIsLoading(true);
      showToast('Processing document...', 'info');
      
      const result = await ragService.processDocument(file, sessionId);
      
      if (result.success) {
        // Update uploaded documents list
        const updatedDocuments = ragService.getSessionDocuments(sessionId);
        setUploadedDocuments(updatedDocuments);
          showToast(`Document "${file.name}" processed successfully!`, 'success');
        
        // Track document upload analytics
        setDocumentsUsedInSession(true);
        analyticsService.trackEngagement('document_uploaded', 1);
        
        // Add system message about document upload
        const systemMessage = {
          id: Date.now(),
          type: 'system',
          content: `📄 Document "${file.name}" has been uploaded and processed. You can now ask questions about its content!`,
          timestamp: new Date(),
          documentInfo: result
        };
        
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      showToast(`Failed to process "${file.name}": ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // File removal handler
  const handleFileRemove = async (documentId) => {
    try {
      await ragService.deleteDocument(documentId, sessionId);
      const updatedDocuments = ragService.getSessionDocuments(sessionId);
      setUploadedDocuments(updatedDocuments);
      showToast('Document removed successfully', 'success');
    } catch (error) {
      console.error('File removal failed:', error);
      showToast('Failed to remove document', 'error');
    }
  };

  // User info submission handler
  const handleUserInfoSubmit = (userInfoData) => {
    setUserInfo(userInfoData);
    setShowUserInfoModal(false);
    showToast(`Welcome ${userInfoData.name}! Your session is now personalized.`, 'success');
    
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: `Welcome ${userInfoData.name}! 👋 I'm excited to help you with "${userInfoData.purpose}". Let's get started!`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, welcomeMessage]);
  };

  // Feedback submission handler
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      console.log('Feedback submitted:', feedbackData);
      showToast('Thank you for your feedback!', 'success');
      
      // Could integrate with analytics or logging service here
    } catch (error) {
      console.error('Feedback submission failed:', error);
    }
  };
  // Voice input handlers (Updated to use Web Speech Service)
  const startVoiceInput = () => {
    handleVoiceToggle();
  };

  const stopVoiceInput = () => {
    handleVoiceToggle();
  };  const handleSendMessage = async (messageText = null) => {
    const messageToSend = messageText || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    // Track conversation start
    if (!conversationStartTime) {
      setConversationStartTime(new Date());
    }

    // Track message analytics
    setMessageCount(prev => prev + 1);
    analyticsService.trackEngagement('message_sent', 1);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputMessage(''); // Only clear if not from voice
    setIsTyping(true);
    setIsLoading(true);

    const responseStartTime = Date.now();

    try {
      const aiResponseData = await getAIResponse(messageToSend);
      const responseTime = Date.now() - responseStartTime;
      
      // Track AI performance
      analyticsService.trackAIPerformance({
        responseTime,
        tokenCount: aiResponseData.tokenCount || messageToSend.length + (aiResponseData.content?.length || 0),
        confidence: aiResponseData.confidence || 0.8,
        model: 'gemini-1.5-flash',
        success: true
      });
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseData.content || aiResponseData,
        timestamp: new Date(),
        ragUsed: aiResponseData.ragUsed || false,
        relevantDocuments: aiResponseData.relevantDocuments || []
      };

      setMessages(prev => [...prev, aiResponse]);

      // Auto-speak AI responses if enabled using Web Speech Service
      if (settings.autoSpeak && settings.voiceEnabled && speechSupport.textToSpeech) {
        try {
          setIsSpeaking(true);
          await webSpeechService.speak(aiResponse.content, {
            rate: 1.1,
            pitch: 1,
            volume: 0.8
          });
          setIsSpeaking(false);
          showToast('🔊 AI response spoken', 'success');
        } catch (speechError) {
          setIsSpeaking(false);
          console.error('TTS Error:', speechError);
          showToast('TTS error: ' + speechError.message, 'error');
        }
      }

      // Show RAG notification if used
      if (aiResponseData.ragUsed && aiResponseData.relevantDocuments?.length > 0) {
        showToast(`📚 Response enhanced with ${aiResponseData.relevantDocuments.length} document(s)`, 'info');
      }

      if (isMinimized) {
        setHasNewMessage(true);
        showToast('New AI message received!', 'info');
      }
    } catch (error) {
      console.error('Message handling error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      showToast('Error processing message. Please try again.', 'error');
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      help: 'How can you help me?',
      document: 'Tell me about your document analysis capabilities',
      analysis: 'What AI analysis features do you offer?',
      ideas: 'I need some creative ideas and inspiration'
    };

    setInputMessage(actionMessages[action]);
    setTimeout(() => handleSendMessage(), 100);
  };
  const toggleChatbot = () => {
    if (isOpen) {
      // Track conversation completion when closing
      if (conversationStartTime && messageCount > 0) {
        const duration = (Date.now() - conversationStartTime.getTime()) / 1000; // in seconds
        analyticsService.trackConversation({
          duration,
          messageCount,
          voiceUsed: voiceUsageCount > 0,
          documentsUsed: documentsUsedInSession,
          sessionId
        });
        
        // Reset conversation tracking
        setConversationStartTime(null);
        setMessageCount(0);
        setVoiceUsageCount(0);
        setDocumentsUsedInSession(false);
      }
    }
    
    setIsOpen(!isOpen);
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  const minimizeChatbot = () => {
    // Don't end conversation when minimizing, just hide
    setIsMinimized(true);
    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };
  const exportChat = () => {
    const chatText = messages.map(msg => 
      `${msg.type === 'user' ? 'You' : 'AI Assistant'} (${formatTime(msg.timestamp)}):\n${msg.content}\n`
    ).join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `real-it-solutions-ai-chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Chat exported successfully!', 'success');
  };
  const clearChat = () => {
    if (confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {      setMessages([
        {
          id: 1,
          type: 'ai',
          content: 'Hello! 👋 I\'m your Real IT Solutions AI assistant. How can I help you today?',
          timestamp: new Date()
        }
      ]);
      setSuggestions([]);
      showToast('Chat cleared successfully!', 'info');
    }
  };  // Voice Control Functions
  const handleVoiceToggle = async () => {
    if (!speechSupport.speechToText) {
      showToast('Speech recognition is not supported in this browser', 'error');
      return;
    }

    if (isListening) {
      webSpeechService.stopListening();
      setIsListening(false);
      analyticsService.trackVoiceUsage('stt_end');
    } else {
      try {
        await webSpeechService.startListening();
        setVoiceUsageCount(prev => prev + 1);
        analyticsService.trackVoiceUsage('stt_start');
        analyticsService.trackEngagement('voice_used', 1);
        showToast('🎤 Listening... Speak now!', 'info');
      } catch (error) {
        showToast(`Voice error: ${error.message}`, 'error');
        setVoiceError(error.message);
      }
    }
  };

  const handleSpeakResponse = async (text) => {
    if (!speechSupport.textToSpeech) {
      showToast('Text-to-speech is not supported in this browser', 'error');
      return;
    }

    if (isSpeaking) {
      webSpeechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await webSpeechService.speak(text);
      setIsSpeaking(false);
    } catch (error) {
      setIsSpeaking(false);
      showToast(`TTS error: ${error.message}`, 'error');
    }
  };

  const startConversationMode = async () => {
    if (!speechSupport.fullSupport) {
      showToast('Full voice conversation requires both speech recognition and synthesis', 'error');
      return;
    }

    try {
      setVoiceModeActive(true);
      const conversation = await webSpeechService.startConversationMode();
      showToast('🗣️ Conversation mode active! Speak freely.', 'success');
      
      // Store the stop function for later use
      window.stopConversation = conversation.stop;
    } catch (error) {
      setVoiceModeActive(false);
      showToast(`Conversation mode error: ${error.message}`, 'error');
    }
  };

  const stopConversationMode = () => {
    if (window.stopConversation) {
      window.stopConversation();
      window.stopConversation = null;
    }
    setVoiceModeActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    showToast('Conversation mode stopped', 'info');
  };

  // Voice Test Functions
  const testVoiceFeatures = async () => {
    const ttsResult = await webSpeechService.testTTS();
    const sttResult = await webSpeechService.testSTT();
    
    showToast(`TTS: ${ttsResult.success ? 'Working' : 'Failed'}, STT: ${sttResult.success ? 'Working' : 'Failed'}`, 
              ttsResult.success && sttResult.success ? 'success' : 'warning');
  };

  return (
    <>
      <ToastContainer />
      {/* Enhanced Floating Chat Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >        <motion.button
          onClick={toggleChatbot}
          className="chatbot-floating-button relative w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center group overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated Background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Main Icon */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className="relative z-10"
          >
            <Icon 
              name={isOpen ? 'X' : 'MessageCircle'} 
              size={24} 
              color="white" 
            />
          </motion.div>

          {/* Notification Badge */}
          <AnimatePresence>
            {hasNewMessage && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
              >
                <span className="text-white text-xs font-bold">!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse Ring */}
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-white opacity-60"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          
          {/* Gemini Badge */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <span className="text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">G</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {isOpen && (          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="chatbot-window fixed bottom-24 right-6 w-[500px] h-[650px] sm:w-[550px] sm:h-[700px] md:bottom-6 md:w-[600px] md:h-[750px] max-sm:bottom-6 max-sm:right-4 max-sm:left-4 max-sm:w-auto max-sm:h-[600px] chatbot-glass-effect rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
          >            {/* Enhanced Header */}
            <div className="chatbot-header-pattern bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 p-4 text-white relative overflow-hidden">
              {/* Animated Background Pattern */}
              <motion.div 
                className="absolute inset-0 opacity-10"
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                  backgroundSize: '20px 20px'
                }}
              />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon name="Bot" size={20} color="white" />
                  </motion.div>                  <div>
                    <h3 className="font-semibold text-lg flex items-center space-x-2">
                      <span>Real IT Solutions AI</span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm opacity-90">
                        {ragEnabled ? 'RAG Enhanced' : 'AI Assistant'}
                      </span>                      {uploadedDocuments.length > 0 && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          📄 {uploadedDocuments.length} doc{uploadedDocuments.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {/* Voice Status Indicators */}
                      {settings.voiceEnabled && (speechSupport.speechToText || speechSupport.textToSpeech) && (
                        <div className="flex items-center space-x-1">
                          {voiceModeActive && (
                            <span className="text-xs bg-green-400/20 px-2 py-1 rounded-full flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                              <span>Voice Chat</span>
                            </span>
                          )}
                          {(isListening || isSpeaking) && !voiceModeActive && (
                            <span className="text-xs bg-blue-400/20 px-2 py-1 rounded-full flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                              <span>{isListening ? 'Listening' : 'Speaking'}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                  <div className="flex items-center space-x-2">                  <motion.button
                    onClick={() => setShowFileUpload(!showFileUpload)}
                    className={`p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 ${showFileUpload ? 'bg-white/20' : ''}`}
                    title="Upload Documents"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon name="Upload" size={16} color="white" />
                  </motion.button>                  <motion.button
                    onClick={() => setShowDashboard(!showDashboard)}
                    className={`p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 ${showDashboard ? 'bg-white/20' : ''}`}
                    title="Analytics Dashboard"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon name="BarChart3" size={16} color="white" />
                  </motion.button>
                  <motion.button
                    onClick={() => setShowEnhancedVoicePanel(!showEnhancedVoicePanel)}
                    className={`p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 ${showEnhancedVoicePanel ? 'bg-white/20' : ''}`}
                    title="Enhanced Voice Panel"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon name="Mic" size={16} color="white" />
                  </motion.button>
                  <motion.button
                    onClick={exportChat}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                    title="Export Chat"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon name="Download" size={16} color="white" />
                  </motion.button>
                  <motion.button
                    onClick={clearChat}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                    title="Clear Chat"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon name="Trash2" size={16} color="white" />
                  </motion.button>
                  <motion.button
                    onClick={() => setShowSettings(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                    title="Settings"
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon name="Settings" size={16} color="white" />
                  </motion.button>
                  <motion.button
                    onClick={minimizeChatbot}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                    title="Minimize"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon name="Minus" size={16} color="white" />
                  </motion.button>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                    title="Close"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon name="X" size={16} color="white" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.action}
                    onClick={() => handleQuickAction(action.action)}
                    className={`flex items-center space-x-2 p-2 bg-gradient-to-r ${action.gradient} text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium`}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Icon name={action.icon} size={14} />
                    <span className="truncate">{action.text}</span>
                  </motion.button>
                ))}
              </div>            </div>

            {/* File Upload Section */}
            <AnimatePresence>
              {showFileUpload && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-2"
                >
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    onFileRemove={handleFileRemove}
                    uploadedFiles={uploadedDocuments}
                    maxFiles={5}
                    sessionId={sessionId}
                    className="border-2 border-dashed border-blue-200 rounded-lg"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50 min-h-0 chatbot-scroll-smooth">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-md'
                        : message.type === 'system'
                        ? 'bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 text-gray-800 rounded-tl-md'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-md'
                    }`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({children}) => <p className="mb-1 last:mb-0 text-sm leading-relaxed">{children}</p>,
                          strong: ({children}) => <strong className={`font-semibold ${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>{children}</strong>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-1 space-y-0.5 text-sm">{children}</ul>,
                          li: ({children}) => <li className="text-sm">{children}</li>,
                          code: ({children, inline}) => 
                            inline ? 
                              <code className={`px-1 py-0.5 rounded text-xs font-mono ${message.type === 'user' ? 'bg-blue-600' : 'bg-gray-100'}`}>{children}</code> :
                              <code className={`block p-2 rounded text-xs font-mono whitespace-pre-wrap ${message.type === 'user' ? 'bg-blue-600' : 'bg-gray-100'}`}>{children}</code>
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      
                      {/* RAG Enhancement Indicator */}
                      {message.ragUsed && message.relevantDocuments && (
                        <div className="mt-2 text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
                          📚 Enhanced with {message.relevantDocuments.length} document source{message.relevantDocuments.length !== 1 ? 's' : ''}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className={`text-xs ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                          <div className="flex items-center space-x-2">
                          {/* Voice/TTS Button for AI messages */}
                          {message.type === 'ai' && speechSupport.textToSpeech && (
                            <motion.button
                              onClick={() => handleSpeakResponse(message.content)}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                              title={isSpeaking ? "Stop speaking" : "Speak this message"}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Icon 
                                name={isSpeaking ? "VolumeX" : "Volume2"} 
                                size={14} 
                                className={isSpeaking ? "text-red-500" : ""}
                              />
                            </motion.button>
                          )}
                          
                          {/* Moderation Panel for AI messages */}
                          {message.type === 'ai' && (
                            <ModerationPanel
                              messageId={message.id}
                              messageContent={message.content}
                              onFeedbackSubmit={handleFeedbackSubmit}
                              className="relative"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Enhanced Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <motion.div 
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div 
                            className="w-2 h-2 bg-purple-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div 
                            className="w-2 h-2 bg-pink-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>              <div ref={messagesEndRef} />
            </div>

            {/* AI Insights Panel */}
            <AnimatePresence>
              {messages.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-4"
                >
                  <AIInsights messages={messages} isVisible={true} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Suggestions */}
            {suggestions.length > 0 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pb-2"
              >
                <div className="text-xs text-gray-500 mb-2 flex items-center space-x-1">
                  <Icon name="Lightbulb" size={12} />
                  <span>Suggested questions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        setInputMessage(suggestion);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs hover:from-blue-200 hover:to-purple-200 transition-all duration-200 border border-blue-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Enhanced Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {/* Voice Error */}              {voiceError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                >
                  {voiceError}
                </motion.div>
              )}
              
              {/* Enhanced Voice Panel */}
              <AnimatePresence>
                {showEnhancedVoicePanel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3"
                  >
                    <EnhancedVoicePanel
                      isListening={isListening}
                      isSpeaking={isSpeaking}
                      isConversationMode={voiceModeActive}
                      speechSupport={speechSupport}
                      onVoiceToggle={handleVoiceToggle}
                      onSpeakerToggle={() => setIsSpeaking(!isSpeaking)}
                      onConversationToggle={voiceModeActive ? stopConversationMode : startConversationMode}
                      onTestVoice={testVoiceFeatures}
                      voiceError={voiceError}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Voice Status */}
              {isListening && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-600 flex items-center space-x-2"
                >
                  <motion.div 
                    className="w-2 h-2 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span>Listening... Speak now</span>
                </motion.div>              )}

              {/* Voice Controls Panel */}
              {settings.voiceEnabled && (speechSupport.speechToText || speechSupport.textToSpeech) && (
                <motion.div 
                  className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon name="Volume2" size={16} className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Voice Controls</span>
                      <div className="flex space-x-1">
                        {speechSupport.speechToText && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">STT</span>
                        )}
                        {speechSupport.textToSpeech && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">TTS</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Conversation Mode Toggle */}
                      {speechSupport.fullSupport && (
                        <motion.button
                          onClick={voiceModeActive ? stopConversationMode : startConversationMode}
                          className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                            voiceModeActive 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title={voiceModeActive ? "Stop conversation mode" : "Start conversation mode"}
                        >
                          {voiceModeActive ? "Stop Chat" : "Voice Chat"}
                        </motion.button>
                      )}
                      
                      {/* Voice Test Button */}
                      <motion.button
                        onClick={testVoiceFeatures}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Test voice features"
                      >
                        Test
                      </motion.button>
                    </div>
                  </div>

                  {/* Voice Status Indicators */}
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                    {isListening && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span>Listening</span>
                      </div>
                    )}
                    {isSpeaking && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Speaking</span>
                      </div>
                    )}
                    {voiceModeActive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Voice Chat Active</span>
                      </div>
                    )}
                    {voiceError && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-600">Error: {voiceError}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything... (Ctrl+K to toggle, Ctrl+M for voice)"
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
                  />                  <motion.button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title={isListening ? "Stop voice input" : "Voice input (Click to speak)"}
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    disabled={!settings.voiceEnabled || !speechSupport.speechToText}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon 
                      name={isListening ? "MicOff" : "Mic"} 
                      size={16} 
                      className={`${isListening ? "text-red-500" : ""} ${!speechSupport.speechToText ? "opacity-50" : ""}`}
                    />
                  </motion.button>
                </div>
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                >
                  {isLoading ? (
                    <motion.div 
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Icon name="Send" size={16} />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <ChatbotSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Enhanced Minimized Notification */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 z-40 cursor-pointer"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Icon name="MessageCircle" size={14} color="white" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-800">Real IT Solutions AI</span>
                {hasNewMessage && (
                  <motion.div 
                    className="w-2 h-2 bg-red-500 rounded-full ml-2 inline-block"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}      </AnimatePresence>      {/* User Info Modal */}
      <UserInfoModal
        isOpen={showUserInfoModal}
        onClose={() => setShowUserInfoModal(false)}
        onSubmit={handleUserInfoSubmit}
        sessionId={sessionId}
        required={true}
      />

      {/* Analytics Dashboard Modal */}
      <AnimatePresence>
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDashboard(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600">
                  <h2 className="text-2xl font-bold text-white">AI Analytics Dashboard</h2>
                  <button
                    onClick={() => setShowDashboard(false)}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Icon name="X" size={24} />
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  <AnalyticsDashboard />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedFloatingChatbot;
