import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Header from 'components/ui/Header';
import MessageBubble from './components/MessageBubble';
import VoiceInterface from './components/VoiceInterface';
import DocumentPanel from './components/DocumentPanel';
import TypingIndicator from './components/TypingIndicator';
import { chatWithHistory } from 'services/geminiService';

const ChatInterface = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [conversationTitle, setConversationTitle] = useState('New Conversation');
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Initial welcome message
  const initialMessage = {
    id: 1,
    type: 'ai',
    content: `Hello! I'm your AI assistant powered by Gemini. I can help you analyze documents, answer questions, and provide insights. You can upload documents and ask me questions about their content.\n\nHow can I assist you today?`,
    timestamp: new Date(),
    citations: []
  };

  // Mock documents
  const mockDocuments = [
    {
      id: 1,
      name: 'Q3_Financial_Report.pdf',
      size: '2.4 MB',
      uploadDate: new Date(Date.now() - 86400000),
      status: 'processed',
      pages: 15,
      type: 'pdf'
    },
    {
      id: 2,
      name: 'Market_Analysis_2024.docx',
      size: '1.8 MB',
      uploadDate: new Date(Date.now() - 172800000),
      status: 'processed',
      pages: 8,
      type: 'docx'
    },
    {
      id: 3,
      name: 'Product_Roadmap.txt',
      size: '156 KB',
      uploadDate: new Date(Date.now() - 259200000),
      status: 'processed',
      pages: 1,
      type: 'txt'
    }
  ];

  useEffect(() => {
    setMessages([initialMessage]);
    setSelectedDocuments(mockDocuments);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Use Gemini AI to generate a response
      const { response, updatedHistory } = await chatWithHistory(inputMessage, chatHistory);
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date(),
        citations: selectedDocuments.length > 0 ? [
          { document: selectedDocuments[0].name, page: Math.floor(Math.random() * 10) + 1, section: 'Relevant Section' }
        ] : []
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setChatHistory(updatedHistory);
    } catch (error) {
      console.error('Error getting response from Gemini:', error);
      
      // Show error message
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        citations: []
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  const handleDocumentUpload = () => {
    navigate('/document-management');
  };

  const handleExportConversation = () => {
    const conversationData = {
      title: conversationTitle,
      messages: messages,
      exportDate: new Date().toISOString(),
      documents: selectedDocuments
    };
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16 flex h-screen">
        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${showDocumentPanel ? 'lg:mr-80' : ''}`}>
          {/* Chat Header */}
          <div className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard-home')}
                className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-all duration-200"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Icon name="MessageCircle" size={16} color="white" />
                </div>
                <div>
                  <h1 className="font-semibold text-text-primary">{conversationTitle}</h1>
                  <p className="text-xs text-text-secondary">
                    {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} attached
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDocumentPanel(!showDocumentPanel)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showDocumentPanel 
                    ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-secondary-50'
                }`}
              >
                <Icon name="FileText" size={20} />
              </button>
              
              <button
                onClick={handleVoiceToggle}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isVoiceMode 
                    ? 'bg-accent text-white' :'text-text-secondary hover:text-text-primary hover:bg-secondary-50'
                }`}
              >
                <Icon name="Mic" size={20} />
              </button>

              <div className="relative">
                <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-all duration-200">
                  <Icon name="MoreVertical" size={20} />
                </button>
                
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-elevation-4 py-2 z-50 hidden group-hover:block">
                  <button
                    onClick={handleExportConversation}
                    className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-secondary-50 flex items-center space-x-2"
                  >
                    <Icon name="Download" size={16} />
                    <span>Export Conversation</span>
                  </button>
                  <button
                    onClick={() => navigate('/conversation-history')}
                    className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-secondary-50 flex items-center space-x-2"
                  >
                    <Icon name="History" size={16} />
                    <span>View History</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Interface Overlay */}
          {isVoiceMode && (
            <VoiceInterface
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              onClose={() => setIsVoiceMode(false)}
            />
          )}

          {/* Input Area */}
          {!isVoiceMode && (
            <div className="bg-surface border-t border-border px-4 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-3">
                  <button
                    onClick={handleDocumentUpload}
                    className="p-3 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-all duration-200 flex-shrink-0"
                  >
                    <Icon name="Paperclip" size={20} />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value);
                        adjustTextareaHeight();
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your documents..."
                      className="w-full px-4 py-3 bg-secondary-50 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[48px] max-h-[120px]"
                      rows={1}
                    />
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className={`p-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                      inputMessage.trim()
                        ? 'bg-primary text-white hover:bg-primary-700 shadow-elevation-2'
                        : 'bg-secondary-100 text-text-secondary cursor-not-allowed'
                    }`}
                  >
                    <Icon name="Send" size={20} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
                  <div className="flex items-center space-x-4">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    {selectedDocuments.length > 0 && (
                      <span className="flex items-center space-x-1">
                        <Icon name="FileText" size={12} />
                        <span>{selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} available</span>
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleVoiceToggle}
                    className="flex items-center space-x-1 text-accent hover:text-accent-600 transition-colors duration-200"
                  >
                    <Icon name="Mic" size={12} />
                    <span>Voice mode</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Document Panel */}
        <DocumentPanel
          isOpen={showDocumentPanel}
          documents={selectedDocuments}
          onClose={() => setShowDocumentPanel(false)}
          onDocumentSelect={(doc) => console.log('Selected document:', doc)}
        />
      </div>
    </div>
  );
};

export default ChatInterface;