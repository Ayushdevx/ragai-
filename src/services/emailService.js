// Email Service for Session Summaries and Notifications
import ragConfig from '../config/ragConfig.js';

class EmailService {
  constructor() {
    this.provider = ragConfig.session.emailNotifications.provider;
    this.client = null;
    this.isEnabled = ragConfig.session.emailNotifications.enabled;
    this.fromEmail = ragConfig.session.emailNotifications.fromEmail;
    this.templates = ragConfig.session.emailNotifications.templates;
  }

  async initialize() {
    if (!this.isEnabled) return;

    try {
      switch (this.provider) {
        case 'resend':
          await this.initializeResend();
          break;
        case 'sendgrid':
          await this.initializeSendGrid();
          break;
        case 'nodemailer':
          await this.initializeNodemailer();
          break;
        default:
          throw new Error(`Unsupported email provider: ${this.provider}`);
      }
      console.log(`Email service (${this.provider}) initialized successfully`);
    } catch (error) {
      console.error('Email service initialization failed:', error);
      this.isEnabled = false;
    }
  }

  async initializeResend() {
    const { Resend } = await import('resend');
    this.client = new Resend(ragConfig.session.emailNotifications.apiKey);
  }

  async initializeSendGrid() {
    const sgMail = await import('@sendgrid/mail');
    sgMail.setApiKey(ragConfig.session.emailNotifications.apiKey);
    this.client = sgMail;
  }

  async initializeNodemailer() {
    const nodemailer = await import('nodemailer');
    
    // Configure SMTP transporter
    this.client = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send welcome email when user provides info
  async sendWelcomeEmail(userInfo) {
    if (!this.isEnabled) return { success: false, reason: 'Email service disabled' };

    try {
      const template = this.templates.welcome;
      const emailData = {
        to: userInfo.email,
        from: this.fromEmail,
        subject: this.renderTemplate(template.subject, {
          name: userInfo.name,
          date: new Date().toLocaleDateString()
        }),
        html: this.renderTemplate(template.html, {
          name: userInfo.name,
          purpose: userInfo.purpose,
          date: new Date().toLocaleDateString(),
          company: userInfo.company || 'your organization'
        })
      };

      const result = await this.sendEmail(emailData);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Welcome email failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send session summary email
  async sendSessionSummary(sessionData, userInfo) {
    if (!this.isEnabled || !userInfo?.email) {
      return { success: false, reason: 'Email service disabled or no user email' };
    }

    try {
      const template = this.templates.sessionSummary;
      const summaryHtml = this.formatSessionSummaryHtml(sessionData);
      
      const emailData = {
        to: userInfo.email,
        from: this.fromEmail,
        subject: this.renderTemplate(template.subject, {
          name: userInfo.name,
          date: new Date().toLocaleDateString()
        }),
        html: this.renderTemplate(template.html, {
          name: userInfo.name,
          sessionId: sessionData.sessionId,
          summary: summaryHtml,
          date: new Date().toLocaleDateString(),
          supportEmail: this.fromEmail
        })
      };

      const result = await this.sendEmail(emailData);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Session summary email failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send moderation alert for incorrect answers
  async sendModerationAlert(feedbackData, userInfo) {
    if (!this.isEnabled) return { success: false, reason: 'Email service disabled' };

    try {
      const moderationEmails = process.env.MODERATION_EMAILS?.split(',') || ['admin@realitsolutions.ai'];
      
      const emailData = {
        to: moderationEmails,
        from: this.fromEmail,
        subject: `[RAG Moderation] Incorrect Answer Reported - ${feedbackData.type}`,
        html: this.formatModerationAlertHtml(feedbackData, userInfo)
      };

      const result = await this.sendEmail(emailData);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Moderation alert email failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Core email sending function
  async sendEmail(emailData) {
    if (!this.client) {
      throw new Error('Email client not initialized');
    }

    switch (this.provider) {
      case 'resend':
        return await this.client.emails.send(emailData);
      
      case 'sendgrid':
        return await this.client.send(emailData);
      
      case 'nodemailer':
        return await this.client.sendMail(emailData);
      
      default:
        throw new Error(`Unsupported email provider: ${this.provider}`);
    }
  }

  // Template rendering
  renderTemplate(template, variables) {
    let rendered = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      rendered = rendered.replace(regex, value || '');
    });
    return rendered;
  }

  // Format session summary as HTML
  formatSessionSummaryHtml(sessionData) {
    const { sessionInfo, keyInsights, interactions, statistics } = sessionData;
    
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          Session Summary
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📊 Session Overview</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><strong>Duration:</strong> ${sessionInfo.duration}</li>
            <li style="margin: 8px 0;"><strong>Total Messages:</strong> ${sessionInfo.interactionCount}</li>
            <li style="margin: 8px 0;"><strong>Documents Discussed:</strong> ${sessionInfo.documentsDiscussed}</li>
            <li style="margin: 8px 0;"><strong>RAG Responses:</strong> ${statistics.ragInteractions}</li>
          </ul>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1f2937;">💡 Key Insights</h3>
          <div style="background: white; border-left: 4px solid #2563eb; padding: 15px; margin: 10px 0;">
            ${keyInsights}
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1f2937;">📈 Session Statistics</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">${statistics.totalMessages}</div>
              <div style="color: #047857;">Total Messages</div>
            </div>
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${statistics.ragInteractions}</div>
              <div style="color: #1d4ed8;">RAG Enhanced</div>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #d97706;">${statistics.documentsUploaded}</div>
              <div style="color: #b45309;">Documents Used</div>
            </div>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1f2937;">📝 Conversation Highlights</h3>
          <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
            ${interactions.slice(0, 5).map((interaction, index) => `
              <div style="padding: 12px; border-bottom: 1px solid #f3f4f6; ${index % 2 === 0 ? 'background: #f9fafb;' : ''}">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">
                  ${new Date(interaction.timestamp).toLocaleString()}
                  ${interaction.ragUsed ? '🔍 RAG Enhanced' : ''}
                </div>
                <div style="margin-bottom: 8px;"><strong>You:</strong> ${interaction.userQuery}</div>
                <div><strong>AI:</strong> ${interaction.aiResponseSummary}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-center;">
          <p style="margin: 0; color: #475569;">
            Thank you for using Real IT Solutions AI! We hope this session was valuable.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">
            Questions or feedback? Reply to this email or contact us at ${ragConfig.session.emailNotifications.fromEmail}
          </p>
        </div>
      </div>
    `;
  }

  // Format moderation alert as HTML
  formatModerationAlertHtml(feedbackData, userInfo) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #fecaca; padding-bottom: 10px;">
          ⚠️ Moderation Alert: ${feedbackData.type.toUpperCase()}
        </h2>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #991b1b; margin-top: 0;">Incident Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><strong>Type:</strong> ${feedbackData.type}</li>
            <li style="margin: 8px 0;"><strong>Message ID:</strong> ${feedbackData.messageId}</li>
            <li style="margin: 8px 0;"><strong>Timestamp:</strong> ${new Date(feedbackData.timestamp).toLocaleString()}</li>
            <li style="margin: 8px 0;"><strong>User:</strong> ${userInfo?.name || 'Anonymous'} (${userInfo?.email || 'No email'})</li>
          </ul>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1f2937;">📄 AI Response (Reported as Incorrect)</h3>
          <div style="background: #f8fafc; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap;">
${feedbackData.messageContent}
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1f2937;">💬 User Feedback</h3>
          <div style="background: white; border-left: 4px solid #dc2626; padding: 15px; margin: 10px 0;">
            ${feedbackData.feedback}
          </div>
        </div>

        <div style="background: #fffbeb; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">🔧 Recommended Actions</h3>
          <ul style="color: #78350f;">
            <li>Review the AI response for accuracy</li>
            <li>Check if the source documents contain correct information</li>
            <li>Consider updating the knowledge base if needed</li>
            <li>Follow up with the user if contact information is available</li>
            <li>Update RAG configuration if this is a recurring issue</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 20px 0; font-size: 14px; color: #64748b;">
          <p>Generated by Real IT Solutions AI Moderation System</p>
          <p>Session ID: ${feedbackData.sessionId || 'Unknown'}</p>
        </div>
      </div>
    `;
  }

  // Batch email sending for notifications
  async sendBatchEmails(emails) {
    if (!this.isEnabled) return { success: false, reason: 'Email service disabled' };

    const results = [];
    for (const emailData of emails) {
      try {
        const result = await this.sendEmail(emailData);
        results.push({ success: true, to: emailData.to, messageId: result.messageId });
      } catch (error) {
        results.push({ success: false, to: emailData.to, error: error.message });
      }
    }

    return {
      success: true,
      results,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }

  // Get email service status
  getStatus() {
    return {
      enabled: this.isEnabled,
      provider: this.provider,
      fromEmail: this.fromEmail,
      clientInitialized: !!this.client,
      templatesConfigured: Object.keys(this.templates).length > 0
    };
  }

  // Test email configuration
  async testEmailConfiguration(testEmail) {
    if (!this.isEnabled) {
      return { success: false, reason: 'Email service disabled' };
    }

    try {
      const testEmailData = {
        to: testEmail,
        from: this.fromEmail,
        subject: 'Real IT Solutions AI - Email Service Test',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">Email Service Test</h2>
            <p>This is a test email to verify that the Real IT Solutions AI email service is working correctly.</p>
            <p><strong>Provider:</strong> ${this.provider}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p>If you received this email, the configuration is working properly!</p>
          </div>
        `
      };

      const result = await this.sendEmail(testEmailData);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
