import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const DocumentPreview = ({ document, onClose, onUseInChat }) => {
  const [activeTab, setActiveTab] = useState('preview');

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return 'FileText';
      case 'docx':
        return 'FileText';
      case 'txt':
        return 'FileText';
      case 'xlsx':
        return 'Sheet';
      case 'md':
        return 'FileCode';
      default:
        return 'File';
    }
  };

  const formatFileSize = (size) => {
    return size;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'text-success bg-success-50 border-success-100';
      case 'processing':
        return 'text-warning bg-warning-50 border-warning-100';
      case 'failed':
        return 'text-error bg-error-50 border-error-100';
      default:
        return 'text-text-secondary bg-secondary-50 border-secondary-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="bg-surface rounded-lg shadow-elevation-5 w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Icon name={getFileIcon(document.type)} size={24} className="text-text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">{document.name}</h2>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-text-secondary">{formatFileSize(document.size)}</span>
                  <span className="text-sm text-text-secondary">{formatDate(document.uploadDate)}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(document.status)}`}>
                    {document.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {document.status === 'processed' && (
                <button
                  onClick={onUseInChat}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                >
                  <Icon name="MessageCircle" size={18} />
                  <span>Use in Chat</span>
                </button>
              )}
              
              <button
                onClick={() => console.log('Download document:', document.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-text-primary rounded-lg font-medium hover:bg-secondary-200 transition-colors duration-200"
              >
                <Icon name="Download" size={18} />
                <span>Download</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-colors duration-200"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'preview' ?'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'content' ?'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Extracted Content
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'details' ?'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Details
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'preview' && (
              <div className="h-full p-6">
                <div className="h-full bg-secondary-50 rounded-lg overflow-hidden">
                  <Image
                    src={document.thumbnail}
                    alt={document.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="h-full p-6 overflow-y-auto">
                {document.extractedText ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-secondary-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center space-x-2 text-success mb-2">
                        <Icon name="Check" size={16} />
                        <span className="text-sm font-medium">Text extraction completed</span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Content has been processed and is ready for AI analysis
                      </p>
                    </div>
                    
                    <div className="whitespace-pre-wrap text-text-primary leading-relaxed">
                      {document.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mb-4">
                      <Icon name="AlertTriangle" size={24} className="text-warning" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Text extraction in progress
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Content will be available once processing is complete
                    </p>
                    {document.status === 'failed' && (
                      <button className="px-4 py-2 bg-warning text-white rounded-lg font-medium hover:bg-warning-700 transition-colors duration-200">
                        Retry Processing
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="h-full p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-text-primary">File Information</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-text-secondary">File Name</label>
                          <p className="text-text-primary">{document.name}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-text-secondary">File Type</label>
                          <p className="text-text-primary uppercase">{document.type}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-text-secondary">File Size</label>
                          <p className="text-text-primary">{formatFileSize(document.size)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-text-secondary">Upload Date</label>
                          <p className="text-text-primary">{formatDate(document.uploadDate)}</p>
                        </div>
                        
                        {document.pages && (
                          <div>
                            <label className="text-sm font-medium text-text-secondary">Pages</label>
                            <p className="text-text-primary">{document.pages}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-text-primary">Processing Status</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-text-secondary">Status</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(document.status)}`}>
                              {document.status}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-text-secondary">Text Extraction</label>
                          <div className="flex items-center space-x-2 mt-1">
                            {document.extractedText ? (
                              <>
                                <Icon name="Check" size={16} className="text-success" />
                                <span className="text-sm text-success">Completed</span>
                              </>
                            ) : (
                              <>
                                <Icon name="Clock" size={16} className="text-warning" />
                                <span className="text-sm text-warning">Pending</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-text-secondary">AI Ready</label>
                          <div className="flex items-center space-x-2 mt-1">
                            {document.status === 'processed' ? (
                              <>
                                <Icon name="Check" size={16} className="text-success" />
                                <span className="text-sm text-success">Ready for chat</span>
                              </>
                            ) : (
                              <>
                                <Icon name="Clock" size={16} className="text-warning" />
                                <span className="text-sm text-warning">Processing</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {document.status === 'processed' && (
                    <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Icon name="Lightbulb" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-primary mb-1">Ready for AI Analysis</h4>
                          <p className="text-sm text-text-secondary">
                            This document has been processed and is ready to use in chat conversations. 
                            You can ask questions about its content and get AI-powered insights.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;