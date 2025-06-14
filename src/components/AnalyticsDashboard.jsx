// Enhanced Analytics Dashboard with Recharts and Chart.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ArcElement,
  BarElement,
  RadialLinearScale
} from 'chart.js';
import { Doughnut, Radar } from 'react-chartjs-2';
import {
  Activity, TrendingUp, TrendingDown, Users, MessageSquare, Mic,
  Speaker, Brain, Clock, Target, BarChart3, PieChart as PieChartIcon,
  Download, RefreshCw, Calendar, Zap
} from 'lucide-react';
import analyticsService from '../services/analyticsService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend,
  ArcElement,
  BarElement,
  RadialLinearScale
);

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState(7);
  const [conversationsData, setConversationsData] = useState([]);
  const [voiceData, setVoiceData] = useState({ stats: {}, dailyVoice: [] });
  const [performanceData, setPerformanceData] = useState([]);
  const [engagementData, setEngagementData] = useState({ total: 0, byType: [], trending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setConversationsData(analyticsService.getConversationsData(timeRange));
      setVoiceData(analyticsService.getVoiceStats(timeRange));
      setPerformanceData(analyticsService.getAIPerformanceData(timeRange));
      setEngagementData(analyticsService.getEngagementData(timeRange));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toFixed(0) || '0';
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  // Color schemes
  const colors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    indigo: '#6366f1',
    gradient: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  };

  // Metric cards data
  const metricCards = [
    {
      title: 'Total Conversations',
      value: conversationsData.reduce((sum, d) => sum + d.conversations, 0),
      change: '+12%',
      trend: 'up',
      icon: MessageSquare,
      color: colors.primary
    },
    {
      title: 'Voice Interactions',
      value: voiceData.stats.totalUsage || 0,
      change: '+28%',
      trend: 'up',
      icon: Mic,
      color: colors.secondary
    },
    {
      title: 'Avg Response Time',
      value: performanceData.length ? 
        `${(performanceData.reduce((sum, d) => sum + d.avgResponseTime, 0) / performanceData.length).toFixed(0)}ms` : '0ms',
      change: '-8%',
      trend: 'down',
      icon: Clock,
      color: colors.accent
    },
    {
      title: 'User Satisfaction',
      value: conversationsData.length ?
        `${(conversationsData.reduce((sum, d) => sum + (d.satisfaction || 0), 0) / conversationsData.length).toFixed(1)}/5` : '0/5',
      change: '+5%',
      trend: 'up',
      icon: Target,
      color: colors.purple
    }
  ];

  // Chart configurations
  const voiceUsageChartData = {
    labels: voiceData.dailyVoice.map(d => d.date),
    datasets: [
      {
        label: 'Speech-to-Text',
        data: voiceData.dailyVoice.map(d => d.stt),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: colors.primary,
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Text-to-Speech',
        data: voiceData.dailyVoice.map(d => d.tts),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: colors.secondary,
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  const engagementPieData = {
    labels: engagementData.byType.map(e => e.type.replace('_', ' ').toUpperCase()),
    datasets: [
      {
        data: engagementData.byType.map(e => e.count),
        backgroundColor: colors.gradient,
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const performanceRadarData = {
    labels: ['Speed', 'Accuracy', 'Reliability', 'User Satisfaction', 'Voice Quality'],
    datasets: [
      {
        label: 'AI Performance',
        data: [85, 92, 88, 90, 87],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: colors.indigo,
        pointBackgroundColor: colors.indigo,
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: colors.indigo
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your AI chatbot performance and user engagement</p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
              <button
                onClick={loadDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={() => {
                  const data = analyticsService.exportMetrics();
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(metric.value)}</p>
                </div>
                <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${metric.color}20` }}>
                  <metric.icon size={24} style={{ color: metric.color }} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {metric.trend === 'up' ? (
                  <TrendingUp size={16} className="text-green-500 mr-1" />
                ) : (
                  <TrendingDown size={16} className="text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change}
                </span>
                <span className="text-gray-500 text-sm ml-1">from last period</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Conversations Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Conversations</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={conversationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="conversations"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="voiceUsed"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Voice Usage Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Feature Usage</h3>
            <div style={{ height: '300px' }}>
              <Doughnut 
                data={voiceUsageChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Performance Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Performance</h3>
            <div style={{ height: '250px' }}>
              <Radar
                data={performanceRadarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Response Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toFixed(0)}ms`, 'Response Time']} />
                <Line
                  type="monotone"
                  dataKey="avgResponseTime"
                  stroke={colors.accent}
                  strokeWidth={3}
                  dot={{ fill: colors.accent, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* User Engagement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
            <div style={{ height: '250px' }}>
              <Doughnut
                data={engagementPieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Detailed Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="successRate" fill={colors.secondary} name="Success Rate %" />
              <Bar dataKey="avgConfidence" fill={colors.purple} name="Confidence Score" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
