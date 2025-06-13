// src/pages/authentication-login-register/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from 'components/AppIcon';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import SocialAuth from './components/SocialAuth';

const AuthenticationLoginRegister = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { user, loading, authLoading, signIn, signUp, signInWithOAuth, resetPassword } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard-home');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (credentials) => {
    try {
      await signIn(credentials.email, credentials.password);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleRegister = async (userData) => {
    try {
      await signUp(userData.email, userData.password, {
        full_name: userData.name
      });
      // Navigation will be handled by the useEffect above
    } catch (error) {
      throw new Error(error.message || 'Failed to create account. Please try again.');
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      await resetPassword(email);
      setShowForgotPassword(false);
      // Show success message in real implementation
    } catch (error) {
      throw new Error(error.message || 'Failed to send reset email. Please try again.');
    }
  };

  const handleSocialAuth = async (provider) => {
    try {
      await signInWithOAuth(provider);
      // OAuth will handle the redirect
    } catch (error) {
      throw new Error(error.message || `Failed to sign in with ${provider}. Please try again.`);
    }
  };

  // Mock credentials for demo purposes
  const mockCredentials = {
    demo: {
      email: 'test@docuai.com',
      password: 'TestUser123'
    },
    admin: {
      email: 'admin@docuai.com', 
      password: 'AdminUser123'
    },
    user: {
      email: 'user@docuai.com',
      password: 'RegularUser123'
    }
  };

  // Show loading spinner while checking authentication state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-50 to-accent-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50 to-accent-50">
      {/* Minimal Header */}
      <header className="bg-surface/80 backdrop-blur-sm border-b border-border shadow-elevation-1">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary">
                DocuAI
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Authentication Card */}
          <div className="bg-surface rounded-2xl shadow-elevation-4 overflow-hidden relative">
            {/* Loading Overlay */}
            {authLoading && (
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-text-secondary">
                    {activeTab === 'login' ? 'Signing you in...' : 'Creating your account...'}
                  </p>
                </div>
              </div>
            )}

            {/* Card Header */}
            <div className="px-6 py-8 text-center border-b border-border">
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {showForgotPassword ? 'Reset Password' : 
                 activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-text-secondary">
                {showForgotPassword ? 'Enter your email to reset your password' :
                 activeTab === 'login' ? 'Sign in to your DocuAI account' : 'Join DocuAI and start chatting with your documents'}
              </p>
            </div>

            {/* Tab Navigation */}
            {!showForgotPassword && (
              <div className="px-6 pt-6">
                <div className="flex bg-secondary-50 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'login' ?'bg-surface text-primary shadow-elevation-1' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'register' ?'bg-surface text-primary shadow-elevation-1' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="px-6 py-6">
              {showForgotPassword ? (
                <ForgotPasswordForm
                  onSubmit={handleForgotPassword}
                  onBack={() => setShowForgotPassword(false)}
                  isLoading={authLoading}
                />
              ) : activeTab === 'login' ? (
                <LoginForm
                  onSubmit={handleLogin}
                  onForgotPassword={() => setShowForgotPassword(true)}
                  isLoading={authLoading}
                  mockCredentials={mockCredentials}
                />
              ) : (
                <RegisterForm
                  onSubmit={handleRegister}
                  isLoading={authLoading}
                />
              )}

              {/* Social Authentication */}
              {!showForgotPassword && (
                <SocialAuth
                  onSocialAuth={handleSocialAuth}
                  isLoading={authLoading}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-text-secondary">
            <p>© {new Date().getFullYear()} DocuAI. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <button className="hover:text-text-primary transition-colors duration-200">
                Privacy Policy
              </button>
              <button className="hover:text-text-primary transition-colors duration-200">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthenticationLoginRegister;