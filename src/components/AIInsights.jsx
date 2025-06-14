// AI Insights Component - Real-time AI Performance Display
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Clock, Target, TrendingUp, Activity, 
  MessageSquare, Mic, Speaker, BarChart3 
} from 'lucide-react';
import analyticsService from '../services/analyticsService';

const AIInsights = ({ messages, isVisible = true }) => {
  const [insights, setInsights] = useState({
    responseTime: 0,
    confidence: 0,
    tokensUsed: 0,
    contextLength: 0,
    ragUsage: 0,
    voiceInteractions: 0
  });
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    messagesPerMinute: 0,
    averageResponseTime: 0,
    aiAccuracy: 85,
    userSatisfaction: 4.2
  });

  useEffect(() => {
    if (messages.length > 0) {
      calculateInsights();
      updateRealtimeMetrics();
    }
  }, [messages]);

  const calculateInsights = () => {
    const aiMessages = messages.filter(m => m.type === 'ai');
    const userMessages = messages.filter(m => m.type === 'user');
    
    if (aiMessages.length === 0) return;

    // Calculate average response time (simulated)
    const avgResponseTime = aiMessages.reduce((sum, msg, index) => {
      if (index > 0) {
        const prevMsg = messages[messages.indexOf(msg) - 1];
        const timeDiff = new Date(msg.timestamp) - new Date(prevMsg.timestamp);
        return sum + timeDiff;
      }
      return sum;
    }, 0) / Math.max(aiMessages.length - 1, 1);

    // Calculate context length
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    
    // Calculate RAG usage
    const ragMessages = aiMessages.filter(m => m.ragUsed);
    const ragUsagePercent = (ragMessages.length / aiMessages.length) * 100;

    setInsights({
      responseTime: Math.min(avgResponseTime / 1000, 5), // Convert to seconds, max 5s
      confidence: 75 + Math.random() * 20, // Simulated confidence 75-95%
      tokensUsed: Math.floor(totalChars / 4), // Rough token estimation
      contextLength: totalChars,
      ragUsage: ragUsagePercent,
      voiceInteractions: userMessages.filter(m => m.isVoice).length
    });
  };

  const updateRealtimeMetrics = () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    const recentMessages = messages.filter(m => 
      new Date(m.timestamp) > oneMinuteAgo && m.type === 'user'
    );

    setRealtimeMetrics(prev => ({
      ...prev,
      messagesPerMinute: recentMessages.length,
      averageResponseTime: insights.responseTime,
      aiAccuracy: 82 + Math.random() * 16, // 82-98%
      userSatisfaction: 3.8 + Math.random() * 1.4 // 3.8-5.2
    }));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num);
  };

  const getStatusColor = (value, type) => {
    switch (type) {
      case 'responseTime':
        return value < 2 ? 'text-green-500' : value < 4 ? 'text-yellow-500' : 'text-red-500';
      case 'confidence':
        return value > 85 ? 'text-green-500' : value > 70 ? 'text-yellow-500' : 'text-red-500';
      case 'accuracy':
        return value > 90 ? 'text-green-500' : value > 80 ? 'text-yellow-500' : 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const metricCards = [
    {
      icon: Clock,
      label: 'Response Time',
      value: `${insights.responseTime.toFixed(1)}s`,
      color: getStatusColor(insights.responseTime, 'responseTime'),
      bgColor: 'from-blue-500/10 to-blue-600/10'
    },
    {
      icon: Target,
      label: 'Confidence',
      value: `${insights.confidence.toFixed(0)}%`,
      color: getStatusColor(insights.confidence, 'confidence'),
      bgColor: 'from-green-500/10 to-green-600/10'
    },
    {
      icon: Brain,
      label: 'Tokens Used',
      value: formatNumber(insights.tokensUsed),
      color: 'text-purple-500',
      bgColor: 'from-purple-500/10 to-purple-600/10'
    },
    {
      icon: Activity,
      label: 'RAG Usage',
      value: `${insights.ragUsage.toFixed(0)}%`,
      color: 'text-orange-500',
      bgColor: 'from-orange-500/10 to-orange-600/10'
    }
  ];

  const realtimeCards = [
    {
      icon: MessageSquare,
      label: 'Messages/Min',
      value: realtimeMetrics.messagesPerMinute,
      color: 'text-indigo-500'
    },
    {
      icon: Zap,
      label: 'AI Accuracy',
      value: `${realtimeMetrics.aiAccuracy.toFixed(0)}%`,
      color: getStatusColor(realtimeMetrics.aiAccuracy, 'accuracy')
    },
    {
      icon: TrendingUp,
      label: 'Satisfaction',
      value: `${realtimeMetrics.userSatisfaction.toFixed(1)}/5`,
      color: 'text-pink-500'
    }
  ];

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-800">AI Insights</h3>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${metric.bgColor} p-3 rounded-lg border border-gray-100`}
          >
            <div className="flex items-center gap-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">{metric.label}</p>
                <p className={`text-sm font-semibold ${metric.color}`}>{metric.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Realtime Metrics */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center gap-3">
          {realtimeCards.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-1.5 text-xs"
            >
              <metric.icon className={`w-3 h-3 ${metric.color}`} />
              <span className="text-gray-600">{metric.label}:</span>
              <span className={`font-medium ${metric.color}`}>{metric.value}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Context Info */}
      {insights.contextLength > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-3 pt-3 border-t border-gray-200"
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Context: {formatNumber(insights.contextLength)} chars</span>
            {insights.voiceInteractions > 0 && (
              <div className="flex items-center gap-1">
                <Mic className="w-3 h-3" />
                <span>{insights.voiceInteractions} voice</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIInsights;
