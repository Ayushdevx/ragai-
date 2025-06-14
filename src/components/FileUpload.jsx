// Enhanced File Upload Component with Drag & Drop
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import ragConfig from '../config/ragConfig.js';

const FileUpload = ({ 
  onFileUpload, 
  onFileRemove, 
  uploadedFiles = [], 
  maxFiles = 5,
  className = "",
  sessionId 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Handle file input change
  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  }, []);

  // Validate and process files
  const handleFiles = async (files) => {
    const newErrors = [];
    const validFiles = [];

    // Check file limits
    if (uploadedFiles.length + files.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed. Currently have ${uploadedFiles.length}.`);
      setErrors(newErrors);
      return;
    }

    // Validate each file
    files.forEach((file, index) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        newErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    setErrors(newErrors);

    // Upload valid files
    if (validFiles.length > 0) {
      setUploading(true);
      try {
        for (const file of validFiles) {
          await uploadFile(file);
        }
      } catch (error) {
        setErrors(prev => [...prev, `Upload failed: ${error.message}`]);
      } finally {
        setUploading(false);
      }
    }
  };

  // Validate individual file
  const validateFile = (file) => {
    const config = ragConfig.documents;
    
    // Check file type
    const allowedTypes = config.supportedTypes;
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type .${fileExtension} not supported. Allowed: ${allowedTypes.join(', ')}`
      };
    }

    // Check file size
    if (file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        error: `File too large (${fileSizeMB}MB). Maximum size: ${maxSizeMB}MB`
      };
    }

    // Check for duplicates
    const isDuplicate = uploadedFiles.some(existingFile => 
      existingFile.name === file.name && existingFile.size === file.size
    );
    
    if (isDuplicate) {
      return {
        isValid: false,
        error: 'File already uploaded'
      };
    }

    return { isValid: true };
  };

  // Upload file
  const uploadFile = async (file) => {
    try {
      if (onFileUpload) {
        await onFileUpload(file, sessionId);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  };

  // Remove file
  const handleRemoveFile = (fileId) => {
    if (onFileRemove) {
      onFileRemove(fileId);
    }
  };

  // Click to open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Get file icon based on type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconProps = { className: "w-8 h-8" };

    switch (extension) {
      case 'pdf':
        return <DocumentIcon {...iconProps} className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <DocumentIcon {...iconProps} className="w-8 h-8 text-blue-500" />;
      case 'txt':
      case 'md':
        return <DocumentIcon {...iconProps} className="w-8 h-8 text-gray-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return <DocumentIcon {...iconProps} className="w-8 h-8 text-green-500" />;
      default:
        return <DocumentIcon {...iconProps} className="w-8 h-8 text-gray-400" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={{ scale: uploading ? 1 : 1.02 }}
        whileTap={{ scale: uploading ? 1 : 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept={ragConfig.documents.supportedTypes.map(type => `.${type}`).join(',')}
          className="hidden"
        />

        <div className="space-y-4">
          {uploading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Processing files...</p>
            </motion.div>
          ) : (
            <>
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports: {ragConfig.documents.supportedTypes.join(', ')}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Max {maxFiles} files, up to {(ragConfig.documents.maxSize / (1024 * 1024)).toFixed(1)}MB each
                </p>
              </div>
            </>
          )}
        </div>

        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 rounded-lg flex items-center justify-center"
          >
            <p className="text-blue-600 dark:text-blue-400 font-medium">Drop files here!</p>
          </motion.div>
        )}
      </motion.div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Upload Issues
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setErrors([])}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Uploaded Documents ({uploadedFiles.length}/{maxFiles})
            </h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={file.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(file.name)}
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatFileSize(file.size || 0)}</span>
                      {file.chunkCount && (
                        <span>• {file.chunkCount} chunks</span>
                      )}
                      {file.vectorStored !== undefined && (
                        <span className={`flex items-center ${file.vectorStored ? 'text-green-600' : 'text-yellow-600'}`}>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          {file.vectorStored ? 'Indexed' : 'Processing'}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
