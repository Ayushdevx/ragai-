import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import ConversationCard from './components/ConversationCard';
import FilterSidebar from './components/FilterSidebar';
import SearchBar from './components/SearchBar';
import ExportModal from './components/ExportModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

const ConversationHistory = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: 'all',
    documentType: 'all',
    conversationLength: 'all',
    topicTags: []
  });
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  // Mock conversation data
  const mockConversations = [
    {
      id: 'conv_001',
      title: 'Financial Report Analysis Q3 2024',
      preview: `Can you analyze the key financial metrics from our Q3 report? I'm particularly interested in revenue growth and expense patterns.

The Q3 2024 financial report shows strong revenue growth of 23% compared to Q2, with total revenue reaching $2.4M. Key highlights include improved gross margins and controlled operational expenses.`,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      messageCount: 12,
      documents: [
        { name: 'Q3_Financial_Report.pdf', type: 'pdf', size: '2.4 MB' },
        { name: 'Revenue_Analysis.xlsx', type: 'excel', size: '1.1 MB' }
      ],
      tags: ['finance', 'quarterly-report', 'analysis'],
      duration: '45 minutes',
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isStarred: true
    },
    {
      id: 'conv_002',title: 'Marketing Strategy Discussion',
      preview: `I need help developing a comprehensive marketing strategy for our new product launch. What are the key components I should consider?

For a successful product launch, focus on these key components: target audience analysis, competitive positioning, multi-channel marketing approach, and measurable KPIs.`,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      messageCount: 8,
      documents: [
        { name: 'Market_Research.docx', type: 'word', size: '890 KB' },
        { name: 'Competitor_Analysis.pdf', type: 'pdf', size: '1.5 MB' }
      ],
      tags: ['marketing', 'strategy', 'product-launch'],
      duration: '32 minutes',
      lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isStarred: false
    },
    {
      id: 'conv_003',title: 'Technical Documentation Review',
      preview: `Please review this API documentation and suggest improvements for clarity and completeness.

I've reviewed your API documentation. Here are key areas for improvement: add more code examples, clarify error responses, and include rate limiting information.`,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      messageCount: 15,
      documents: [
        { name: 'API_Documentation_v2.md', type: 'markdown', size: '456 KB' },
        { name: 'Code_Examples.txt', type: 'text', size: '234 KB' }
      ],
      tags: ['technical', 'documentation', 'api'],
      duration: '1 hour 12 minutes',
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isStarred: true
    },
    {
      id: 'conv_004',
      title: 'Legal Contract Analysis',
      preview: `Can you help me understand the key terms and potential risks in this service agreement?

I've analyzed the service agreement. Key terms include liability limitations, termination clauses, and intellectual property rights. Here are the main risk areas to consider...`,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      messageCount: 6,
      documents: [
        { name: 'Service_Agreement_Draft.pdf', type: 'pdf', size: '1.8 MB' }
      ],
      tags: ['legal', 'contract', 'risk-analysis'],
      duration: '28 minutes',
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isStarred: false
    },
    {
      id: 'conv_005',title: 'Research Paper Summary',
      preview: `Please provide a comprehensive summary of this machine learning research paper, focusing on methodology and results.

This paper presents a novel approach to neural network optimization using adaptive learning rates. The methodology involves dynamic adjustment of learning parameters based on gradient variance...`,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      messageCount: 9,
      documents: [
        { name: 'ML_Research_Paper.pdf', type: 'pdf', size: '3.2 MB' },
        { name: 'Dataset_Analysis.csv', type: 'csv', size: '567 KB' }
      ],
      tags: ['research', 'machine-learning', 'academic'],
      duration: '52 minutes',
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isStarred: true
    },
    {
      id: 'conv_006',title: 'Project Planning Session',
      preview: `Help me create a detailed project timeline for our software development initiative, including milestones and resource allocation.

Based on your requirements, here's a comprehensive project timeline spanning 16 weeks with key milestones, resource allocation, and risk mitigation strategies...`,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      messageCount: 11,
      documents: [
        { name: 'Project_Requirements.docx', type: 'word', size: '1.3 MB' },
        { name: 'Resource_Plan.xlsx', type: 'excel', size: '789 KB' }
      ],
      tags: ['project-management', 'planning', 'timeline'],
      duration: '1 hour 5 minutes',
      lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isStarred: false
    }
  ];

  useEffect(() => {
    // Simulate loading conversations
    const loadConversations = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConversations(mockConversations);
      setFilteredConversations(mockConversations);
      setIsLoading(false);
    };

    loadConversations();
  }, []);

  useEffect(() => {
    filterAndSearchConversations();
  }, [searchQuery, selectedFilters, conversations, sortBy]);

  const filterAndSearchConversations = () => {
    let filtered = [...conversations];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(query) ||
        conv.preview.toLowerCase().includes(query) ||
        conv.tags.some(tag => tag.toLowerCase().includes(query)) ||
        conv.documents.some(doc => doc.name.toLowerCase().includes(query))
      );
    }

    // Apply date range filter
    if (selectedFilters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(conv => conv.timestamp >= filterDate);
    }

    // Apply document type filter
    if (selectedFilters.documentType !== 'all') {
      filtered = filtered.filter(conv => 
        conv.documents.some(doc => doc.type === selectedFilters.documentType)
      );
    }

    // Apply conversation length filter
    if (selectedFilters.conversationLength !== 'all') {
      switch (selectedFilters.conversationLength) {
        case 'short':
          filtered = filtered.filter(conv => conv.messageCount <= 5);
          break;
        case 'medium':
          filtered = filtered.filter(conv => conv.messageCount > 5 && conv.messageCount <= 15);
          break;
        case 'long':
          filtered = filtered.filter(conv => conv.messageCount > 15);
          break;
      }
    }

    // Apply topic tags filter
    if (selectedFilters.topicTags.length > 0) {
      filtered = filtered.filter(conv => 
        selectedFilters.topicTags.some(tag => conv.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'mostActive':
        filtered.sort((a, b) => b.messageCount - a.messageCount);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredConversations(filtered);
  };

  const handleConversationSelect = (conversationId) => {
    setSelectedConversations(prev => 
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedConversations.length === filteredConversations.length) {
      setSelectedConversations([]);
    } else {
      setSelectedConversations(filteredConversations.map(conv => conv.id));
    }
  };

  const handleContinueConversation = (conversationId) => {
    navigate(`/chat-interface?continue=${conversationId}`);
  };

  const handleDeleteConversation = (conversationId) => {
    setConversationToDelete(conversationId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
      setSelectedConversations(prev => prev.filter(id => id !== conversationToDelete));
    }
    setIsDeleteModalOpen(false);
    setConversationToDelete(null);
  };

  const handleBulkDelete = () => {
    if (selectedConversations.length > 0) {
      setConversations(prev => prev.filter(conv => !selectedConversations.includes(conv.id)));
      setSelectedConversations([]);
    }
  };

  const handleStarToggle = (conversationId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isStarred: !conv.isStarred }
        : conv
    ));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedFilters.dateRange !== 'all') count++;
    if (selectedFilters.documentType !== 'all') count++;
    if (selectedFilters.conversationLength !== 'all') count++;
    if (selectedFilters.topicTags.length > 0) count++;
    return count;
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      dateRange: 'all',
      documentType: 'all',
      conversationLength: 'all',
      topicTags: []
    });
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />
        <div className="ml-0 lg:ml-64 pt-16">
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-secondary-200 rounded w-1/3"></div>
              <div className="h-12 bg-secondary-200 rounded"></div>
              <div className="grid gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-secondary-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <div className="ml-0 lg:ml-64 pt-16">
        <div className="p-4 lg:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
                  Conversation History
                </h1>
                <p className="text-text-secondary">
                  Browse and manage your AI conversation history
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/chat-interface')}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  <Icon name="Plus" size={18} />
                  <span>New Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <SearchBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  placeholder="Search conversations, documents, or topics..."
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    getActiveFiltersCount() > 0
                      ? 'bg-primary-50 border-primary text-primary' :'bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-secondary-50'
                  }`}
                >
                  <Icon name="Filter" size={18} />
                  <span>Filters</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="px-2 py-1 text-xs bg-primary text-white rounded-full">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mostActive">Most Active</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-text-secondary">Active filters:</span>
                {selectedFilters.dateRange !== 'all' && (
                  <span className="px-3 py-1 bg-primary-100 text-primary text-sm rounded-full flex items-center space-x-1">
                    <span>Date: {selectedFilters.dateRange}</span>
                    <button
                      onClick={() => setSelectedFilters(prev => ({ ...prev, dateRange: 'all' }))}
                      className="hover:bg-primary-200 rounded-full p-0.5"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                )}
                {selectedFilters.documentType !== 'all' && (
                  <span className="px-3 py-1 bg-primary-100 text-primary text-sm rounded-full flex items-center space-x-1">
                    <span>Type: {selectedFilters.documentType}</span>
                    <button
                      onClick={() => setSelectedFilters(prev => ({ ...prev, documentType: 'all' }))}
                      className="hover:bg-primary-200 rounded-full p-0.5"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                )}
                {selectedFilters.topicTags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-primary-100 text-primary text-sm rounded-full flex items-center space-x-1">
                    <span>Tag: {tag}</span>
                    <button
                      onClick={() => setSelectedFilters(prev => ({ 
                        ...prev, 
                        topicTags: prev.topicTags.filter(t => t !== tag) 
                      }))}
                      className="hover:bg-primary-200 rounded-full p-0.5"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-6">
            {/* Filter Sidebar */}
            {isFilterSidebarOpen && (
              <div className="w-80 flex-shrink-0">
                <FilterSidebar
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  conversations={conversations}
                  onClose={() => setIsFilterSidebarOpen(false)}
                />
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Bulk Actions */}
              {selectedConversations.length > 0 && (
                <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary">
                      {selectedConversations.length} conversation{selectedConversations.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-primary hover:bg-primary-100 rounded transition-colors duration-200"
                      >
                        <Icon name="Download" size={16} />
                        <span>Export</span>
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-error hover:bg-error-50 rounded transition-colors duration-200"
                      >
                        <Icon name="Trash2" size={16} />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => setSelectedConversations([])}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-text-secondary hover:bg-secondary-100 rounded transition-colors duration-200"
                      >
                        <Icon name="X" size={16} />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Summary */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} found
                  {searchQuery && ` for "${searchQuery}"`}
                </div>
                
                {filteredConversations.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-primary hover:text-primary-700 transition-colors duration-200"
                  >
                    {selectedConversations.length === filteredConversations.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Conversations List */}
              {filteredConversations.length > 0 ? (
                <div className="space-y-4">
                  {filteredConversations.map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={selectedConversations.includes(conversation.id)}
                      onSelect={handleConversationSelect}
                      onContinue={handleContinueConversation}
                      onDelete={handleDeleteConversation}
                      onStarToggle={handleStarToggle}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                    <Icon name="MessageCircle" size={32} className="text-text-secondary" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {searchQuery || getActiveFiltersCount() > 0 ? 'No conversations found' : 'No conversations yet'}
                  </h3>
                  <p className="text-text-secondary mb-6">
                    {searchQuery || getActiveFiltersCount() > 0 
                      ? 'Try adjusting your search or filters to find what you\'re looking for.'
                      : 'Start your first AI conversation to see your history here.'
                    }
                  </p>
                  <button
                    onClick={() => navigate('/chat-interface')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    <Icon name="Plus" size={18} />
                    <span>Start New Conversation</span>
                  </button>
                </div>
              )}

              {/* Load More */}
              {hasMore && filteredConversations.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => {
                      setLoadingMore(true);
                      setTimeout(() => setLoadingMore(false), 1000);
                    }}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-surface border border-border text-text-primary rounded-lg hover:bg-secondary-50 transition-colors duration-200 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      'Load More Conversations'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          selectedConversations={selectedConversations}
          conversations={conversations}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
          conversationTitle={conversations.find(c => c.id === conversationToDelete)?.title}
        />
      )}
    </div>
  );
};

export default ConversationHistory;