import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const TextToSpeechSettings = ({ settings, voices, onSettingChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVoicePreview, setCurrentVoicePreview] = useState(null);

  const sampleText = "Hello! This is a preview of how I will sound when reading your documents and chat responses. You can adjust my speed, pitch, and volume to your preference.";

  const handleVoicePreview = (voiceId) => {
    if (isPlaying && currentVoicePreview === voiceId) {
      // Stop current playback
      setIsPlaying(false);
      setCurrentVoicePreview(null);
      // In a real app, you would stop the speech synthesis here
      window.speechSynthesis?.cancel();
    } else {
      // Start new playback
      setIsPlaying(true);
      setCurrentVoicePreview(voiceId);
      
      // Mock speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sampleText);
        utterance.rate = settings.rate;
        utterance.volume = settings.volume;
        utterance.pitch = settings.pitch;
        
        utterance.onend = () => {
          setIsPlaying(false);
          setCurrentVoicePreview(null);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback for demo
        setTimeout(() => {
          setIsPlaying(false);
          setCurrentVoicePreview(null);
        }, 3000);
      }
    }
  };

  const handleTestPlayback = () => {
    const testText = "This is a test of your current text-to-speech settings. The AI assistant will use these settings when reading responses aloud.";
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.rate = settings.rate;
      utterance.volume = settings.volume;
      utterance.pitch = settings.pitch;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getRateLabel = (rate) => {
    if (rate < 0.7) return 'Very Slow';
    if (rate < 0.9) return 'Slow';
    if (rate < 1.1) return 'Normal';
    if (rate < 1.3) return 'Fast';
    return 'Very Fast';
  };

  const getPitchLabel = (pitch) => {
    if (pitch < 0.8) return 'Low';
    if (pitch < 1.2) return 'Normal';
    return 'High';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Text-to-Speech Settings</h2>
        <p className="text-text-secondary">Configure how the AI assistant speaks responses and reads documents aloud.</p>
      </div>

      <div className="space-y-8">
        {/* Voice Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Volume2" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Voice Selection</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  settings.voice === voice.id
                    ? 'border-primary bg-primary-50' :'border-border hover:border-secondary-300 hover:bg-secondary-50'
                }`}
                onClick={() => onSettingChange('voice', voice.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-text-primary">{voice.name}</h4>
                    <p className="text-sm text-text-secondary">{voice.accent}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {settings.voice === voice.id && (
                      <Icon name="Check" size={16} className="text-primary" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVoicePreview(voice.id);
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isPlaying && currentVoicePreview === voice.id
                          ? 'bg-error text-white hover:bg-error-700' :'bg-secondary-100 text-text-secondary hover:bg-secondary-200 hover:text-text-primary'
                      }`}
                    >
                      <Icon 
                        name={isPlaying && currentVoicePreview === voice.id ? 'Square' : 'Play'} 
                        size={16} 
                      />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    voice.gender === 'female' ?'bg-pink-100 text-pink-700' :'bg-blue-100 text-blue-700'
                  }`}>
                    {voice.gender}
                  </span>
                  <span className="px-2 py-1 text-xs bg-secondary-100 text-text-secondary rounded-full">
                    {voice.accent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Speech Controls */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Icon name="Sliders" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Speech Controls</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Speech Rate */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-text-primary">
                  Speech Rate
                </label>
                <span className="text-sm text-text-secondary">
                  {getRateLabel(settings.rate)} ({settings.rate.toFixed(1)}x)
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.rate}
                onChange={(e) => onSettingChange('rate', parseFloat(e.target.value))}
                className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-2">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
              </div>
            </div>

            {/* Volume */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-text-primary">
                  Volume
                </label>
                <span className="text-sm text-text-secondary">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => onSettingChange('volume', parseFloat(e.target.value))}
                className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Pitch */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-text-primary">
                  Pitch
                </label>
                <span className="text-sm text-text-secondary">
                  {getPitchLabel(settings.pitch)} ({settings.pitch.toFixed(1)})
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => onSettingChange('pitch', parseFloat(e.target.value))}
                className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-2">
                <span>Low</span>
                <span>Normal</span>
                <span>High</span>
              </div>
            </div>

            {/* Auto-speak */}
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <h4 className="font-medium text-text-primary">Auto-speak Responses</h4>
                <p className="text-sm text-text-secondary">Automatically read AI responses aloud</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSpeak}
                  onChange={(e) => onSettingChange('autoSpeak', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Test Playback */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="TestTube" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Test Playback</h3>
          </div>

          <div className="p-6 bg-secondary-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-text-primary">Preview Current Settings</h4>
                <p className="text-sm text-text-secondary">Test how your voice settings will sound</p>
              </div>
              <button
                onClick={handleTestPlayback}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-all duration-200"
              >
                <Icon name="Play" size={16} />
                <span>Test Voice</span>
              </button>
            </div>
            
            <div className="p-4 bg-surface border border-border rounded-lg">
              <p className="text-sm text-text-secondary italic">
                "{sampleText}"
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Settings2" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Advanced Options</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Pause Duration
              </label>
              <select className="w-full px-4 py-3 bg-secondary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                <option value="short">Short (0.5s)</option>
                <option value="medium">Medium (1.0s)</option>
                <option value="long">Long (1.5s)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Emphasis Style
              </label>
              <select className="w-full px-4 py-3 bg-secondary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                <option value="none">None</option>
                <option value="moderate">Moderate</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechSettings;