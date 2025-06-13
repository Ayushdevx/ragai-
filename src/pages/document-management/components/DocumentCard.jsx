import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const DocumentCard = ({
  document,
  viewMode,
  isBulkMode,
  isSelected,
  onSelect,
  onPreview,
  onDelete,
  onRename,
  onRetry,
  onUseInChat
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(document.name);

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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRename = () => {
    if (newName.trim() && newName !== document.name) {
      onRename(newName.trim());
    }
    setIsRenaming(false);
    setIsMenuOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewName(document.name);
      setIsRenaming(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className={`bg-surface border border-border rounded-lg p-4 hover:shadow-elevation-2 transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}>
        <div className="flex items-center space-x-4">
          {isBulkMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
          )}
          
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Icon name={getFileIcon(document.type)} size={24} className="text-text-secondary" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyPress}
                className="w-full px-2 py-1 text-sm font-medium text-text-primary bg-secondary-50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            ) : (
              <h3 className="text-sm font-medium text-text-primary truncate">{document.name}</h3>
            )}
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs text-text-secondary">{formatFileSize(document.size)}</span>
              <span className="text-xs text-text-secondary">{formatDate(document.uploadDate)}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(document.status)}`}>
                {document.status}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {document.status === 'processed' && (
              <button
                onClick={onUseInChat}
                className="px-3 py-1 text-xs font-medium text-primary bg-primary-50 rounded-full hover:bg-primary-100 transition-colors duration-200"
              >
                Use in Chat
              </button>
            )}
            
            {document.status === 'failed' && (
              <button
                onClick={onRetry}
                className="px-3 py-1 text-xs font-medium text-warning bg-warning-50 rounded-full hover:bg-warning-100 transition-colors duration-200"
              >
                Retry
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-colors duration-200"
              >
                <Icon name="MoreVertical" size={16} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-elevation-3 z-10">
                  <button
                    onClick={() => {
                      onPreview();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-primary hover:bg-secondary-50 transition-colors duration-200"
                  >
                    <Icon name="Eye" size={16} />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRenaming(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-primary hover:bg-secondary-50 transition-colors duration-200"
                  >
                    <Icon name="Edit" size={16} />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log('Download document:', document.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-primary hover:bg-secondary-50 transition-colors duration-200"
                  >
                    <Icon name="Download" size={16} />
                    <span>Download</span>
                  </button>
                  <hr className="my-1 border-border" />
                  <button
                    onClick={() => {
                      onDelete();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-error hover:bg-error-50 transition-colors duration-200"
                  >
                    <Icon name="Trash2" size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface border border-border rounded-lg overflow-hidden hover:shadow-elevation-2 transition-all duration-200 ${
      isSelected ? 'ring-2 ring-primary border-primary' : ''
    }`}>
      {isBulkMode && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary bg-surface"
          />
        </div>
      )}

      <div className="relative">
        <div className="w-full h-32 bg-secondary-100 overflow-hidden">
          <Image
            src={document.thumbnail}
            alt={document.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(document.status)}`}>
            {document.status}
          </span>
        </div>

        {document.status === 'processing' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Processing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Icon name={getFileIcon(document.type)} size={16} className="text-text-secondary flex-shrink-0" />
            {isRenaming ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyPress}
                className="flex-1 px-2 py-1 text-sm font-medium text-text-primary bg-secondary-50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            ) : (
              <h3 className="text-sm font-medium text-text-primary truncate flex-1" title={document.name}>
                {document.name}
              </h3>
            )}
          </div>
          
          <div className="relative ml-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded transition-colors duration-200"
            >
              <Icon name="MoreVertical" size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-elevation-3 z-20">
                <button
                  onClick={() => {
                    onPreview();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-primary hover:bg-secondary-50 transition-colors duration-200"
                >
                  <Icon name="Eye" size={16} />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-primary hover:bg-secondary-50 transition-colors duration-200"
                >
                  <Icon name="Edit" size={16} />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => {
                    console.log('Download document:', document.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-primary hover:bg-secondary-50 transition-colors duration-200"
                >
                  <Icon name="Download" size={16} />
                  <span>Download</span>
                </button>
                <hr className="my-1 border-border" />
                <button
                  onClick={() => {
                    onDelete();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-error hover:bg-error-50 transition-colors duration-200"
                >
                  <Icon name="Trash2" size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
          <span>{formatFileSize(document.size)}</span>
          <span>{formatDate(document.uploadDate)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {document.extractedText && (
              <div className="flex items-center space-x-1 text-xs text-success">
                <Icon name="Check" size={12} />
                <span>Text extracted</span>
              </div>
            )}
            {document.pages && (
              <span className="text-xs text-text-secondary">
                {document.pages} page{document.pages !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {document.status === 'processed' && (
              <button
                onClick={onUseInChat}
                className="px-2 py-1 text-xs font-medium text-primary bg-primary-50 rounded hover:bg-primary-100 transition-colors duration-200"
              >
                Use in Chat
              </button>
            )}
            
            {document.status === 'failed' && (
              <button
                onClick={onRetry}
                className="px-2 py-1 text-xs font-medium text-warning bg-warning-50 rounded hover:bg-warning-100 transition-colors duration-200"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;