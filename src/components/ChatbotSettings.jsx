import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './AppIcon';

const ChatbotSettings = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: 'Settings' },
    { id: 'ai', name: 'AI Behavior', icon: 'Brain' },
    { id: 'appearance', name: 'Appearance', icon: 'Palette' },
    { id: 'privacy', name: 'Privacy', icon: 'Shield' }
  ];

  const handleSettingChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-surface rounded-2xl shadow-elevation-4 w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Icon name="Settings" size={20} color="white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Chatbot Settings</h2>
                    <p className="text-primary-100 text-sm">Customize your AI assistant</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <Icon name="X" size={20} color="white" />
                </button>
              </div>
            </div>

            <div className="flex h-96">
              {/* Sidebar */}
              <div className="w-48 bg-secondary-50 border-r border-border">
                <div className="p-4 space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-text-secondary hover:bg-secondary-100 hover:text-text-primary'
                      }`}
                    >
                      <Icon name={tab.icon} size={16} />
                      <span className="text-sm font-medium">{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">General Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-text-primary">Auto-open on new messages</label>
                            <p className="text-xs text-text-secondary">Automatically open chat when new messages arrive</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('autoOpen', !settings.autoOpen)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.autoOpen ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.autoOpen ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-text-primary">Sound notifications</label>
                            <p className="text-xs text-text-secondary">Play sound when receiving messages</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('soundNotifications', !settings.soundNotifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.soundNotifications ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.soundNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-text-primary">Show typing indicators</label>
                            <p className="text-xs text-text-secondary">Display when AI is typing</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('showTyping', !settings.showTyping)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.showTyping ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.showTyping ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">AI Behavior</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Response Style</label>
                          <select
                            value={settings.responseStyle}
                            onChange={(e) => handleSettingChange('responseStyle', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="professional">Professional</option>
                            <option value="friendly">Friendly</option>
                            <option value="casual">Casual</option>
                            <option value="technical">Technical</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Response Length</label>
                          <select
                            value={settings.responseLength}
                            onChange={(e) => handleSettingChange('responseLength', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="concise">Concise</option>
                            <option value="balanced">Balanced</option>
                            <option value="detailed">Detailed</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-text-primary">Smart suggestions</label>
                            <p className="text-xs text-text-secondary">Show relevant follow-up questions</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('smartSuggestions', !settings.smartSuggestions)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.smartSuggestions ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.smartSuggestions ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-text-primary">Context memory</label>
                            <p className="text-xs text-text-secondary">Remember conversation history</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('contextMemory', !settings.contextMemory)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.contextMemory ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.contextMemory ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-text-primary">Voice input</label>
                            <p className="text-xs text-text-secondary">Enable voice-to-text input</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('voiceEnabled', !settings.voiceEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.voiceEnabled ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-text-primary">Auto-speak responses</label>
                            <p className="text-xs text-text-secondary">Automatically read AI responses aloud</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('autoSpeak', !settings.autoSpeak)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.autoSpeak ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.autoSpeak ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Appearance</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Theme</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['light', 'dark', 'auto'].map((theme) => (
                              <button
                                key={theme}
                                onClick={() => handleSettingChange('theme', theme)}
                                className={`p-3 border-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                  settings.theme === theme
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-border bg-surface text-text-primary hover:border-primary'
                                }`}
                              >
                                {theme}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Chat Position</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['bottom-right', 'bottom-left'].map((position) => (
                              <button
                                key={position}
                                onClick={() => handleSettingChange('position', position)}
                                className={`p-3 border-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                  settings.position === position
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-border bg-surface text-text-primary hover:border-primary'
                                }`}
                              >
                                {position.replace('-', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-text-primary">Animations</label>
                            <p className="text-xs text-text-secondary">Enable smooth animations and transitions</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('animations', !settings.animations)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.animations ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.animations ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Privacy & Data</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-text-primary">Save chat history</label>
                            <p className="text-xs text-text-secondary">Store conversations locally for context</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('saveHistory', !settings.saveHistory)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.saveHistory ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.saveHistory ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-text-primary">Analytics</label>
                            <p className="text-xs text-text-secondary">Help improve the AI by sharing usage data</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('analytics', !settings.analytics)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.analytics ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.analytics ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
                                // Handle clear history
                              }
                            }}
                            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                          >
                            Clear Chat History
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotSettings;
