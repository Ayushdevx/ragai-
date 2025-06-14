// User Info Collection Modal Component
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  BriefcaseIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import sessionService from '../services/sessionService.js';

const UserInfoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  sessionId,
  required = true 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    purpose: '',
    company: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fields, setFields] = useState([]);
  useEffect(() => {
    if (isOpen) {
      try {
        // Get required fields from session service
        const userInfoFields = sessionService.getUserInfoFields();
        setFields(userInfoFields);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          purpose: '',
          company: '',
          role: ''
        });
        setErrors({});
      } catch (error) {
        console.error('Error loading user info fields:', error);
        // Set default fields if there's an error
        setFields([
          { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter your name' },
          { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter your email' },
          { name: 'purpose', label: 'Purpose', type: 'text', required: true, placeholder: 'What brings you here?' }
        ]);
      }
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Collect additional metadata
      const userInfo = {
        ...formData,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // Submit to session service
      await sessionService.collectUserInfo(sessionId, userInfo);
      
      // Notify parent component
      if (onSubmit) {
        onSubmit(userInfo);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to submit user info:', error);
      setErrors({
        submit: error.message || 'Failed to save information. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!required) {
      onClose();
    }
  };

  const getFieldIcon = (fieldName) => {
    switch (fieldName) {
      case 'name':
        return <UserIcon className="w-5 h-5 text-gray-400" />;
      case 'email':
        return <EnvelopeIcon className="w-5 h-5 text-gray-400" />;
      case 'purpose':
      case 'company':
      case 'role':
        return <BriefcaseIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getFieldType = (fieldName) => {
    switch (fieldName) {
      case 'email':
        return 'email';
      case 'purpose':
        return 'textarea';
      default:
        return 'text';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Welcome to Real IT Solutions AI
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Please provide some information to personalize your experience
              </p>
            </div>
            {!required && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label 
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getFieldIcon(field.name)}
                  </div>
                  
                  {getFieldType(field.name) === 'textarea' ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      rows={3}
                      className={`
                        block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm
                        focus:ring-blue-500 focus:border-blue-500
                        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                        ${errors[field.name] 
                          ? 'border-red-300 dark:border-red-600' 
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}
                    />
                  ) : (
                    <input
                      type={getFieldType(field.name)}
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      className={`
                        block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm
                        focus:ring-blue-500 focus:border-blue-500
                        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                        ${errors[field.name] 
                          ? 'border-red-300 dark:border-red-600' 
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}
                    />
                  )}
                </div>
                
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-800 dark:text-red-400">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <div className="flex">
                <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    Your information helps us provide personalized assistance and will be used to send you a session summary via email.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4">
              {!required && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-100"
                >
                  Skip for now
                </button>
              )}
              
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-6 py-2 text-sm font-medium text-white rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  ${isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Continue to Chat'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserInfoModal;
