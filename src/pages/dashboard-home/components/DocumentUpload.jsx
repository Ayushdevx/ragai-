import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const DocumentUpload = ({ onUpload, uploadProgress, isUploading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const supportedFormats = [
    { name: 'PDF', icon: 'FileText', color: 'text-error-500' },
    { name: 'DOC', icon: 'FileText', color: 'text-primary' },
    { name: 'TXT', icon: 'File', color: 'text-secondary-500' },
    { name: 'DOCX', icon: 'FileText', color: 'text-primary' },
    { name: 'CSV', icon: 'Table', color: 'text-success-500' },
    { name: 'XLSX', icon: 'Table', color: 'text-success-500' }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return ['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx'].includes(extension);
    });
    
    setSelectedFiles(validFiles);
    if (validFiles.length > 0) {
      // Simulate upload process
      setTimeout(() => {
        navigate('/document-management');
      }, 1000);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-surface rounded-xl shadow-elevation-2 p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Upload Documents</h2>
        <button
          onClick={() => navigate('/document-management')}
          className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200"
        >
          Manage All
        </button>
      </div>

      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-primary bg-primary-50' :'border-border hover:border-primary-300 hover:bg-primary-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto">
            <Icon name="Upload" size={32} className="text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Drop your documents here
            </h3>
            <p className="text-text-secondary mb-4">
              or click to browse your files
            </p>
            
            <button
              onClick={openFileDialog}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
            >
              Choose Files
            </button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-surface bg-opacity-90 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-primary font-medium">Uploading...</p>
              <div className="w-48 bg-secondary-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Supported Formats */}
      <div className="mt-6">
        <p className="text-sm text-text-secondary mb-3">Supported formats:</p>
        <div className="flex flex-wrap gap-2">
          {supportedFormats.map((format, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 px-3 py-1 bg-secondary-50 rounded-full text-sm"
            >
              <Icon name={format.icon} size={14} className={format.color} />
              <span className="text-text-secondary">{format.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-text-primary mb-3">Selected Files:</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Icon name="FileText" size={20} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{file.name}</p>
                    <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-text-secondary hover:text-error-500 transition-colors duration-200"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Upload Tips */}
      <div className="mt-6 p-4 bg-accent-50 rounded-lg border border-accent-100">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-accent mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-accent-700 mb-1">Quick Tips:</p>
            <ul className="text-accent-600 space-y-1">
              <li>• Maximum file size: 10MB per file</li>
              <li>• You can upload multiple files at once</li>
              <li>• Files are processed automatically for AI analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;