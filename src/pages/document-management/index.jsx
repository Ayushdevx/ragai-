import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import Icon from 'components/AppIcon';

import DocumentCard from './components/DocumentCard';
import DocumentPreview from './components/DocumentPreview';
import UploadModal from './components/UploadModal';
import BulkActionBar from './components/BulkActionBar';

const DocumentManagement = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock documents data
  const mockDocuments = [
    {
      id: 1,
      name: "Annual Report 2024.pdf",
      type: "pdf",
      size: "2.4 MB",
      uploadDate: new Date(Date.now() - 86400000),
      status: "processed",
      thumbnail: "https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop",
      content: `This annual report provides a comprehensive overview of our company's performance throughout 2024. We have achieved significant milestones in revenue growth, customer acquisition, and market expansion.

Key highlights include:
• 35% increase in annual revenue
• Expansion into 12 new markets
• Launch of 5 innovative products
• 98% customer satisfaction rate

Our strategic initiatives have positioned us well for continued growth in the coming year.`,
      pages: 45,
      extractedText: true
    },
    {
      id: 2,
      name: "Project Proposal - AI Integration.docx",
      type: "docx",
      size: "1.8 MB",
      uploadDate: new Date(Date.now() - 172800000),
      status: "processing",
      thumbnail: "https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?w=400&h=300&fit=crop",
      content: `This proposal outlines the integration of artificial intelligence capabilities into our existing platform. The implementation will enhance user experience through intelligent automation and predictive analytics.

Project Scope:
• Machine learning model development
• Natural language processing integration
• Automated workflow optimization
• Real-time data analysis capabilities

Timeline: 6 months
Budget: $250,000
Expected ROI: 180% within first year`,
      pages: 12,
      extractedText: false
    },
    {
      id: 3,
      name: "Meeting Notes - Q4 Strategy.txt",
      type: "txt",
      size: "45 KB",
      uploadDate: new Date(Date.now() - 259200000),
      status: "processed",
      thumbnail: "https://images.pixabay.com/photo/2016/11/29/06/15/plans-1867745_1280.jpg?w=400&h=300&fit=crop",
      content: `Q4 Strategy Meeting Notes
Date: December 15, 2024
Attendees: Leadership Team

Key Discussion Points:
1. Market expansion opportunities in Southeast Asia
2. Product roadmap for 2025
3. Resource allocation for new initiatives
4. Customer feedback integration

Action Items:
• Conduct market research for expansion
• Finalize product specifications
• Hire additional development team members
• Implement customer feedback system`,
      pages: 1,
      extractedText: true
    },
    {
      id: 4,
      name: "Financial Analysis Q3.xlsx",
      type: "xlsx",
      size: "3.2 MB",
      uploadDate: new Date(Date.now() - 345600000),
      status: "failed",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      content: "Financial data and analysis for Q3 performance metrics.",
      pages: 8,
      extractedText: false
    },
    {
      id: 5,
      name: "User Research Report.pdf",
      type: "pdf",
      size: "5.1 MB",
      uploadDate: new Date(Date.now() - 432000000),
      status: "processed",
      thumbnail: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?w=400&h=300&fit=crop",
      content: `User Research Report - Q4 2024

Executive Summary:
Our comprehensive user research study involved 500+ participants across different demographics and usage patterns. The findings reveal significant insights into user behavior and preferences.

Key Findings:
• 78% of users prefer voice interaction over text input
• Mobile usage accounts for 65% of total interactions
• Document processing speed is the top priority for 82% of users
• Integration with existing workflows is crucial for adoption

Recommendations:
1. Prioritize voice interface improvements
2. Optimize mobile experience
3. Enhance processing speed algorithms
4. Develop better integration APIs`,
      pages: 28,
      extractedText: true
    },
    {
      id: 6,
      name: "Technical Specifications.md",
      type: "md",
      size: "156 KB",
      uploadDate: new Date(Date.now() - 518400000),
      status: "processed",
      thumbnail: "https://images.pixabay.com/photo/2016/11/30/20/58/programming-1873854_1280.png?w=400&h=300&fit=crop",
      content: `# Technical Specifications

## System Architecture
Our platform is built on a microservices architecture that ensures scalability and maintainability.

### Core Components:
- **API Gateway**: Handles all incoming requests and routing
- **Authentication Service**: Manages user authentication and authorization
- **Document Processing Service**: Handles file uploads and text extraction
- **AI Service**: Provides natural language processing capabilities
- **Database Layer**: Stores user data and document metadata

### Technology Stack:
- Frontend: React 18, TypeScript, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- AI/ML: Python, TensorFlow, OpenAI API
- Infrastructure: AWS, Docker, Kubernetes`,
      pages: 1,
      extractedText: true
    }
  ];

  const filterOptions = [
    { id: 'pdf', label: 'PDF', count: 2 },
    { id: 'docx', label: 'Word', count: 1 },
    { id: 'txt', label: 'Text', count: 1 },
    { id: 'xlsx', label: 'Excel', count: 1 },
    { id: 'md', label: 'Markdown', count: 1 },
    { id: 'processed', label: 'Processed', count: 4 },
    { id: 'processing', label: 'Processing', count: 1 },
    { id: 'failed', label: 'Failed', count: 1 }
  ];

  useEffect(() => {
    setDocuments(mockDocuments);
    setFilteredDocuments(mockDocuments);
  }, []);

  useEffect(() => {
    let filtered = documents;

    // Apply filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(doc => 
        activeFilters.includes(doc.type) || activeFilters.includes(doc.status)
      );
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return parseFloat(b.size) - parseFloat(a.size);
        case 'date':
        default:
          return b.uploadDate - a.uploadDate;
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, activeFilters, searchQuery, sortBy]);

  const handleFilterToggle = (filterId) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleDocumentSelect = (documentId) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleDocumentPreview = (document) => {
    setPreviewDocument(document);
    setIsPreviewOpen(true);
  };

  const handleDocumentDelete = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setSelectedDocuments(prev => prev.filter(id => id !== documentId));
  };

  const handleBulkDelete = () => {
    setDocuments(prev => prev.filter(doc => !selectedDocuments.includes(doc.id)));
    setSelectedDocuments([]);
    setIsBulkMode(false);
  };

  const handleDocumentRename = (documentId, newName) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId ? { ...doc, name: newName } : doc
      )
    );
  };

  const handleRetryProcessing = (documentId) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId ? { ...doc, status: 'processing' } : doc
      )
    );
  };

  const handleUseInChat = (document) => {
    navigate('/chat-interface', { state: { selectedDocument: document } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Document Management</h1>
                <p className="text-text-secondary">
                  Organize and manage your documents for AI processing
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-surface border border-border rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      viewMode === 'grid' ?'bg-primary text-white' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="Grid3X3" size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      viewMode === 'list' ?'bg-primary text-white' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="List" size={18} />
                  </button>
                </div>
                <button
                  onClick={() => setIsBulkMode(!isBulkMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isBulkMode
                      ? 'bg-accent text-white' :'bg-secondary-100 text-text-primary hover:bg-secondary-200'
                  }`}
                >
                  {isBulkMode ? 'Exit Bulk Mode' : 'Bulk Select'}
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Icon
                    name="Search"
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents and content..."
                    className="pl-10 pr-4 py-2 w-80 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">
                  {filteredDocuments.length} of {documents.length} documents
                </span>
                {activeFilters.length > 0 && (
                  <button
                    onClick={() => setActiveFilters([])}
                    className="text-sm text-primary hover:text-primary-700 transition-colors duration-200"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterToggle(filter.id)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    activeFilters.includes(filter.id)
                      ? 'bg-primary text-white' :'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className="bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full text-xs">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Selection Header */}
          {isBulkMode && (
            <div className="mb-6 p-4 bg-accent-50 border border-accent-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === filteredDocuments.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-text-primary">
                      Select All ({selectedDocuments.length} selected)
                    </span>
                  </label>
                </div>
                {selectedDocuments.length > 0 && (
                  <BulkActionBar
                    selectedCount={selectedDocuments.length}
                    onDelete={handleBulkDelete}
                    onDownload={() => console.log('Bulk download')}
                  />
                )}
              </div>
            </div>
          )}

          {/* Documents Grid/List */}
          {filteredDocuments.length > 0 ? (
            <div className={`${
              viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' :'space-y-4'
            }`}>
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  viewMode={viewMode}
                  isBulkMode={isBulkMode}
                  isSelected={selectedDocuments.includes(document.id)}
                  onSelect={() => handleDocumentSelect(document.id)}
                  onPreview={() => handleDocumentPreview(document)}
                  onDelete={() => handleDocumentDelete(document.id)}
                  onRename={(newName) => handleDocumentRename(document.id, newName)}
                  onRetry={() => handleRetryProcessing(document.id)}
                  onUseInChat={() => handleUseInChat(document)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-secondary-100 rounded-full flex items-center justify-center mb-6">
                <Icon name="FileText" size={32} className="text-text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {searchQuery || activeFilters.length > 0 ? 'No documents found' : 'No documents uploaded'}
              </h3>
              <p className="text-text-secondary mb-6">
                {searchQuery || activeFilters.length > 0
                  ? 'Try adjusting your search or filters' :'Upload your first document to get started with AI-powered analysis'
                }
              </p>
              {!searchQuery && activeFilters.length === 0 && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                >
                  Upload Document
                </button>
              )}
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-elevation-4 hover:bg-primary-700 hover:shadow-elevation-5 transition-all duration-200 flex items-center justify-center z-50"
        >
          <Icon name="Plus" size={24} />
        </button>

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <UploadModal
            onClose={() => setIsUploadModalOpen(false)}
            onUpload={(files) => {
              // Handle file upload
              console.log('Files uploaded:', files);
              setIsUploadModalOpen(false);
            }}
          />
        )}

        {/* Document Preview Modal */}
        {isPreviewOpen && previewDocument && (
          <DocumentPreview
            document={previewDocument}
            onClose={() => setIsPreviewOpen(false)}
            onUseInChat={() => handleUseInChat(previewDocument)}
          />
        )}
      </main>
    </div>
  );
};

export default DocumentManagement;