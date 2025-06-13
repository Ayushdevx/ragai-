// src/pages/authentication-login-register/components/SocialAuth.jsx
import React from 'react';
import Icon from 'components/AppIcon';

const SocialAuth = ({ onSocialAuth, isLoading }) => {
  const handleSocialLogin = async (provider) => {
    try {
      await onSocialAuth(provider);
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  const socialProviders = [
    {
      name: 'google',
      label: 'Continue with Google',
      icon: 'Mail', // Using Mail as placeholder for Google icon
      bgColor: 'bg-red-50 hover:bg-red-100 border-red-200',
      textColor: 'text-red-700'
    },
    {
      name: 'github',
      label: 'Continue with GitHub', 
      icon: 'Github',
      bgColor: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
      textColor: 'text-gray-700'
    }
  ];

  return (
    <>
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-surface text-text-secondary">Or continue with</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        {socialProviders.map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={() => handleSocialLogin(provider.name)}
            disabled={isLoading}
            className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              provider.bgColor
            } ${provider.textColor} hover:shadow-elevation-1`}
          >
            <Icon name={provider.icon} size={18} className="mr-3" />
            {provider.label}
          </button>
        ))}
      </div>

      {/* Social Auth Disclaimer */}
      <div className="mt-4 p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
        <p className="text-xs text-text-secondary text-center">
          By continuing with social login, you agree to our{' '}
          <button className="text-primary hover:text-primary-700 underline">
            Terms of Service
          </button>
          {' '}and{' '}
          <button className="text-primary hover:text-primary-700 underline">
            Privacy Policy
          </button>
        </p>
      </div>
    </>
  );
};

export default SocialAuth;