import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';

const SearchBar = ({ searchQuery, setSearchQuery, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Mock search suggestions
  const mockSuggestions = [
    'financial report',
    'marketing strategy',
    'technical documentation',
    'legal contract',
    'research paper',
    'project planning',
    'quarterly analysis',
    'API documentation',
    'machine learning',
    'revenue growth'
  ];

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'ring-2 ring-primary ring-opacity-50' : ''
      }`}>
        <div className="absolute left-3 pointer-events-none">
          <Icon name="Search" size={18} className="text-text-secondary" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
        />
        
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 p-1 text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-elevation-4 z-50">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-secondary-50 transition-colors duration-200 flex items-center space-x-3"
              >
                <Icon name="Search" size={14} className="text-text-secondary" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
          
          <div className="border-t border-border px-4 py-2">
            <div className="text-xs text-text-secondary">
              Press <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}

      {/* Search Tips */}
      {isFocused && !searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-elevation-4 z-50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">Search Tips</h4>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Search by conversation title or content</li>
              <li>• Use document names to find specific files</li>
              <li>• Search by topic tags (e.g., "finance", "technical")</li>
              <li>• Combine terms for more specific results</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;