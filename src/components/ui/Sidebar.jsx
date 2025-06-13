import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard-home',
      icon: 'Home',
      description: 'Overview and quick access'
    },
    {
      label: 'Chat Interface',
      path: '/chat-interface',
      icon: 'MessageCircle',
      description: 'AI conversation hub',
      badge: '3'
    },
    {
      label: 'Documents',
      path: '/document-management',
      icon: 'FileText',
      description: 'File management center'
    },
    {
      label: 'History',
      path: '/conversation-history',
      icon: 'Clock',
      description: 'Past conversations'
    },
    {
      label: 'Voice Settings',
      path: '/voice-settings-controls',
      icon: 'Settings',
      description: 'Audio preferences'
    },
    {
      label: 'Profile',
      path: '/authentication-login-register',
      icon: 'User',
      description: 'Account management'
    }
  ];

  const quickActions = [
    { label: 'New Chat', icon: 'Plus', action: () => navigate('/chat-interface') },
    { label: 'Upload Document', icon: 'Upload', action: () => navigate('/document-management') },
    { label: 'Voice Recording', icon: 'Mic', action: () => navigate('/voice-settings-controls') }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  return (
    <aside className={`fixed left-0 top-16 bottom-0 z-900 bg-surface border-r border-border shadow-elevation-2 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-text-primary">Navigation</h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-all duration-200"
            >
              <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={18} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-medium text-text-secondary mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-all duration-200"
                >
                  <Icon name={action.icon} size={16} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item, index) => (
              <div key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary border border-primary-100' :'text-text-secondary hover:text-text-primary hover:bg-secondary-50'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className="flex items-center space-x-3">
                    <Icon name={item.icon} size={20} />
                    {!isCollapsed && (
                      <div className="flex flex-col items-start">
                        <span>{item.label}</span>
                        <span className="text-xs text-text-secondary group-hover:text-text-primary">
                          {item.description}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-accent text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <Icon name="Zap" size={16} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">AI Assistant</p>
                  <p className="text-xs text-text-secondary">Ready to help</p>
                </div>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse-gentle"></div>
              </div>
              
              <div className="text-xs text-text-secondary text-center">
                <p>DocuAI v2.1.0</p>
                <p>© 2024 All rights reserved</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <Icon name="Zap" size={16} color="white" />
              </div>
              <div className="w-2 h-2 bg-success rounded-full animate-pulse-gentle"></div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;