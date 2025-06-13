import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './AppIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import floatingChatbotAI from '../services/floatingChatbotAI';
import ChatbotSettings from './ChatbotSettings';
import voiceInterface from '../services/voiceInterface';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. How can I help you today? 🤖',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
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

  // Quick action buttons
  const quickActions = [
    { icon: 'HelpCircle', text: 'How can I help?', action: 'help' },
    { icon: 'FileText', text: 'Document Q&A', action: 'document' },
    { icon: 'Brain', text: 'AI Analysis', action: 'analysis' },
    { icon: 'Lightbulb', text: 'Get Ideas', action: 'ideas' }
  ];  // Predefined responses for demo - now using advanced AI
  const getAIResponse = async (userMessage) => {
    try {
      const aiResponse = await floatingChatbotAI.processMessage(userMessage, settings);
      setSuggestions(aiResponse.suggestions || []);
      return aiResponse.content;
    } catch (error) {
      console.error('AI Response Error:', error);
      return "I apologize, but I'm having trouble processing your request. Please try again or rephrase your question.";
    }
  };

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
      // Ctrl/Cmd + K to toggle chatbot
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        toggleChatbot();
      }
      
      // Escape to close chatbot
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
          // Auto-send if user pauses
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
      // Get AI response
      const aiResponseContent = await getAIResponse(inputMessage);
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date()
      };      setMessages(prev => [...prev, aiResponse]);

      // Auto-speak AI responses if enabled
      if (settings.autoSpeak && settings.voiceEnabled) {
        voiceInterface.speak(aiResponseContent, {
          rate: 1.1,
          pitch: 1,
          volume: 0.8
        });
      }

      // Show notification if chatbot is minimized
      if (isMinimized) {
        setHasNewMessage(true);
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
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };
  const handleQuickAction = (action) => {
    const actionMessages = {
      help: 'How can you help me?',
      document: 'Tell me about document analysis features',
      analysis: 'What AI analysis capabilities do you have?',
      ideas: 'I need some creative ideas'
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
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {
      setMessages([
        {
          id: 1,
          type: 'ai',
          content: 'Hello! I\'m your AI assistant. How can I help you today? 🤖',
          timestamp: new Date()
        }
      ]);
      setSuggestions([]);
    }
  };

  return (
    <>      {/* Floating Chat Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          onClick={toggleChatbot}
          className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
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

          {/* Ripple Animation */}
          <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
          
          {/* Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-300"></div>
        </motion.button>
      </motion.div>      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-96 h-[32rem] bg-white border border-gray-200 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 text-white relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12 animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon name="Bot" size={20} color="white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-lg">AI Assistant</h3>
                    <div className="flex items-center space-x-1">
                      <motion.div 
                        className="w-2 h-2 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      ></motion.div>
                      <span className="text-sm opacity-90">Online & Ready</span>
                    </div>
                  </div>
                </div><div className="flex items-center space-x-2">
                <button
                  onClick={exportChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  title="Export Chat"
                >
                  <Icon name="Download" size={16} color="white" />
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  title="Clear Chat"
                >
                  <Icon name="Trash2" size={16} color="white" />
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  title="Settings"
                >
                  <Icon name="Settings" size={16} color="white" />
                </button>
                <button
                  onClick={minimizeChatbot}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  title="Minimize"
                >
                  <Icon name="Minus" size={16} color="white" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  title="Close"
                >
                  <Icon name="X" size={16} color="white" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-secondary-50 border-b border-border">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.action}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center space-x-2 p-2 bg-white border border-border rounded-lg hover:bg-primary hover:text-white transition-all duration-200 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon name={action.icon} size={14} />
                    <span className="truncate">{action.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-white rounded-tr-md'
                        : 'bg-secondary-100 text-text-primary rounded-tl-md'
                    }`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({children}) => <p className="mb-1 last:mb-0 text-sm leading-relaxed">{children}</p>,
                          strong: ({children}) => <strong className={`font-semibold ${message.type === 'user' ? 'text-white' : 'text-text-primary'}`}>{children}</strong>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-1 space-y-0.5 text-sm">{children}</ul>,
                          li: ({children}) => <li className="text-sm">{children}</li>
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      <div className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-primary-100' : 'text-text-secondary'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="bg-secondary-100 rounded-2xl rounded-tl-md px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>            {/* Suggestions */}
            {suggestions.length > 0 && !isTyping && settings.smartSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pb-2"
              >
                <div className="text-xs text-text-secondary mb-2">💡 Suggested questions:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        setInputMessage(suggestion);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs hover:bg-primary hover:text-white transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}            {/* Input Area */}
            <div className="p-4 border-t border-border bg-surface">
              {/* Voice Error */}
              {voiceError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {voiceError}
                </div>
              )}
              
              {/* Voice Status */}
              {isListening && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-600 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening... Speak now</span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 pr-12 bg-secondary-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-text-secondary hover:text-primary transition-colors duration-200"
                    title={isListening ? "Stop voice input" : "Voice input"}
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    disabled={!settings.voiceEnabled}
                  >
                    <Icon 
                      name={isListening ? "MicOff" : "Mic"} 
                      size={16} 
                      className={isListening ? "text-red-500 animate-pulse" : ""} 
                    />
                  </button>
                </div>                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-12 h-12 bg-primary text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Icon name="Send" size={16} />
                  )}
                </motion.button>
              </div>
            </div>          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <ChatbotSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Minimized Notification */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 bg-surface border border-border rounded-lg shadow-elevation-2 p-3 z-40 cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <div className="flex items-center space-x-2">
              <Icon name="MessageCircle" size={16} className="text-primary" />
              <span className="text-sm text-text-primary">Chat minimized</span>
              {hasNewMessage && (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;
