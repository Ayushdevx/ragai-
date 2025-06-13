import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const DocumentPanel = ({ isOpen, documents, onClose, onDocumentSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return 'FileText';
      case 'docx': return 'FileText';
      case 'txt': return 'File';
      default: return 'File';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'text-success';
      case 'processing': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(selectedDocument?.id === document.id ? null : document);
    onDocumentSelect(document);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed right-0 top-16 bottom-0 w-80 bg-surface border-l border-border shadow-elevation-4 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:relative lg:translate-x-0 lg:z-auto`}>
        
        {/* Panel Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Documents</h2>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-all duration-200"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="FileX" size={48} className="text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">
                {searchQuery ? 'No documents found' : 'No documents uploaded'}
              </p>
            </div>
          ) : (
            filteredDocuments.map((document) => (
              <div
                key={document.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-elevation-2 ${
                  selectedDocument?.id === document.id
                    ? 'border-primary bg-primary-50' :'border-border bg-surface hover:border-secondary-300'
                }`}
                onClick={() => handleDocumentClick(document)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedDocument?.id === document.id ? 'bg-primary text-white' : 'bg-secondary-100 text-text-secondary'
                  }`}>
                    <Icon name={getFileIcon(document.type)} size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary truncate">{document.name}</h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-text-secondary">
                      <span>{document.size}</span>
                      <span>•</span>
                      <span>{document.pages} page{document.pages !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-text-secondary">
                        {formatDate(document.uploadDate)}
                      </span>
                      <span className={`text-xs font-medium ${getStatusColor(document.status)}`}>
                        {document.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Document Preview/Details */}
                {selectedDocument?.id === document.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Processing Status:</span>
                        <span className={`font-medium ${getStatusColor(document.status)}`}>
                          {document.status === 'processed' ? 'Ready for queries' : 'Processing...'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">File Type:</span>
                        <span className="font-medium text-text-primary uppercase">{document.type}</span>
                      </div>

                      {document.status === 'processed' && (
                        <div className="mt-3 flex space-x-2">
                          <button className="flex-1 px-3 py-1.5 bg-primary text-white text-xs rounded-md hover:bg-primary-700 transition-colors duration-200">
                            Ask Questions
                          </button>
                          <button className="px-3 py-1.5 bg-secondary-100 text-text-secondary text-xs rounded-md hover:bg-secondary-200 transition-colors duration-200">
                            <Icon name="Eye" size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
            <Icon name="Plus" size={16} />
            <span>Upload Document</span>
          </button>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-text-secondary">
              {documents.length} document{documents.length !== 1 ? 's' : ''} • {documents.filter(d => d.status === 'processed').length} processed
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentPanel;