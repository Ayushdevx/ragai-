// Moderation Component for Feedback Collection
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HandThumbDownIcon,
  HandThumbUpIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import ragConfig from '../config/ragConfig.js';

const ModerationPanel = ({ 
  messageId, 
  messageContent, 
  onFeedbackSubmit, 
  className = "" 
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleThumbsUp = () => {
    if (onFeedbackSubmit) {
      onFeedbackSubmit({
        messageId,
        type: 'positive',
        feedback: 'Helpful response',
        messageContent
      });
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const handleThumbsDown = () => {
    setFeedbackType('negative');
    setShowFeedback(true);
  };

  const handleReportIncorrect = () => {
    setFeedbackType('incorrect');
    setShowFeedback(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        messageId,
        type: feedbackType,
        feedback: feedbackText,
        messageContent,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      // Submit feedback
      if (onFeedbackSubmit) {
        await onFeedbackSubmit(feedbackData);
      }

      // Send to moderation webhook if configured
      if (ragConfig.moderation.webhook.url) {
        await submitToModerationWebhook(feedbackData);
      }

      setSubmitted(true);
      setShowFeedback(false);
      setFeedbackText('');
      
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitToModerationWebhook = async (feedbackData) => {
    try {
      const response = await fetch(ragConfig.moderation.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': ragConfig.moderation.webhook.secret
        },
        body: JSON.stringify({
          type: 'feedback',
          data: feedbackData,
          severity: feedbackData.type === 'incorrect' ? 'high' : 'medium'
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook submission failed:', error);
    }
  };

  const getFeedbackPrompts = () => {
    switch (feedbackType) {
      case 'negative':
        return {
          title: 'Help us improve',
          placeholder: 'What could be better about this response?',
          examples: [
            'Response was too vague',
            'Missing important information',
            'Tone was inappropriate',
            'Didn\'t answer my question'
          ]
        };
      case 'incorrect':
        return {
          title: 'Report incorrect information',
          placeholder: 'Please describe what information was incorrect and provide the correct information if possible.',
          examples: [
            'Factual error in the response',
            'Outdated information provided',
            'Misinterpretation of my question',
            'Wrong data or statistics cited'
          ]
        };
      default:
        return { title: '', placeholder: '', examples: [] };
    }
  };

  if (!ragConfig.moderation.enabled) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Feedback Buttons */}
      <AnimatePresence>
        {!submitted && !showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-1"
          >
            {/* Thumbs Up */}
            <motion.button
              onClick={handleThumbsUp}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="This was helpful"
            >
              <HandThumbUpIcon className="w-4 h-4" />
            </motion.button>

            {/* Thumbs Down */}
            <motion.button
              onClick={handleThumbsDown}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="This wasn't helpful"
            >
              <HandThumbDownIcon className="w-4 h-4" />
            </motion.button>

            {/* Report Incorrect */}
            <motion.button
              onClick={handleReportIncorrect}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/20 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              title="Report incorrect information"
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submitted Confirmation */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center space-x-2 text-green-600 dark:text-green-400"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Thank you for your feedback!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Form */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10"
          >
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getFeedbackPrompts().title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your feedback helps us improve our AI responses
                </p>
              </div>

              {/* Quick Examples */}
              {getFeedbackPrompts().examples.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Common issues:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getFeedbackPrompts().examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setFeedbackText(example)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Text Area */}
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={getFeedbackPrompts().placeholder}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedbackText('');
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                
                <motion.button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim() || isSubmitting}
                  whileHover={{ scale: feedbackText.trim() && !isSubmitting ? 1.05 : 1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex items-center space-x-1 px-3 py-1.5 text-sm rounded-md transition-colors
                    ${feedbackText.trim() && !isSubmitting
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-3 h-3" />
                      <span>Submit</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModerationPanel;
