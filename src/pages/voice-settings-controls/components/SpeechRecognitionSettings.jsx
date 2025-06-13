import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const SpeechRecognitionSettings = ({
  settings,
  languages,
  audioLevel,
  isRecording,
  onSettingChange,
  onStartRecording,
  onStopRecording
}) => {
  const [microphonePermission, setMicrophonePermission] = useState('prompt');
  const [testRecording, setTestRecording] = useState(false);

  useEffect(() => {
    // Check microphone permission
    navigator.permissions?.query({ name: 'microphone' }).then((result) => {
      setMicrophonePermission(result.state);
    });
  }, []);

  const handleMicrophoneTest = async () => {
    if (testRecording) {
      setTestRecording(false);
      onStopRecording();
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setTestRecording(true);
        onStartRecording();
        // Stop after 3 seconds for demo
        setTimeout(() => {
          setTestRecording(false);
          onStopRecording();
        }, 3000);
      } catch (error) {
        console.error('Microphone access denied:', error);
      }
    }
  };

  const getSensitivityLabel = (value) => {
    if (value < 30) return 'Low';
    if (value < 70) return 'Medium';
    return 'High';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Speech Recognition Settings</h2>
        <p className="text-text-secondary">Configure how the system recognizes and processes your voice input.</p>
      </div>

      <div className="space-y-8">
        {/* Language Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Globe" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Language & Region</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Recognition Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => onSettingChange('language', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Accent Adaptation
              </label>
              <select className="w-full px-4 py-3 bg-secondary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                <option value="auto">Auto-detect</option>
                <option value="standard">Standard</option>
                <option value="regional">Regional</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Microphone Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Mic" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Microphone Configuration</h3>
          </div>

          {/* Microphone Permission Status */}
          <div className={`p-4 rounded-lg border ${
            microphonePermission === 'granted' ?'bg-success-50 border-success-100' 
              : microphonePermission === 'denied' ?'bg-error-50 border-error-100' :'bg-warning-50 border-warning-100'
          }`}>
            <div className="flex items-center space-x-3">
              <Icon 
                name={microphonePermission === 'granted' ? 'CheckCircle' : microphonePermission === 'denied' ? 'XCircle' : 'AlertCircle'} 
                size={20} 
                className={
                  microphonePermission === 'granted' ?'text-success' 
                    : microphonePermission === 'denied' ?'text-error' :'text-warning'
                }
              />
              <div>
                <p className={`font-medium ${
                  microphonePermission === 'granted' ?'text-success-700' 
                    : microphonePermission === 'denied' ?'text-error-700' :'text-warning-700'
                }`}>
                  Microphone Access: {microphonePermission === 'granted' ? 'Granted' : microphonePermission === 'denied' ? 'Denied' : 'Not Requested'}
                </p>
                <p className={`text-sm ${
                  microphonePermission === 'granted' ?'text-success-600' 
                    : microphonePermission === 'denied' ?'text-error-600' :'text-warning-600'
                }`}>
                  {microphonePermission === 'granted' ?'Voice recognition is ready to use' 
                    : microphonePermission === 'denied' ?'Please enable microphone access in browser settings' :'Click test microphone to grant access'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Sensitivity Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-primary">
                Microphone Sensitivity
              </label>
              <span className="text-sm text-text-secondary">
                {getSensitivityLabel(settings.sensitivity)} ({settings.sensitivity}%)
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.sensitivity}
                onChange={(e) => onSettingChange('sensitivity', parseInt(e.target.value))}
                className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-2">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Audio Level Meter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-primary">
                Real-time Audio Level
              </label>
              <button
                onClick={handleMicrophoneTest}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  testRecording
                    ? 'bg-error text-white hover:bg-error-700' :'bg-primary text-white hover:bg-primary-700'
                }`}
              >
                {testRecording ? 'Stop Test' : 'Test Microphone'}
              </button>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ${
                  audioLevel > 80 ? 'bg-error' : audioLevel > 50 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${testRecording ? Math.random() * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>Quiet</span>
              <span>Optimal</span>
              <span>Too Loud</span>
            </div>
          </div>
        </div>

        {/* Voice Commands */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Command" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Voice Commands</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary">Enable Voice Commands</h4>
                  <p className="text-sm text-text-secondary">Allow voice shortcuts and commands</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.voiceCommands}
                    onChange={(e) => onSettingChange('voiceCommands', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary">Continuous Listening</h4>
                  <p className="text-sm text-text-secondary">Always listen for wake word</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.continuousListening}
                    onChange={(e) => onSettingChange('continuousListening', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary">Noise Reduction</h4>
                  <p className="text-sm text-text-secondary">Filter background noise</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.noiseReduction}
                    onChange={(e) => onSettingChange('noiseReduction', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-text-primary">Available Commands</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 bg-accent-50 rounded-lg">
                  <span className="font-mono text-accent-700">"Start recording"</span>
                  <span className="text-text-secondary">Begin voice input</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent-50 rounded-lg">
                  <span className="font-mono text-accent-700">"Stop recording"</span>
                  <span className="text-text-secondary">End voice input</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent-50 rounded-lg">
                  <span className="font-mono text-accent-700">"Clear chat"</span>
                  <span className="text-text-secondary">Clear conversation</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent-50 rounded-lg">
                  <span className="font-mono text-accent-700">"Upload document"</span>
                  <span className="text-text-secondary">Open file dialog</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechRecognitionSettings;