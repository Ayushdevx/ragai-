// src/pages/authentication-login-register/components/ForgotPasswordForm.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ForgotPasswordForm = ({ onSubmit, onBack, isLoading }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSubmit(email);
      setIsSubmitted(true);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
          <Icon name="Mail" size={32} className="text-success-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Check your email
          </h3>
          <p className="text-text-secondary text-sm">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs text-text-secondary">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsSubmitted(false)}
              className="flex-1 px-4 py-2 text-sm bg-secondary-100 text-text-secondary hover:bg-secondary-200 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="flex-1 px-4 py-2 text-sm bg-primary text-white hover:bg-primary-700 rounded-lg transition-colors duration-200"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div>
        <label htmlFor="resetEmail" className="block text-sm font-medium text-text-primary mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="Mail" size={18} className="text-text-secondary" />
          </div>
          <input
            type="email"
            id="resetEmail"
            value={email}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
              errors.email ? 'border-error bg-error-50' : 'border-border bg-secondary-50 hover:bg-surface'
            }`}
            placeholder="Enter your email address"
            disabled={isLoading}
            autoFocus
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-error flex items-center">
            <Icon name="AlertCircle" size={14} className="mr-1" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Information */}
      <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <p className="text-sm text-primary">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-sm text-error flex items-center">
            <Icon name="AlertTriangle" size={16} className="mr-2" />
            {errors.submit}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Icon name="Send" size={18} />
              <span>Send Reset Link</span>
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-full px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary border border-border hover:border-border-hover rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <Icon name="ArrowLeft" size={16} className="inline mr-2" />
          Back to Sign In
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;