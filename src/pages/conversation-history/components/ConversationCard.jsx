import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ConversationCard = ({ 
  conversation, 
  isSelected, 
  onSelect, 
  onContinue, 
  onDelete, 
  onStarToggle,
  searchQuery 
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'pdf': return 'FileText';
      case 'word': return 'FileText';
      case 'excel': return 'FileSpreadsheet';
      case 'csv': return 'FileSpreadsheet';
      case 'markdown': return 'FileCode';
      case 'text': return 'FileText';
      default: return 'File';
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-text-primary px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div 
      className={`relative bg-surface border rounded-lg p-4 lg:p-6 transition-all duration-200 hover:shadow-elevation-3 ${
        isSelected ? 'border-primary bg-primary-50' : 'border-border hover:border-secondary-300'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => onSelect(conversation.id)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
            isSelected 
              ? 'bg-primary border-primary text-white' :'border-secondary-300 hover:border-primary'
          }`}
        >
          {isSelected && <Icon name="Check" size={12} />}
        </button>
      </div>

      {/* Star Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => onStarToggle(conversation.id)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            conversation.isStarred
              ? 'text-yellow-500 hover:text-yellow-600' :'text-text-secondary hover:text-text-primary hover:bg-secondary-50'
          }`}
        >
          <Icon name={conversation.isStarred ? 'Star' : 'Star'} size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-8 mr-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2">
              {highlightText(conversation.title, searchQuery)}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span className="flex items-center space-x-1">
                <Icon name="MessageCircle" size={14} />
                <span>{conversation.messageCount} messages</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="Clock" size={14} />
                <span>{conversation.duration}</span>
              </span>
              <span>{formatTimestamp(conversation.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-4">
          <p className="text-text-secondary text-sm line-clamp-3 leading-relaxed">
            {highlightText(conversation.preview, searchQuery)}
          </p>
        </div>

        {/* Documents */}
        {conversation.documents.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {conversation.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 px-3 py-1 bg-secondary-50 rounded-lg text-sm"
                >
                  <Icon name={getDocumentIcon(doc.type)} size={14} className="text-text-secondary" />
                  <span className="text-text-primary font-medium">{doc.name}</span>
                  <span className="text-text-secondary">({doc.size})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {conversation.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {conversation.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-accent-100 text-accent-700 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={`flex items-center justify-between transition-opacity duration-200 ${
          showActions ? 'opacity-100' : 'opacity-0 lg:opacity-100'
        }`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onContinue(conversation.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <Icon name="MessageCircle" size={16} />
              <span>Continue</span>
            </button>
            
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-text-primary rounded-lg hover:bg-secondary-200 transition-colors duration-200"
            >
              <Icon name="Share2" size={16} />
              <span>Share</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-colors duration-200"
              title="Rename conversation"
            >
              <Icon name="Edit2" size={16} />
            </button>
            
            <button
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-colors duration-200"
              title="Export conversation"
            >
              <Icon name="Download" size={16} />
            </button>
            
            <button
              onClick={() => onDelete(conversation.id)}
              className="p-2 text-text-secondary hover:text-error hover:bg-error-50 rounded-lg transition-colors duration-200"
              title="Delete conversation"
            >
              <Icon name="Trash2" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;