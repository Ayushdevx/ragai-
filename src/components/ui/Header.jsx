// src/components/ui/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from 'components/AppIcon';

const Header = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/authentication-login-register');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name.includes(' ')) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border shadow-elevation-1">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors duration-200">
              <Icon name="Menu" size={20} />
            </button>
            
            <button 
              onClick={() => navigate('/dashboard-home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              title="Go to Home"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary hidden sm:block">
                DocuAI
              </span>
            </button>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-200 relative"
              >
                <Icon name="Bell" size={20} />
                {/* Notification badge */}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-error rounded-full"></span>
              </button>
              
              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-elevation-4 z-50">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                  </div>
                  <div className="p-4 text-sm text-text-secondary text-center">
                    No new notifications
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-50 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {getUserInitials()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-text-primary">
                  {getUserDisplayName()}
                </span>
                <Icon name="ChevronDown" size={16} className="text-text-secondary" />
              </button>
              
              {/* User dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-elevation-4 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm">
                      <p className="font-medium text-text-primary">{getUserDisplayName()}</p>
                      <p className="text-text-secondary truncate">{user?.email}</p>
                    </div>
                    
                    <div className="border-t border-border my-2"></div>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-md transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Icon name="User" size={16} />
                      <span>Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/voice-settings-controls');
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-md transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Icon name="Settings" size={16} />
                      <span>Settings</span>
                    </button>
                    
                    <div className="border-t border-border my-2"></div>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSignOut();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-error hover:bg-error-50 rounded-md transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile menus */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;