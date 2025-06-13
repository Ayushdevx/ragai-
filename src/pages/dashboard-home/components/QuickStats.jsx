import React from 'react';
import Icon from 'components/AppIcon';

const QuickStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Documents',
      value: stats.totalDocuments,
      change: `+${stats.documentsThisWeek} this week`,
      icon: 'FileText',
      color: 'primary',
      trend: 'up'
    },
    {
      label: 'Conversations',
      value: stats.totalConversations,
      change: `+${stats.conversationsThisWeek} this week`,
      icon: 'MessageCircle',
      color: 'accent',
      trend: 'up'
    },
    {
      label: 'Response Time',
      value: stats.averageResponseTime,
      change: 'Average response',
      icon: 'Zap',
      color: 'success',
      trend: 'stable'
    },
    {
      label: 'Success Rate',
      value: stats.successRate,
      change: 'AI accuracy',
      icon: 'Target',
      color: 'warning',
      trend: 'up'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: {
        bg: 'bg-primary-50',
        border: 'border-primary-100',
        icon: 'text-primary',
        text: 'text-primary-700'
      },
      accent: {
        bg: 'bg-accent-50',
        border: 'border-accent-100',
        icon: 'text-accent',
        text: 'text-accent-700'
      },
      success: {
        bg: 'bg-success-50',
        border: 'border-success-100',
        icon: 'text-success-600',
        text: 'text-success-700'
      },
      warning: {
        bg: 'bg-warning-50',
        border: 'border-warning-100',
        icon: 'text-warning-600',
        text: 'text-warning-700'
      }
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <div className="bg-surface rounded-xl shadow-elevation-2 p-6 border border-border">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Stats</h3>
      
      <div className="space-y-4">
        {statItems.map((item, index) => {
          const colors = getColorClasses(item.color);
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${colors.bg} ${colors.border} transition-all duration-200 hover:shadow-elevation-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <Icon name={item.icon} size={20} className={colors.icon} />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">{item.label}</p>
                    <p className="text-xl font-bold text-text-primary">{item.value}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Icon 
                      name={item.trend === 'up' ? 'TrendingUp' : item.trend === 'down' ? 'TrendingDown' : 'Minus'} 
                      size={14} 
                      className={item.trend === 'up' ? 'text-success-500' : item.trend === 'down' ? 'text-error-500' : 'text-secondary-400'} 
                    />
                    <span className={`text-xs ${colors.text}`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg border border-primary-100">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Calendar" size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary-700">This Week's Activity</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Documents Added:</span>
            <span className="font-semibold text-text-primary ml-2">{stats.documentsThisWeek}</span>
          </div>
          <div>
            <span className="text-text-secondary">New Conversations:</span>
            <span className="font-semibold text-text-primary ml-2">{stats.conversationsThisWeek}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;