import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import Icon from 'components/AppIcon';

// Components
import SpeechRecognitionSettings from './components/SpeechRecognitionSettings';
import TextToSpeechSettings from './components/TextToSpeechSettings';
import AudioQualitySettings from './components/AudioQualitySettings';
import VoiceTestingArea from './components/VoiceTestingArea';
import AccessibilityOptions from './components/AccessibilityOptions';

const VoiceSettingsControls = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('speech-recognition');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Settings state
  const [settings, setSettings] = useState({
    speechRecognition: {
      language: 'en-US',
      sensitivity: 75,
      voiceCommands: true,
      continuousListening: false,
      noiseReduction: true
    },
    textToSpeech: {
      voice: 'female-1',
      rate: 1.0,
      volume: 0.8,
      pitch: 1.0,
      autoSpeak: true
    },
    audioQuality: {
      microphoneSource: 'default',
      noiseCancellation: true,
      audioFormat: 'webm',
      sampleRate: '44100',
      echoCancellation: true
    },
    accessibility: {
      visualFeedback: true,
      transcriptDisplay: true,
      highContrast: false,
      largeControls: false
    }
  });

  const tabs = [
    { id: 'speech-recognition', label: 'Speech Recognition', icon: 'Mic' },
    { id: 'text-to-speech', label: 'Text-to-Speech', icon: 'Volume2' },
    { id: 'audio-quality', label: 'Audio Quality', icon: 'Settings' },
    { id: 'voice-testing', label: 'Voice Testing', icon: 'TestTube' },
    { id: 'accessibility', label: 'Accessibility', icon: 'Eye' }
  ];

  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German (Germany)', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian (Italy)', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese (Japan)', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean (South Korea)', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' }
  ];

  const voices = [
    { id: 'female-1', name: 'Sarah (Female)', gender: 'female', accent: 'American' },
    { id: 'male-1', name: 'David (Male)', gender: 'male', accent: 'American' },
    { id: 'female-2', name: 'Emma (Female)', gender: 'female', accent: 'British' },
    { id: 'male-2', name: 'James (Male)', gender: 'male', accent: 'British' },
    { id: 'female-3', name: 'Maria (Female)', gender: 'female', accent: 'Spanish' },
    { id: 'male-3', name: 'Antonio (Male)', gender: 'male', accent: 'Spanish' }
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // Mock save functionality
    console.log('Saving settings:', settings);
    setHasUnsavedChanges(false);
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);
  };

  const handleResetSettings = () => {
    setSettings({
      speechRecognition: {
        language: 'en-US',
        sensitivity: 75,
        voiceCommands: true,
        continuousListening: false,
        noiseReduction: true
      },
      textToSpeech: {
        voice: 'female-1',
        rate: 1.0,
        volume: 0.8,
        pitch: 1.0,
        autoSpeak: true
      },
      audioQuality: {
        microphoneSource: 'default',
        noiseCancellation: true,
        audioFormat: 'webm',
        sampleRate: '44100',
        echoCancellation: true
      },
      accessibility: {
        visualFeedback: true,
        transcriptDisplay: true,
        highContrast: false,
        largeControls: false
      }
    });
    setHasUnsavedChanges(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'speech-recognition':
        return (
          <SpeechRecognitionSettings
            settings={settings.speechRecognition}
            languages={languages}
            audioLevel={audioLevel}
            isRecording={isRecording}
            onSettingChange={(setting, value) => handleSettingChange('speechRecognition', setting, value)}
            onStartRecording={() => setIsRecording(true)}
            onStopRecording={() => setIsRecording(false)}
          />
        );
      case 'text-to-speech':
        return (
          <TextToSpeechSettings
            settings={settings.textToSpeech}
            voices={voices}
            onSettingChange={(setting, value) => handleSettingChange('textToSpeech', setting, value)}
          />
        );
      case 'audio-quality':
        return (
          <AudioQualitySettings
            settings={settings.audioQuality}
            onSettingChange={(setting, value) => handleSettingChange('audioQuality', setting, value)}
          />
        );
      case 'voice-testing':
        return (
          <VoiceTestingArea
            speechSettings={settings.speechRecognition}
            ttsSettings={settings.textToSpeech}
            audioSettings={settings.audioQuality}
          />
        );
      case 'accessibility':
        return (
          <AccessibilityOptions
            settings={settings.accessibility}
            onSettingChange={(setting, value) => handleSettingChange('accessibility', setting, value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <main className="ml-0 md:ml-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Voice Settings & Controls</h1>
                <p className="text-text-secondary">Configure speech recognition, text-to-speech, and audio quality settings for optimal voice interaction experience.</p>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                {hasUnsavedChanges && (
                  <span className="text-sm text-warning flex items-center space-x-1">
                    <Icon name="AlertCircle" size={16} />
                    <span>Unsaved changes</span>
                  </span>
                )}
                
                <button
                  onClick={handleResetSettings}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border hover:border-secondary-300 rounded-lg transition-all duration-200"
                >
                  Reset to Defaults
                </button>
                
                <button
                  onClick={handleSaveSettings}
                  disabled={!hasUnsavedChanges}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    hasUnsavedChanges
                      ? 'bg-primary text-white hover:bg-primary-700 shadow-elevation-2'
                      : 'bg-secondary-100 text-text-secondary cursor-not-allowed'
                  }`}
                >
                  Save Settings
                </button>
              </div>
            </div>

            {/* Save Confirmation */}
            {showSaveConfirmation && (
              <div className="mb-6 p-4 bg-success-50 border border-success-100 rounded-lg flex items-center space-x-3">
                <Icon name="CheckCircle" size={20} className="text-success" />
                <span className="text-success-700 font-medium">Settings saved successfully!</span>
              </div>
            )}
          </div>

          {/* Mobile Tab Navigation */}
          {isMobileView && (
            <div className="mb-6">
              <div className="flex overflow-x-auto pb-2 space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-elevation-2'
                        : 'bg-secondary-50 text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Tab Navigation */}
            {!isMobileView && (
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-surface border border-border rounded-xl p-4 shadow-elevation-2">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Settings Categories</h3>
                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-primary-50 text-primary border border-primary-100' :'text-text-secondary hover:text-text-primary hover:bg-secondary-50'
                        }`}
                      >
                        <Icon name={tab.icon} size={20} />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-surface border border-border rounded-xl shadow-elevation-2">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoiceSettingsControls;