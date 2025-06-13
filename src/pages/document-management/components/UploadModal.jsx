import React, { useState, useRef } from 'react';
import Icon from 'components/AppIcon';

const UploadModal = ({ onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const supportedTypes = [
    { type: 'pdf', label: 'PDF', icon: 'FileText' },
    { type: 'docx', label: 'Word', icon: 'FileText' },
    { type: 'txt', label: 'Text', icon: 'FileText' },
    { type: 'xlsx', label: 'Excel', icon: 'Sheet' },
    { type: 'md', label: 'Markdown', icon: 'FileCode' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name),
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return extension;
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return 'FileText';
      case 'docx': case'doc':
        return 'FileText';
      case 'txt':
        return 'FileText';
      case 'xlsx': case'xls':
        return 'Sheet';
      case 'md':
        return 'FileCode';
      default:
        return 'File';
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    // Simulate upload progress
    for (const file of files) {
      setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [file.id]: progress }));
      }
      
      setFiles(prev => 
        prev.map(f => 
          f.id === file.id ? { ...f, status: 'completed' } : f
        )
      );
    }
    
    setTimeout(() => {
      onUpload(files);
      setUploading(false);
    }, 500);
  };

  const isValidFileType = (type) => {
    return supportedTypes.some(supported => supported.type === type);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="bg-surface rounded-lg shadow-elevation-5 w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Upload Documents</h2>
              <p className="text-sm text-text-secondary mt-1">
                Add files to process with AI-powered analysis
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-colors duration-200"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Upload Area */}
          <div className="p-6">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                dragActive
                  ? 'border-primary bg-primary-50' :'border-border hover:border-primary hover:bg-primary-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleChange}
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.md"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                  <Icon name="Upload" size={24} className="text-primary" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Drop files here or click to browse
                  </h3>
                  <p className="text-text-secondary">
                    Support for PDF, Word, Excel, Text, and Markdown files
                  </p>
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                >
                  Choose Files
                </button>
              </div>
            </div>

            {/* Supported File Types */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-text-primary mb-3">Supported file types:</h4>
              <div className="flex flex-wrap gap-2">
                {supportedTypes.map((type) => (
                  <div
                    key={type.type}
                    className="flex items-center space-x-2 px-3 py-1 bg-secondary-50 rounded-full text-sm text-text-secondary"
                  >
                    <Icon name={type.icon} size={14} />
                    <span>{type.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="flex-1 overflow-hidden border-t border-border">
              <div className="p-6">
                <h3 className="text-lg font-medium text-text-primary mb-4">
                  Selected Files ({files.length})
                </h3>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isValidFileType(file.type) ? 'bg-primary-100' : 'bg-error-100'
                      }`}>
                        <Icon
                          name={getFileIcon(file.type)}
                          size={16}
                          className={isValidFileType(file.type) ? 'text-primary' : 'text-error'}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-text-secondary">{file.size}</p>
                        
                        {uploading && uploadProgress[file.id] !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress[file.id]}%</span>
                            </div>
                            <div className="w-full bg-secondary-200 rounded-full h-1">
                              <div
                                className="bg-primary h-1 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[file.id]}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {file.status === 'completed' && (
                          <Icon name="Check" size={16} className="text-success" />
                        )}
                        
                        {!uploading && (
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1 text-text-secondary hover:text-error transition-colors duration-200"
                          >
                            <Icon name="X" size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border">
            <div className="text-sm text-text-secondary">
              {files.length > 0 && (
                <span>
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;