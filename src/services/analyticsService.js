// Enhanced Analytics Service for AI Chatbot Dashboard
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

class AnalyticsService {
  constructor() {
    this.metrics = {
      conversations: [],
      voiceUsage: [],
      aiPerformance: [],
      userEngagement: [],
      documentInteractions: []
    };
    this.init();
  }

  init() {
    // Load existing analytics from localStorage
    const stored = localStorage.getItem('chatbot_analytics');
    if (stored) {
      this.metrics = { ...this.metrics, ...JSON.parse(stored) };
    }
    
    // Generate demo data if empty
    if (this.metrics.conversations.length === 0) {
      this.generateDemoData();
    }
  }

  // Track conversation metrics
  trackConversation(data) {
    const conversation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      duration: data.duration || 0,
      messageCount: data.messageCount || 0,
      voiceUsed: data.voiceUsed || false,
      documentsUsed: data.documentsUsed || false,
      userSatisfaction: data.satisfaction || null,
      aiModel: data.aiModel || 'gemini-1.5-flash',
      sessionId: data.sessionId
    };
    
    this.metrics.conversations.push(conversation);
    this.saveMetrics();
  }

  // Track voice feature usage
  trackVoiceUsage(action, duration = 0) {
    const voiceEvent = {
      timestamp: new Date().toISOString(),
      action, // 'stt_start', 'stt_end', 'tts_start', 'tts_end', 'conversation_mode'
      duration,
      success: true
    };
    
    this.metrics.voiceUsage.push(voiceEvent);
    this.saveMetrics();
  }

  // Track AI performance metrics
  trackAIPerformance(data) {
    const performance = {
      timestamp: new Date().toISOString(),
      responseTime: data.responseTime,
      tokenCount: data.tokenCount || 0,
      confidence: data.confidence || 0.8,
      model: data.model || 'gemini-1.5-flash',
      success: data.success !== false
    };
    
    this.metrics.aiPerformance.push(performance);
    this.saveMetrics();
  }

  // Track user engagement
  trackEngagement(event, value = 1) {
    const engagement = {
      timestamp: new Date().toISOString(),
      event, // 'message_sent', 'voice_used', 'document_uploaded', 'feedback_given'
      value
    };
    
    this.metrics.userEngagement.push(engagement);
    this.saveMetrics();
  }

  // Get conversations data for charts
  getConversationsData(days = 7) {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const filtered = this.metrics.conversations.filter(conv => 
      new Date(conv.timestamp) >= startDate
    );

    const dailyData = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayConversations = filtered.filter(conv => {
        const convDate = new Date(conv.timestamp);
        return convDate >= dayStart && convDate <= dayEnd;
      });
      
      dailyData.unshift({
        date: format(date, 'MMM dd'),
        conversations: dayConversations.length,
        voiceUsed: dayConversations.filter(c => c.voiceUsed).length,
        avgDuration: dayConversations.reduce((sum, c) => sum + c.duration, 0) / (dayConversations.length || 1),
        satisfaction: dayConversations
          .filter(c => c.userSatisfaction)
          .reduce((sum, c) => sum + c.userSatisfaction, 0) / 
          (dayConversations.filter(c => c.userSatisfaction).length || 1)
      });
    }
    
    return dailyData;
  }

  // Get voice usage statistics
  getVoiceStats(days = 7) {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const voiceEvents = this.metrics.voiceUsage.filter(event => 
      new Date(event.timestamp) >= startDate
    );

    const stats = {
      totalUsage: voiceEvents.length,
      sttUsage: voiceEvents.filter(e => e.action.includes('stt')).length,
      ttsUsage: voiceEvents.filter(e => e.action.includes('tts')).length,
      conversationMode: voiceEvents.filter(e => e.action === 'conversation_mode').length,
      avgDuration: voiceEvents.reduce((sum, e) => sum + e.duration, 0) / (voiceEvents.length || 1)
    };

    const dailyVoice = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayEvents = voiceEvents.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= dayStart && eventDate <= dayEnd;
      });
      
      dailyVoice.unshift({
        date: format(date, 'MMM dd'),
        stt: dayEvents.filter(e => e.action.includes('stt')).length,
        tts: dayEvents.filter(e => e.action.includes('tts')).length,
        total: dayEvents.length
      });
    }
    
    return { stats, dailyVoice };
  }

  // Get AI performance metrics
  getAIPerformanceData(days = 7) {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const performance = this.metrics.aiPerformance.filter(perf => 
      new Date(perf.timestamp) >= startDate
    );

    const dailyPerformance = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayPerf = performance.filter(perf => {
        const perfDate = new Date(perf.timestamp);
        return perfDate >= dayStart && perfDate <= dayEnd;
      });
      
      dailyPerformance.unshift({
        date: format(date, 'MMM dd'),
        avgResponseTime: dayPerf.reduce((sum, p) => sum + p.responseTime, 0) / (dayPerf.length || 1),
        avgConfidence: dayPerf.reduce((sum, p) => sum + p.confidence, 0) / (dayPerf.length || 1),
        successRate: (dayPerf.filter(p => p.success).length / (dayPerf.length || 1)) * 100,
        totalRequests: dayPerf.length
      });
    }
    
    return dailyPerformance;
  }

  // Get user engagement metrics
  getEngagementData(days = 7) {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const engagement = this.metrics.userEngagement.filter(eng => 
      new Date(eng.timestamp) >= startDate
    );

    const eventTypes = ['message_sent', 'voice_used', 'document_uploaded', 'feedback_given'];
    const engagementByType = eventTypes.map(type => ({
      type,
      count: engagement.filter(e => e.event === type).length,
      value: engagement.filter(e => e.event === type).reduce((sum, e) => sum + e.value, 0)
    }));

    return {
      total: engagement.length,
      byType: engagementByType,
      trending: this.calculateTrend(engagement)
    };
  }

  // Calculate trend (positive/negative change)
  calculateTrend(data) {
    if (data.length < 2) return 0;
    
    const midPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midPoint).length;
    const secondHalf = data.slice(midPoint).length;
    
    return ((secondHalf - firstHalf) / firstHalf) * 100;
  }

  // Generate demo data for visualization
  generateDemoData() {
    const now = new Date();
    
    // Generate conversations
    for (let i = 0; i < 30; i++) {
      const date = subDays(now, i);
      const conversationsPerDay = Math.floor(Math.random() * 15) + 5;
      
      for (let j = 0; j < conversationsPerDay; j++) {
        this.metrics.conversations.push({
          id: Date.now() + i * 1000 + j,
          timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          duration: Math.floor(Math.random() * 300) + 30,
          messageCount: Math.floor(Math.random() * 20) + 3,
          voiceUsed: Math.random() > 0.6,
          documentsUsed: Math.random() > 0.7,
          userSatisfaction: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 3 : null,
          aiModel: 'gemini-1.5-flash',
          sessionId: `session_${i}_${j}`
        });
      }
    }

    // Generate voice usage
    for (let i = 0; i < 100; i++) {
      const actions = ['stt_start', 'stt_end', 'tts_start', 'tts_end', 'conversation_mode'];
      this.metrics.voiceUsage.push({
        timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        action: actions[Math.floor(Math.random() * actions.length)],
        duration: Math.floor(Math.random() * 60) + 5,
        success: Math.random() > 0.1
      });
    }

    // Generate AI performance
    for (let i = 0; i < 200; i++) {
      this.metrics.aiPerformance.push({
        timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        responseTime: Math.floor(Math.random() * 3000) + 500,
        tokenCount: Math.floor(Math.random() * 1000) + 50,
        confidence: 0.6 + Math.random() * 0.4,
        model: 'gemini-1.5-flash',
        success: Math.random() > 0.05
      });
    }

    // Generate engagement
    const events = ['message_sent', 'voice_used', 'document_uploaded', 'feedback_given'];
    for (let i = 0; i < 150; i++) {
      this.metrics.userEngagement.push({
        timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        event: events[Math.floor(Math.random() * events.length)],
        value: Math.floor(Math.random() * 5) + 1
      });
    }

    this.saveMetrics();
  }

  // Save metrics to localStorage
  saveMetrics() {
    localStorage.setItem('chatbot_analytics', JSON.stringify(this.metrics));
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = {
      conversations: [],
      voiceUsage: [],
      aiPerformance: [],
      userEngagement: [],
      documentInteractions: []
    };
    localStorage.removeItem('chatbot_analytics');
  }

  // Export metrics for reporting
  exportMetrics() {
    return {
      exportDate: new Date().toISOString(),
      totalConversations: this.metrics.conversations.length,
      totalVoiceUsage: this.metrics.voiceUsage.length,
      totalAIRequests: this.metrics.aiPerformance.length,
      averageResponseTime: this.metrics.aiPerformance.reduce((sum, p) => sum + p.responseTime, 0) / 
                          (this.metrics.aiPerformance.length || 1),
      voiceAdoptionRate: (this.metrics.conversations.filter(c => c.voiceUsed).length / 
                         (this.metrics.conversations.length || 1)) * 100,
      data: this.metrics
    };
  }
}

export default new AnalyticsService();
