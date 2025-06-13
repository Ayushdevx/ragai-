import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ExportModal = ({ selectedConversations, conversations, onClose }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeDocuments: true,
    includeTimestamps: true,
    includeMetadata: true,
    separateFiles: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { value: 'pdf', label: 'PDF Document', icon: 'FileText', description: 'Formatted document with styling' },
    { value: 'txt', label: 'Plain Text', icon: 'FileText', description: 'Simple text format' },
    { value: 'json', label: 'JSON Data', icon: 'FileCode', description: 'Structured data format' },
    { value: 'csv', label: 'CSV Spreadsheet', icon: 'FileSpreadsheet', description: 'Tabular data format' }
  ];

  const selectedConversationData = conversations.filter(conv => 
    selectedConversations.includes(conv.id)
  );

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real application, this would generate and download the actual files
    console.log('Exporting conversations:', {
      conversations: selectedConversationData,
      format: exportFormat,
      options: exportOptions
    });
    
    setIsExporting(false);
    onClose();
  };

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const getEstimatedFileSize = () => {
    const baseSize = selectedConversationData.length * 50; // KB per conversation
    const multiplier = exportFormat === 'pdf' ? 3 : exportFormat === 'json' ? 2 : 1;
    return Math.round(baseSize * multiplier);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1000 p-4">
      <div className="bg-surface rounded-lg shadow-elevation-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Export Conversations</h2>
            <p className="text-sm text-text-secondary mt-1">
              Export {selectedConversations.length} selected conversation{selectedConversations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-colors duration-200"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-4">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportFormats.map(format => (
                <label
                  key={format.value}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    exportFormat === format.value
                      ? 'border-primary bg-primary-50' :'border-border hover:border-secondary-300 hover:bg-secondary-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format.value}
                    checked={exportFormat === format.value}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    <Icon name={format.icon} size={20} className="text-text-secondary" />
                    <div>
                      <div className="font-medium text-text-primary">{format.label}</div>
                      <div className="text-sm text-text-secondary">{format.description}</div>
                    </div>
                  </div>
                  {exportFormat === format.value && (
                    <Icon name="Check" size={18} className="text-primary" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-4">Export Options</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <div className="font-medium text-text-primary">Include Documents</div>
                  <div className="text-sm text-text-secondary">Export attached document information</div>
                </div>
                <input
                  type="checkbox"
                  checked={exportOptions.includeDocuments}
                  onChange={(e) => handleOptionChange('includeDocuments', e.target.checked)}
                  className="w-4 h-4 text-primary border-secondary-300 rounded focus:ring-primary focus:ring-2"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <div className="font-medium text-text-primary">Include Timestamps</div>
                  <div className="text-sm text-text-secondary">Add date and time information</div>
                </div>
                <input
                  type="checkbox"
                  checked={exportOptions.includeTimestamps}
                  onChange={(e) => handleOptionChange('includeTimestamps', e.target.checked)}
                  className="w-4 h-4 text-primary border-secondary-300 rounded focus:ring-primary focus:ring-2"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <div className="font-medium text-text-primary">Include Metadata</div>
                  <div className="text-sm text-text-secondary">Export tags, message counts, and other details</div>
                </div>
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                  className="w-4 h-4 text-primary border-secondary-300 rounded focus:ring-primary focus:ring-2"
                />
              </label>

              {selectedConversations.length > 1 && (
                <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div>
                    <div className="font-medium text-text-primary">Separate Files</div>
                    <div className="text-sm text-text-secondary">Create individual files for each conversation</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={exportOptions.separateFiles}
                    onChange={(e) => handleOptionChange('separateFiles', e.target.checked)}
                    className="w-4 h-4 text-primary border-secondary-300 rounded focus:ring-primary focus:ring-2"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
            <h4 className="font-medium text-text-primary mb-2">Export Summary</h4>
            <div className="space-y-1 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Conversations:</span>
                <span className="font-medium">{selectedConversations.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Messages:</span>
                <span className="font-medium">
                  {selectedConversationData.reduce((sum, conv) => sum + conv.messageCount, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Documents:</span>
                <span className="font-medium">
                  {selectedConversationData.reduce((sum, conv) => sum + conv.documents.length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Size:</span>
                <span className="font-medium">{getEstimatedFileSize()} KB</span>
              </div>
            </div>
          </div>

          {/* Selected Conversations Preview */}
          <div>
            <h4 className="font-medium text-text-primary mb-3">Selected Conversations</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {selectedConversationData.map(conv => (
                <div key={conv.id} className="flex items-center space-x-3 p-2 bg-secondary-50 rounded">
                  <Icon name="MessageCircle" size={16} className="text-text-secondary" />
                  <span className="text-sm text-text-primary flex-1 truncate">{conv.title}</span>
                  <span className="text-xs text-text-secondary">{conv.messageCount} msgs</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Icon name="Download" size={18} />
                <span>Export {exportFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;