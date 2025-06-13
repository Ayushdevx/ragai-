import React from 'react';
import Icon from 'components/AppIcon';

const AccessibilityOptions = ({ settings, onSettingChange }) => {
  const accessibilityFeatures = [
    {
      id: 'visualFeedback',
      title: 'Visual Feedback for Voice Commands',
      description: 'Show visual indicators when voice commands are recognized',
      icon: 'Eye',
      category: 'visual'
    },
    {
      id: 'transcriptDisplay',
      title: 'Real-time Transcript Display',
      description: 'Show live transcription of speech during conversations',
      icon: 'FileText',
      category: 'visual'
    },
    {
      id: 'highContrast',
      title: 'High Contrast Mode',
      description: 'Increase contrast for better visibility of interface elements',
      icon: 'Contrast',
      category: 'visual'
    },
    {
      id: 'largeControls',
      title: 'Large Control Elements',
      description: 'Increase size of buttons and interactive elements',
      icon: 'Maximize',
      category: 'interaction'
    }
  ];

  const voiceCommands = [
    { command: 'Start recording', description: 'Begin voice input session' },
    { command: 'Stop recording', description: 'End current voice input' },
    { command: 'Clear chat', description: 'Clear conversation history' },
    { command: 'Upload document', description: 'Open file upload dialog' },
    { command: 'Read response', description: 'Read last AI response aloud' },
    { command: 'Pause reading', description: 'Pause text-to-speech playback' },
    { command: 'Resume reading', description: 'Resume text-to-speech playback' },
    { command: 'Increase volume', description: 'Increase speech volume' },
    { command: 'Decrease volume', description: 'Decrease speech volume' },
    { command: 'Repeat that', description: 'Repeat the last response' }
  ];

  const keyboardShortcuts = [
    { keys: 'Ctrl + M', description: 'Toggle microphone on/off' },
    { keys: 'Ctrl + R', description: 'Start/stop recording' },
    { keys: 'Ctrl + P', description: 'Play/pause text-to-speech' },
    { keys: 'Ctrl + T', description: 'Toggle transcript display' },
    { keys: 'Ctrl + U', description: 'Upload document' },
    { keys: 'Ctrl + L', description: 'Clear conversation' },
    { keys: 'Ctrl + S', description: 'Save conversation' },
    { keys: 'Ctrl + H', description: 'Show help dialog' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Accessibility Options</h2>
        <p className="text-text-secondary">Configure accessibility features to improve usability for users with different needs and preferences.</p>
      </div>

      <div className="space-y-8">
        {/* Visual Accessibility */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Eye" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Visual Accessibility</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessibilityFeatures.filter(feature => feature.category === 'visual').map((feature) => (
              <div
                key={feature.id}
                className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <Icon name={feature.icon} size={20} className="text-primary mt-1" />
                  <div>
                    <h4 className="font-medium text-text-primary">{feature.title}</h4>
                    <p className="text-sm text-text-secondary mt-1">{feature.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[feature.id]}
                    onChange={(e) => onSettingChange(feature.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>

          {/* Visual Feedback Preview */}
          {settings.visualFeedback && (
            <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
              <h4 className="font-medium text-primary-800 mb-3">Visual Feedback Preview</h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-success-100 text-success-700 rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Listening...</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg">
                  <Icon name="Mic" size={16} />
                  <span className="text-sm font-medium">Recording</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-accent-100 text-accent-700 rounded-lg">
                  <Icon name="Volume2" size={16} />
                  <span className="text-sm font-medium">Speaking</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interaction Accessibility */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Hand" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Interaction Accessibility</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessibilityFeatures.filter(feature => feature.category === 'interaction').map((feature) => (
              <div
                key={feature.id}
                className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <Icon name={feature.icon} size={20} className="text-primary mt-1" />
                  <div>
                    <h4 className="font-medium text-text-primary">{feature.title}</h4>
                    <p className="text-sm text-text-secondary mt-1">{feature.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[feature.id]}
                    onChange={(e) => onSettingChange(feature.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-text-primary">Voice Command Timeout</h4>
                <select className="px-3 py-1 text-sm bg-surface border border-border rounded">
                  <option value="3">3 seconds</option>
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="never">Never timeout</option>
                </select>
              </div>
              <p className="text-sm text-text-secondary">How long to wait for voice commands</p>
            </div>

            <div className="p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-text-primary">Error Announcement</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <p className="text-sm text-text-secondary">Announce errors via text-to-speech</p>
            </div>
          </div>
        </div>

        {/* Voice Commands Reference */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Command" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Voice Commands Reference</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-text-primary mb-3">Available Voice Commands</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {voiceCommands.map((cmd, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent-50 rounded-lg">
                    <span className="font-mono text-sm text-accent-700">"{cmd.command}"</span>
                    <span className="text-xs text-text-secondary">{cmd.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-text-primary mb-3">Keyboard Shortcuts</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <span className="font-mono text-sm text-text-primary">{shortcut.keys}</span>
                    <span className="text-xs text-text-secondary">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Screen Reader Support */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Volume2" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Screen Reader Support</h3>
          </div>

          <div className="p-4 bg-success-50 border border-success-100 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="CheckCircle" size={20} className="text-success mt-0.5" />
              <div>
                <h4 className="font-medium text-success-800">Screen Reader Compatibility</h4>
                <p className="text-sm text-success-700 mt-1">
                  This application is compatible with popular screen readers including NVDA, JAWS, and VoiceOver. 
                  All interactive elements have proper ARIA labels and keyboard navigation support.
                </p>
                <ul className="text-sm text-success-700 mt-2 space-y-1">
                  <li>• Proper heading structure for easy navigation</li>
                  <li>• Alt text for all images and icons</li>
                  <li>• ARIA labels for complex interactive elements</li>
                  <li>• Keyboard-only navigation support</li>
                  <li>• Focus indicators for all interactive elements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Help and Support */}
        <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="HelpCircle" size={20} className="text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-primary-800">Accessibility Help</h4>
              <p className="text-sm text-primary-700 mt-1">
                Need help with accessibility features? Our support team is available to assist you with:
              </p>
              <ul className="text-sm text-primary-700 mt-2 space-y-1">
                <li>• Setting up voice commands for your specific needs</li>
                <li>• Configuring screen reader compatibility</li>
                <li>• Customizing visual and audio feedback</li>
                <li>• Troubleshooting accessibility issues</li>
              </ul>
              <div className="flex items-center space-x-4 mt-4">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-all duration-200 text-sm">
                  Contact Support
                </button>
                <button className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-50 transition-all duration-200 text-sm">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityOptions;