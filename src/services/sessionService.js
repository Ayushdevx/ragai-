// Session Management Service for User Info and Email Summaries
import ragConfig from '../config/ragConfig.js';
import ragService from './ragService.js';

class SessionService {
  constructor() {
    this.sessions = new Map();
    this.userProfiles = new Map();
    this.emailService = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Initialize email service if enabled
      if (ragConfig.session.emailNotifications.enabled) {
        await this.initializeEmailService();
      }
      
      this.initialized = true;
      console.log('Session Service initialized successfully');
    } catch (error) {
      console.error('Session Service initialization failed:', error);
      // Continue without email features
      this.initialized = true;
    }
  }

  async initializeEmailService() {
    const { provider, apiKey } = ragConfig.session.emailNotifications;
    
    switch (provider) {
      case 'resend':
        const { Resend } = await import('resend');
        this.emailService = new Resend(apiKey);
        break;
      
      case 'sendgrid':
        const sgMail = await import('@sendgrid/mail');
        sgMail.setApiKey(apiKey);
        this.emailService = sgMail;
        break;
      
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }
  }

  // Create new session
  createSession() {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      startTime: new Date(),
      endTime: null,
      status: 'active',
      userInfo: null,
      userInfoCollected: false,
      documents: [],
      interactions: [],
      summary: null,
      emailSent: false
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  // Collect user information
  async collectUserInfo(sessionId, userInfo) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Validate required fields
      const requiredFields = ragConfig.session.requiredFields;
      const missingFields = requiredFields.filter(field => !userInfo[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Store user info
      session.userInfo = {
        ...userInfo,
        collectedAt: new Date(),
        ipAddress: userInfo.ipAddress || 'Unknown',
        userAgent: userInfo.userAgent || 'Unknown'
      };
      
      session.userInfoCollected = true;
      
      // Store in user profiles for future reference
      this.userProfiles.set(userInfo.email, {
        ...session.userInfo,
        lastSession: sessionId,
        sessionCount: (this.userProfiles.get(userInfo.email)?.sessionCount || 0) + 1
      });

      // Send welcome message if configured
      if (ragConfig.session.emailNotifications.enabled) {
        await this.sendWelcomeEmail(session.userInfo);
      }

      return {
        success: true,
        sessionId,
        userInfo: session.userInfo
      };
    } catch (error) {
      console.error('User info collection failed:', error);
      throw error;
    }
  }

  // Record interaction
  recordInteraction(sessionId, interaction) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const interactionRecord = {
        id: this.generateInteractionId(),
        timestamp: new Date(),
        type: interaction.type || 'chat',
        userMessage: interaction.userMessage,
        aiResponse: interaction.aiResponse,
        ragUsed: interaction.ragUsed || false,
        documentsReferenced: interaction.documentsReferenced || [],
        duration: interaction.duration || 0
      };

      session.interactions.push(interactionRecord);
      return interactionRecord;
    } catch (error) {
      console.error('Failed to record interaction:', error);
      throw error;
    }
  }

  // End session and generate summary
  async endSession(sessionId, options = {}) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.endTime = new Date();
      session.status = 'completed';

      // Generate session summary if enabled
      if (ragConfig.session.summaryEnabled) {
        session.summary = await this.generateSessionSummary(session);
      }

      // Send summary email if user info collected and email enabled
      if (session.userInfoCollected && 
          ragConfig.session.emailNotifications.enabled && 
          !session.emailSent) {
        await this.sendSessionSummaryEmail(session);
        session.emailSent = true;
      }

      return {
        success: true,
        sessionId,
        summary: session.summary,
        duration: this.calculateDuration(session.startTime, session.endTime)
      };
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }

  // Generate comprehensive session summary
  async generateSessionSummary(session) {
    try {
      const duration = this.calculateDuration(session.startTime, session.endTime);
      const documentNames = session.documents.map(doc => doc.name).join(', ') || 'None';
      const interactionCount = session.interactions.length;
      
      // Extract key topics and insights
      const userMessages = session.interactions.map(i => i.userMessage).join('\n');
      const aiResponses = session.interactions.map(i => i.aiResponse).join('\n');
      
      // Use RAG service to generate intelligent summary
      const summaryData = await ragService.generateSessionSummary(sessionId);
      
      const summary = {
        sessionInfo: {
          sessionId: session.id,
          startTime: session.startTime,
          endTime: session.endTime,
          duration,
          interactionCount,
          documentsDiscussed: documentNames
        },
        userInfo: session.userInfo,
        keyInsights: summaryData.summary,
        interactions: session.interactions.map(i => ({
          timestamp: i.timestamp,
          userQuery: i.userMessage.substring(0, 100) + '...',
          aiResponseSummary: i.aiResponse.substring(0, 100) + '...',
          ragUsed: i.ragUsed
        })),
        statistics: {
          totalMessages: interactionCount,
          ragInteractions: session.interactions.filter(i => i.ragUsed).length,
          documentsUploaded: session.documents.length,
          averageResponseTime: this.calculateAverageResponseTime(session.interactions)
        },
        generatedAt: new Date()
      };

      return summary;
    } catch (error) {
      console.error('Summary generation failed:', error);
      return {
        error: 'Failed to generate summary',
        sessionId: session.id,
        basicInfo: {
          duration: this.calculateDuration(session.startTime, session.endTime),
          interactions: session.interactions.length
        }
      };
    }
  }

  // Send welcome email
  async sendWelcomeEmail(userInfo) {
    if (!this.emailService) return;

    try {
      const { provider, fromEmail, templates } = ragConfig.session.emailNotifications;
      const template = templates.welcome;

      const emailContent = {
        from: fromEmail,
        to: userInfo.email,
        subject: template.subject.replace('{name}', userInfo.name),
        html: this.renderEmailTemplate(template.html, {
          name: userInfo.name,
          purpose: userInfo.purpose,
          date: new Date().toLocaleDateString()
        })
      };

      if (provider === 'resend') {
        await this.emailService.emails.send(emailContent);
      } else if (provider === 'sendgrid') {
        await this.emailService.send(emailContent);
      }

      console.log(`Welcome email sent to ${userInfo.email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  // Send session summary email
  async sendSessionSummaryEmail(session) {
    if (!this.emailService || !session.userInfo) return;

    try {
      const { provider, fromEmail, templates } = ragConfig.session.emailNotifications;
      const template = templates.sessionSummary;

      const summaryText = this.formatSummaryForEmail(session.summary);
      
      const emailContent = {
        from: fromEmail,
        to: session.userInfo.email,
        subject: template.subject.replace('{date}', new Date().toLocaleDateString()),
        html: this.renderEmailTemplate(template.html, {
          name: session.userInfo.name,
          summary: summaryText,
          sessionId: session.id,
          date: new Date().toLocaleDateString()
        })
      };

      if (provider === 'resend') {
        await this.emailService.emails.send(emailContent);
      } else if (provider === 'sendgrid') {
        await this.emailService.send(emailContent);
      }

      console.log(`Session summary email sent to ${session.userInfo.email}`);
    } catch (error) {
      console.error('Failed to send session summary email:', error);
    }
  }

  // Format summary for email
  formatSummaryForEmail(summary) {
    if (!summary || summary.error) {
      return 'Summary generation encountered an error. Please contact support if needed.';
    }

    return `
      <h3>Session Overview</h3>
      <ul>
        <li><strong>Duration:</strong> ${summary.sessionInfo.duration}</li>
        <li><strong>Total Interactions:</strong> ${summary.sessionInfo.interactionCount}</li>
        <li><strong>Documents Discussed:</strong> ${summary.sessionInfo.documentsDiscussed}</li>
      </ul>
      
      <h3>Key Insights</h3>
      <div>${summary.keyInsights}</div>
      
      <h3>Statistics</h3>
      <ul>
        <li>RAG-enhanced responses: ${summary.statistics.ragInteractions}</li>
        <li>Documents uploaded: ${summary.statistics.documentsUploaded}</li>
        <li>Average response time: ${summary.statistics.averageResponseTime}ms</li>
      </ul>
    `;
  }

  // Render email template
  renderEmailTemplate(template, variables) {
    let rendered = template;
    Object.entries(variables).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return rendered;
  }

  // Get session info
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  // Get user profile
  getUserProfile(email) {
    return this.userProfiles.get(email);
  }

  // Check if user info is required
  isUserInfoRequired(sessionId) {
    const session = this.sessions.get(sessionId);
    return ragConfig.session.enabled && 
           ragConfig.session.requiredFields.length > 0 && 
           (!session || !session.userInfoCollected);
  }
  // Get user info collection form fields
  getUserInfoFields() {
    try {
      const fields = ragConfig.session?.requiredFields || ['name', 'email'];
      const fieldConfig = ragConfig.session?.fieldConfig || {};
      
      return fields.filter(field => field).map(field => ({
        name: field,
        label: fieldConfig[field]?.label || field.charAt(0).toUpperCase() + field.slice(1),
        type: fieldConfig[field]?.type || 'text',
        required: true,
        placeholder: fieldConfig[field]?.placeholder || `Enter your ${field}`
      }));
    } catch (error) {
      console.error('Error getting user info fields:', error);
      // Return default fields if config is broken
      return [
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter your name' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter your email' }
      ];
    }
  }

  // Check session timeout
  isSessionExpired(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return true;

    const now = new Date();
    const lastActivity = session.interactions.length > 0 
      ? session.interactions[session.interactions.length - 1].timestamp 
      : session.startTime;
    
    const timeDiff = now - lastActivity;
    return timeDiff > ragConfig.session.timeout;
  }

  // Cleanup expired sessions
  cleanupExpiredSessions() {
    const expiredSessions = [];
    
    this.sessions.forEach((session, sessionId) => {
      if (this.isSessionExpired(sessionId)) {
        expiredSessions.push(sessionId);
      }
    });

    expiredSessions.forEach(sessionId => {
      console.log(`Cleaning up expired session: ${sessionId}`);
      this.sessions.delete(sessionId);
    });

    return expiredSessions.length;
  }

  // Helper methods
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateInteractionId() {
    return 'interaction_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  calculateDuration(startTime, endTime) {
    if (!endTime) endTime = new Date();
    const duration = endTime - startTime;
    const minutes = Math.round(duration / (1000 * 60));
    return minutes < 1 ? 'Less than 1 minute' : `${minutes} minutes`;
  }

  calculateAverageResponseTime(interactions) {
    if (!interactions || interactions.length === 0) return 0;
    
    const totalDuration = interactions.reduce((sum, i) => sum + (i.duration || 0), 0);
    return Math.round(totalDuration / interactions.length);
  }

  // Get session statistics
  getSessionStats() {
    const totalSessions = this.sessions.size;
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.status === 'active').length;
    const completedSessions = Array.from(this.sessions.values()).filter(s => s.status === 'completed').length;
    const totalUsers = this.userProfiles.size;

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      totalUsers,
      emailsEnabled: ragConfig.session.emailNotifications.enabled,
      userInfoRequired: ragConfig.session.requiredFields.length > 0
    };
  }
}

export default new SessionService();
