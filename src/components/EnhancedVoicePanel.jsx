// Enhanced Voice Control Panel with Visual Feedback
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, Radio, Square, 
  Play, Pause, Settings, Zap, Activity 
} from 'lucide-react';

const EnhancedVoicePanel = ({
  isListening,
  isSpeaking,
  isConversationMode,
  speechSupport,
  onVoiceToggle,
  onSpeakerToggle,
  onConversationToggle,
  onTestVoice,
  voiceError,
  className = ""
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceActivity, setVoiceActivity] = useState(false);

  // Simulate audio level for visual feedback
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
        setVoiceActivity(Math.random() > 0.7);
      }, 100);
    } else {
      setAudioLevel(0);
      setVoiceActivity(false);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const VoiceVisualizer = () => (
    <div className="flex items-center justify-center space-x-1 h-8">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-blue-400 to-purple-500 rounded-full"
          animate={{
            height: isListening ? [4, 20 + (audioLevel / 5), 4] : 4,
            opacity: isListening ? (voiceActivity ? 1 : 0.3) : 0.2
          }}
          transition={{
            duration: 0.3,
            delay: i * 0.1,
            repeat: isListening ? Infinity : 0
          }}
        />
      ))}
    </div>
  );

  const SpeakingIndicator = () => (
    <motion.div
      className="flex items-center space-x-2"
      animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
    >
      <Volume2 className="w-4 h-4 text-green-500" />
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-green-500 rounded-full"
            animate={isSpeaking ? {
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            } : {}}
            transition={{
              duration: 0.6,
              delay: i * 0.2,
              repeat: isSpeaking ? Infinity : 0
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={isListening || isSpeaking ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: isListening || isSpeaking ? Infinity : 0, ease: "linear" }}
          >
            <Radio className="w-5 h-5 text-blue-500" />
          </motion.div>
          <h3 className="font-semibold text-gray-800">Voice Controls</h3>
          <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full ${speechSupport.speechToText ? 'bg-green-500' : 'bg-red-500'}`} 
                 title={`STT: ${speechSupport.speechToText ? 'Supported' : 'Not Supported'}`} />
            <div className={`w-2 h-2 rounded-full ${speechSupport.textToSpeech ? 'bg-green-500' : 'bg-red-500'}`}
                 title={`TTS: ${speechSupport.textToSpeech ? 'Supported' : 'Not Supported'}`} />
          </div>
        </div>
        <motion.button
          onClick={onTestVoice}
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Test Voice"
        >
          <Zap className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Voice Visualizer */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <VoiceVisualizer />
        <div className="text-center mt-2">
          <AnimatePresence mode="wait">
            {isListening && (
              <motion.p
                key="listening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-blue-600 font-medium"
              >
                🎤 Listening... Speak now!
              </motion.p>
            )}
            {isSpeaking && (
              <motion.p
                key="speaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-green-600 font-medium"
              >
                🔊 AI is speaking...
              </motion.p>
            )}
            {!isListening && !isSpeaking && (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-gray-500"
              >
                Voice ready
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {/* Microphone Toggle */}
        <motion.button
          onClick={onVoiceToggle}
          disabled={!speechSupport.speechToText}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${
            isListening
              ? 'bg-red-500 text-white shadow-lg shadow-red-200'
              : speechSupport.speechToText
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-200'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={speechSupport.speechToText ? { scale: 1.05 } : {}}
          whileTap={speechSupport.speechToText ? { scale: 0.95 } : {}}
        >
          {isListening ? <MicOff className="w-5 h-5 mb-1" /> : <Mic className="w-5 h-5 mb-1" />}
          <span className="text-xs font-medium">
            {isListening ? 'Stop' : 'Speak'}
          </span>
        </motion.button>

        {/* Speaker Toggle */}
        <motion.button
          onClick={onSpeakerToggle}
          disabled={!speechSupport.textToSpeech}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${
            isSpeaking
              ? 'bg-green-500 text-white shadow-lg shadow-green-200'
              : speechSupport.textToSpeech
              ? 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg shadow-gray-200'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={speechSupport.textToSpeech ? { scale: 1.05 } : {}}
          whileTap={speechSupport.textToSpeech ? { scale: 0.95 } : {}}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5 mb-1" /> : <Volume2 className="w-5 h-5 mb-1" />}
          <span className="text-xs font-medium">
            {isSpeaking ? 'Mute' : 'Audio'}
          </span>
        </motion.button>

        {/* Conversation Mode */}
        <motion.button
          onClick={onConversationToggle}
          disabled={!speechSupport.speechToText || !speechSupport.textToSpeech}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${
            isConversationMode
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
              : speechSupport.speechToText && speechSupport.textToSpeech
              ? 'bg-purple-400 text-white hover:bg-purple-500 shadow-lg shadow-purple-200'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={speechSupport.speechToText && speechSupport.textToSpeech ? { scale: 1.05 } : {}}
          whileTap={speechSupport.speechToText && speechSupport.textToSpeech ? { scale: 0.95 } : {}}
        >
          {isConversationMode ? <Square className="w-5 h-5 mb-1" /> : <Activity className="w-5 h-5 mb-1" />}
          <span className="text-xs font-medium">
            {isConversationMode ? 'Stop' : 'Chat'}
          </span>
        </motion.button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-xs text-red-600">⚠️ {voiceError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Info */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Voice Engine: Web Speech API</span>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedVoicePanel;
