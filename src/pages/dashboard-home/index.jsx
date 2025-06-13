import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import Icon from 'components/AppIcon';

import RecentActivity from './components/RecentActivity';
import QuickStats from './components/QuickStats';
import DocumentUpload from './components/DocumentUpload';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Mock data for recent conversations
  const recentConversations = [
    {
      id: 1,
      title: "Financial Report Analysis",
      preview: "Can you summarize the key findings from the Q3 financial report?",
      timestamp: new Date(Date.now() - 3600000),
      documentCount: 3,
      messageCount: 12,
      status: "completed",
      documents: ["Q3_Financial_Report.pdf", "Budget_Analysis.xlsx"]
    },
    {
      id: 2,
      title: "Research Paper Discussion",
      preview: "What are the main conclusions about climate change impacts?",
      timestamp: new Date(Date.now() - 7200000),
      documentCount: 2,
      messageCount: 8,
      status: "active",
      documents: ["Climate_Research_2024.pdf", "Environmental_Data.csv"]
    },
    {
      id: 3,
      title: "Legal Document Review",
      preview: "Please explain the contract terms in section 4.2",
      timestamp: new Date(Date.now() - 86400000),
      documentCount: 1,
      messageCount: 15,
      status: "completed",
      documents: ["Service_Agreement.pdf"]
    },
    {
      id: 4,
      title: "Marketing Strategy Analysis",
      preview: "How can we improve our customer acquisition strategy?",
      timestamp: new Date(Date.now() - 172800000),
      documentCount: 4,
      messageCount: 20,
      status: "completed",
      documents: ["Marketing_Plan.pdf", "Customer_Data.xlsx", "Competitor_Analysis.pdf"]
    }
  ];

  // Mock data for quick stats
  const quickStats = {
    totalDocuments: 47,
    totalConversations: 23,
    documentsThisWeek: 8,
    conversationsThisWeek: 12,
    averageResponseTime: "2.3s",
    successRate: "98.5%"
  };

  const handleStartNewChat = () => {
    navigate('/chat-interface');
  };

  const handleUploadDocuments = () => {
    navigate('/document-management');
  };

  const handleViewAllConversations = () => {
    navigate('/conversation-history');
  };

  const handleContinueConversation = (conversationId) => {
    navigate(`/chat-interface?conversation=${conversationId}`);
  };

  const toggleVoiceRecording = () => {
    setIsVoiceRecording(!isVoiceRecording);
    if (!isVoiceRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsVoiceRecording(false);
        navigate('/chat-interface');
      }, 3000);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <main className="ml-0 lg:ml-64 pt-16">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  Welcome back! 👋
                </h1>
                <p className="text-text-secondary">
                  Ready to explore your documents with AI assistance
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <button
                  onClick={toggleVoiceRecording}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isVoiceRecording
                      ? 'bg-error text-white shadow-elevation-3 animate-pulse'
                      : 'bg-accent text-white hover:bg-accent-600 shadow-elevation-2'
                  }`}
                  title={isVoiceRecording ? 'Stop Recording' : 'Start Voice Recording'}
                >
                  <Icon name={isVoiceRecording ? 'MicOff' : 'Mic'} size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-3 space-y-8">
              {/* Document Upload Section */}
              <DocumentUpload 
                onUpload={handleUploadDocuments}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
              />

              {/* Quick Actions */}
              <div className="bg-surface rounded-xl shadow-elevation-2 p-6 border border-border">
                <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={handleStartNewChat}
                    className="flex items-center space-x-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-100 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Icon name="MessageCircle" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-primary">Start New Chat</p>
                      <p className="text-sm text-text-secondary">Begin AI conversation</p>
                    </div>
                  </button>

                  <button
                    onClick={handleUploadDocuments}
                    className="flex items-center space-x-3 p-4 bg-accent-50 hover:bg-accent-100 rounded-lg border border-accent-100 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-accent text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Icon name="Upload" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-primary">Upload Documents</p>
                      <p className="text-sm text-text-secondary">Add new files</p>
                    </div>
                  </button>

                  <button
                    onClick={handleViewAllConversations}
                    className="flex items-center space-x-3 p-4 bg-success-50 hover:bg-success-100 rounded-lg border border-success-100 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-success text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Icon name="Clock" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-primary">View History</p>
                      <p className="text-sm text-text-secondary">Past conversations</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Conversations */}
              <div className="bg-surface rounded-xl shadow-elevation-2 p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-text-primary">Recent Conversations</h2>
                  <button
                    onClick={handleViewAllConversations}
                    className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {recentConversations.slice(0, 3).map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-4 border border-border rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleContinueConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors duration-200">
                              {conversation.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              conversation.status === 'active' ?'bg-success-100 text-success-700' :'bg-secondary-100 text-secondary-700'
                            }`}>
                              {conversation.status}
                            </span>
                          </div>
                          <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                            {conversation.preview}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-text-secondary">
                            <span className="flex items-center space-x-1">
                              <Icon name="FileText" size={14} />
                              <span>{conversation.documentCount} docs</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Icon name="MessageSquare" size={14} />
                              <span>{conversation.messageCount} messages</span>
                            </span>
                            <span>{formatTimeAgo(conversation.timestamp)}</span>
                          </div>
                        </div>
                        <Icon 
                          name="ChevronRight" 
                          size={20} 
                          className="text-text-secondary group-hover:text-primary transition-colors duration-200" 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {recentConversations.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="MessageCircle" size={32} className="text-secondary-400" />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">No conversations yet</h3>
                    <p className="text-text-secondary mb-4">Start your first AI conversation by uploading a document</p>
                    <button
                      onClick={handleStartNewChat}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                      Start New Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="xl:col-span-1 space-y-6">
              {/* Quick Stats */}
              <QuickStats stats={quickStats} />

              {/* Recent Activity */}
              <RecentActivity />

              {/* AI Assistant Status */}
              <div className="bg-surface rounded-xl shadow-elevation-2 p-6 border border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-4">AI Assistant</h3>
                <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg border border-success-100">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-success-700">Online & Ready</p>
                    <p className="text-sm text-success-600">Response time: {quickStats.averageResponseTime}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-text-secondary">
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium text-success-600">{quickStats.successRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model Version:</span>
                    <span className="font-medium">GPT-4 Turbo</span>
                  </div>
                </div>
              </div>

              {/* Tips & Shortcuts */}
              <div className="bg-surface rounded-xl shadow-elevation-2 p-6 border border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Tips & Shortcuts</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <Icon name="Lightbulb" size={16} className="text-warning-500 mt-0.5" />
                    <p className="text-text-secondary">
                      Upload multiple documents to compare and analyze them together
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Mic" size={16} className="text-accent mt-0.5" />
                    <p className="text-text-secondary">
                      Use voice commands to quickly start conversations
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Search" size={16} className="text-primary mt-0.5" />
                    <p className="text-text-secondary">
                      Search through your conversation history to find specific information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={handleStartNewChat}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-primary text-white rounded-full shadow-elevation-4 hover:bg-primary-700 transition-all duration-200 flex items-center justify-center z-50"
      >
        <Icon name="Plus" size={24} />
      </button>
    </div>
  );
};

export default DashboardHome;