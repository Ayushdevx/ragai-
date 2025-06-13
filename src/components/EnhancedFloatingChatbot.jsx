import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './AppIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import floatingChatbotAI from '../services/floatingChatbotAI';
import ChatbotSettings from './ChatbotSettings';
import voiceInterface from '../services/voiceInterface';
import { useToast } from './Toast';

const EnhancedFloatingChatbot = () => {
  const { showToast, ToastContainer } = useToast();
  const [isOpen, setIsOpen] = useState(false);  const [messages, setMessages] = useState([
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
    autoSpeak: false
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Enhanced AI response with Gemini
  const getAIResponse = async (userMessage) => {
    try {
      const aiResponse = await floatingChatbotAI.processMessage(userMessage, settings);
      setSuggestions(aiResponse.suggestions || []);
      return aiResponse.content;
    } catch (error) {
      console.error('AI Response Error:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }
  };

  // Voice input handlers
  const startVoiceInput = () => {
    if (!voiceInterface.isSupported) {
      setVoiceError('Voice input not supported in this browser');
      return;
    }

    setIsListening(true);
    setVoiceError(null);

    voiceInterface.startListening(
      (finalTranscript, interimTranscript) => {
        if (finalTranscript) {
          setInputMessage(finalTranscript);
          setIsListening(false);
          setTimeout(() => {
            if (finalTranscript && !isLoading) {
              handleSendMessage();
            }
          }, 1000);
        } else {
          setInputMessage(interimTranscript);
        }
      },
      (error) => {
        setIsListening(false);
        setVoiceError(`Voice error: ${error}`);
      }
    );
  };

  const stopVoiceInput = () => {
    voiceInterface.stopListening();
    setIsListening(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      const aiResponseContent = await getAIResponse(inputMessage);
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);      // Auto-speak AI responses if enabled
      if (settings.autoSpeak && settings.voiceEnabled) {
        voiceInterface.speak(aiResponseContent, {
          rate: 1.1,
          pitch: 1,
          volume: 0.8
        });
        showToast('🔊 AI response is being spoken', 'info');
      }

      if (isMinimized) {
        setHasNewMessage(true);
        showToast('New AI message received!', 'info');
      }    } catch (error) {
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
    setIsOpen(!isOpen);
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  const minimizeChatbot = () => {
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
                  </motion.div>
                  <div>                    <h3 className="font-semibold text-lg flex items-center space-x-2">
                      <span>Real IT Solutions AI</span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    </h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm opacity-90">Real IT Solutions AI</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
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
              </div>
            </div>            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50 min-h-0 chatbot-scroll-smooth">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-md'
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
                      <div className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
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
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

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
              {/* Voice Error */}
              {voiceError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                >
                  {voiceError}
                </motion.div>
              )}
              
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
                    placeholder="Ask me anything... (Ctrl+K to toggle)"
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
                  />
                  <motion.button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title={isListening ? "Stop voice input" : "Voice input"}
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    disabled={!settings.voiceEnabled}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon 
                      name={isListening ? "MicOff" : "Mic"} 
                      size={16} 
                      className={isListening ? "text-red-500" : ""} 
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
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedFloatingChatbot;
