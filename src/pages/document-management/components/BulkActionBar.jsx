import React from 'react';
import Icon from 'components/AppIcon';

const BulkActionBar = ({ selectedCount, onDelete, onDownload }) => {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-text-primary">
        {selectedCount} selected
      </span>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onDownload}
          className="flex items-center space-x-2 px-3 py-1 bg-secondary-100 text-text-primary rounded-lg text-sm font-medium hover:bg-secondary-200 transition-colors duration-200"
        >
          <Icon name="Download" size={16} />
          <span>Download</span>
        </button>
        
        <button
          onClick={onDelete}
          className="flex items-center space-x-2 px-3 py-1 bg-error-50 text-error rounded-lg text-sm font-medium hover:bg-error-100 transition-colors duration-200"
        >
          <Icon name="Trash2" size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;