import React from 'react';
import Icon from 'components/AppIcon';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'document_upload',
      title: 'Uploaded Financial Report',
      description: 'Q3_Financial_Report.pdf',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      icon: 'Upload',
      color: 'accent'
    },
    {
      id: 2,
      type: 'conversation_start',
      title: 'Started new conversation',
      description: 'Research Paper Discussion',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      icon: 'MessageCircle',
      color: 'primary'
    },
    {
      id: 3,
      type: 'document_analysis',
      title: 'Document analysis completed',
      description: 'Legal_Contract.pdf processed',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      icon: 'CheckCircle',
      color: 'success'
    },
    {
      id: 4,
      type: 'voice_interaction',
      title: 'Voice command processed',
      description: 'Summarize document request',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      icon: 'Mic',
      color: 'warning'
    },
    {
      id: 5,
      type: 'conversation_export',
      title: 'Conversation exported',
      description: 'Marketing Strategy Analysis',
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      icon: 'Download',
      color: 'secondary'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: {
        bg: 'bg-primary-100',
        icon: 'text-primary'
      },
      accent: {
        bg: 'bg-accent-100',
        icon: 'text-accent'
      },
      success: {
        bg: 'bg-success-100',
        icon: 'text-success-600'
      },
      warning: {
        bg: 'bg-warning-100',
        icon: 'text-warning-600'
      },
      secondary: {
        bg: 'bg-secondary-100',
        icon: 'text-secondary-600'
      }
    };
    return colorMap[color] || colorMap.primary;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-surface rounded-xl shadow-elevation-2 p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
        <button className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const colors = getColorClasses(activity.color);
          
          return (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 hover:bg-secondary-50 rounded-lg transition-all duration-200 cursor-pointer group"
            >
              <div className={`w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon name={activity.icon} size={16} className={colors.icon} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors duration-200">
                    {activity.title}
                  </p>
                  <span className="text-xs text-text-secondary">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 truncate">
                  {activity.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Today's Activity</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-text-secondary">5 actions</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-text-secondary">3 uploads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Activity Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['All', 'Uploads', 'Chats', 'Analysis'].map((filter, index) => (
          <button
            key={index}
            className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
              index === 0
                ? 'bg-primary text-white' :'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;