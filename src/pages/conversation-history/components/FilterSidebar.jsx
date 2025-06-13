import React from 'react';
import Icon from 'components/AppIcon';

const FilterSidebar = ({ selectedFilters, setSelectedFilters, conversations, onClose }) => {
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const documentTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'pdf', label: 'PDF Documents' },
    { value: 'word', label: 'Word Documents' },
    { value: 'excel', label: 'Excel Files' },
    { value: 'csv', label: 'CSV Files' },
    { value: 'markdown', label: 'Markdown Files' },
    { value: 'text', label: 'Text Files' }
  ];

  const conversationLengthOptions = [
    { value: 'all', label: 'All Lengths' },
    { value: 'short', label: 'Short (≤5 messages)' },
    { value: 'medium', label: 'Medium (6-15 messages)' },
    { value: 'long', label: 'Long (>15 messages)' }
  ];

  // Extract all unique tags from conversations
  const allTags = [...new Set(conversations.flatMap(conv => conv.tags))].sort();

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setSelectedFilters(prev => ({
      ...prev,
      topicTags: prev.topicTags.includes(tag)
        ? prev.topicTags.filter(t => t !== tag)
        : [...prev.topicTags, tag]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      dateRange: 'all',
      documentType: 'all',
      conversationLength: 'all',
      topicTags: []
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedFilters.dateRange !== 'all') count++;
    if (selectedFilters.documentType !== 'all') count++;
    if (selectedFilters.conversationLength !== 'all') count++;
    if (selectedFilters.topicTags.length > 0) count++;
    return count;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 h-fit sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
        <div className="flex items-center space-x-2">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:text-primary-700 transition-colors duration-200"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded transition-colors duration-200"
          >
            <Icon name="X" size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Date Range Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Date Range</h4>
          <div className="space-y-2">
            {dateRangeOptions.map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="dateRange"
                  value={option.value}
                  checked={selectedFilters.dateRange === option.value}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-4 h-4 text-primary border-secondary-300 focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-text-secondary">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Document Type Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Document Type</h4>
          <div className="space-y-2">
            {documentTypeOptions.map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="documentType"
                  value={option.value}
                  checked={selectedFilters.documentType === option.value}
                  onChange={(e) => handleFilterChange('documentType', e.target.value)}
                  className="w-4 h-4 text-primary border-secondary-300 focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-text-secondary">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Conversation Length Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Conversation Length</h4>
          <div className="space-y-2">
            {conversationLengthOptions.map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="conversationLength"
                  value={option.value}
                  checked={selectedFilters.conversationLength === option.value}
                  onChange={(e) => handleFilterChange('conversationLength', e.target.value)}
                  className="w-4 h-4 text-primary border-secondary-300 focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-text-secondary">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Topic Tags Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Topic Tags</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {allTags.map(tag => (
              <label key={tag} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFilters.topicTags.includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                  className="w-4 h-4 text-primary border-secondary-300 rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-text-secondary">#{tag}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filter Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="text-sm text-text-secondary mb-2">
              {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
            </div>
            <div className="space-y-1">
              {selectedFilters.dateRange !== 'all' && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Date:</span>
                  <span className="text-primary font-medium">
                    {dateRangeOptions.find(opt => opt.value === selectedFilters.dateRange)?.label}
                  </span>
                </div>
              )}
              {selectedFilters.documentType !== 'all' && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Type:</span>
                  <span className="text-primary font-medium">
                    {documentTypeOptions.find(opt => opt.value === selectedFilters.documentType)?.label}
                  </span>
                </div>
              )}
              {selectedFilters.conversationLength !== 'all' && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Length:</span>
                  <span className="text-primary font-medium">
                    {conversationLengthOptions.find(opt => opt.value === selectedFilters.conversationLength)?.label}
                  </span>
                </div>
              )}
              {selectedFilters.topicTags.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Tags:</span>
                  <span className="text-primary font-medium">
                    {selectedFilters.topicTags.length} selected
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;