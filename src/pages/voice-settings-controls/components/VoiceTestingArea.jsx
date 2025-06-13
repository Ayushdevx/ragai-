import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';

const VoiceTestingArea = ({ speechSettings, ttsSettings, audioSettings }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [qualityFeedback, setQualityFeedback] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);

  const testScenarios = [
    {
      id: 'document-query',
      title: 'Document Query Test',
      prompt: 'Ask a question about a document you would upload',
      expectedResponse: 'I understand you\'re asking about document content. Please upload a document first, and I\'ll be happy to answer questions about it.'
    },
    {
      id: 'general-conversation',
      title: 'General Conversation Test',
      prompt: 'Have a casual conversation with the AI',
      expectedResponse: 'Hello! I\'m here to help you with any questions or tasks you might have. What would you like to discuss today?'
    },
    {
      id: 'voice-command',
      title: 'Voice Command Test',
      prompt: 'Try a voice command like "start recording" or "clear chat"',
      expectedResponse: 'Voice command recognized. I\'ve executed the requested action.'
    },
    {
      id: 'technical-question',
      title: 'Technical Question Test',
      prompt: 'Ask a technical question about AI or technology',
      expectedResponse: 'That\'s an interesting technical question. Let me provide you with a detailed explanation based on current knowledge.'
    }
  ];

  const [selectedScenario, setSelectedScenario] = useState(testScenarios[0]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: audioSettings.echoCancellation,
          noiseSuppression: audioSettings.noiseCancellation,
          sampleRate: parseInt(audioSettings.sampleRate)
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: `audio/${audioSettings.audioFormat}`
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: `audio/${audioSettings.audioFormat}` 
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        processRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
        setAudioLevel(Math.random() * 100); // Mock audio level
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setQualityFeedback({
        type: 'error',
        message: 'Failed to access microphone. Please check permissions.'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setAudioLevel(0);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const processRecording = async (audioBlob) => {
    setIsProcessing(true);
    
    // Mock transcription process
    setTimeout(() => {
      const mockTranscriptions = [
        "Hello, I would like to know more about the document processing capabilities.",
        "Can you help me understand how the AI analyzes uploaded files?",
        "What are the supported file formats for document upload?",
        "How accurate is the voice recognition system?",
        "Start recording a new conversation please."
      ];
      
      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      setTranscription(randomTranscription);
      
      // Generate AI response
      setTimeout(() => {
        setAiResponse(selectedScenario.expectedResponse);
        
        // Provide quality feedback
        const quality = Math.random();
        if (quality > 0.8) {
          setQualityFeedback({
            type: 'excellent',
            message: 'Excellent audio quality! Clear speech recognition with minimal background noise.'
          });
        } else if (quality > 0.6) {
          setQualityFeedback({
            type: 'good',
            message: 'Good audio quality. Some minor background noise detected.'
          });
        } else {
          setQualityFeedback({
            type: 'fair',
            message: 'Fair audio quality. Consider adjusting microphone sensitivity or reducing background noise.'
          });
        }
        
        setIsProcessing(false);
      }, 1500);
    }, 2000);
  };

  const playAIResponse = () => {
    if ('speechSynthesis' in window && aiResponse) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(aiResponse);
      utterance.rate = ttsSettings.rate;
      utterance.volume = ttsSettings.volume;
      utterance.pitch = ttsSettings.pitch;
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearTest = () => {
    setRecordedAudio(null);
    setTranscription('');
    setAiResponse('');
    setQualityFeedback(null);
    setRecordingDuration(0);
    setAudioLevel(0);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Voice Testing Area</h2>
        <p className="text-text-secondary">Test your voice settings with real-time recording, transcription, and AI response playback.</p>
      </div>

      <div className="space-y-8">
        {/* Test Scenario Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="TestTube" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Test Scenarios</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className={`p-4 text-left border rounded-lg transition-all duration-200 ${
                  selectedScenario.id === scenario.id
                    ? 'border-primary bg-primary-50' :'border-border hover:border-secondary-300 hover:bg-secondary-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-text-primary">{scenario.title}</h4>
                  {selectedScenario.id === scenario.id && (
                    <Icon name="Check" size={16} className="text-primary" />
                  )}
                </div>
                <p className="text-sm text-text-secondary">{scenario.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recording Interface */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Mic" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Voice Recording</h3>
          </div>

          <div className="p-6 bg-secondary-50 rounded-lg">
            <div className="flex flex-col items-center space-y-4">
              {/* Recording Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isRecording
                    ? 'bg-error text-white hover:bg-error-700 animate-pulse'
                    : isProcessing
                    ? 'bg-secondary-300 text-text-secondary cursor-not-allowed' :'bg-primary text-white hover:bg-primary-700 shadow-elevation-3'
                }`}
              >
                <Icon 
                  name={isRecording ? 'Square' : isProcessing ? 'Loader' : 'Mic'} 
                  size={32}
                  className={isProcessing ? 'animate-spin' : ''}
                />
              </button>

              {/* Recording Status */}
              <div className="text-center">
                {isRecording && (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-error">Recording...</p>
                    <p className="text-sm text-text-secondary">Duration: {formatDuration(recordingDuration)}</p>
                  </div>
                )}
                {isProcessing && (
                  <p className="text-lg font-medium text-primary">Processing audio...</p>
                )}
                {!isRecording && !isProcessing && (
                  <p className="text-text-secondary">Click to start recording</p>
                )}
              </div>

              {/* Audio Level Meter */}
              {isRecording && (
                <div className="w-full max-w-md">
                  <div className="w-full bg-secondary-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-100 ${
                        audioLevel > 80 ? 'bg-error' : audioLevel > 50 ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ width: `${audioLevel}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span>Quiet</span>
                    <span>Good</span>
                    <span>Too Loud</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Display */}
        {(transcription || aiResponse || qualityFeedback) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="MessageSquare" size={20} className="text-primary" />
                <h3 className="text-lg font-medium text-text-primary">Test Results</h3>
              </div>
              <button
                onClick={clearTest}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border hover:border-secondary-300 rounded-lg transition-all duration-200"
              >
                Clear Results
              </button>
            </div>

            {/* Quality Feedback */}
            {qualityFeedback && (
              <div className={`p-4 rounded-lg border ${
                qualityFeedback.type === 'excellent' ?'bg-success-50 border-success-100'
                  : qualityFeedback.type === 'good' ?'bg-primary-50 border-primary-100'
                  : qualityFeedback.type === 'fair' ?'bg-warning-50 border-warning-100' :'bg-error-50 border-error-100'
              }`}>
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={
                      qualityFeedback.type === 'excellent' ? 'CheckCircle' :
                      qualityFeedback.type === 'good' ? 'ThumbsUp' :
                      qualityFeedback.type === 'fair' ? 'AlertTriangle' : 'XCircle'
                    } 
                    size={20} 
                    className={
                      qualityFeedback.type === 'excellent' ? 'text-success' :
                      qualityFeedback.type === 'good' ? 'text-primary' :
                      qualityFeedback.type === 'fair' ? 'text-warning' : 'text-error'
                    }
                  />
                  <div>
                    <h4 className={`font-medium ${
                      qualityFeedback.type === 'excellent' ? 'text-success-700' :
                      qualityFeedback.type === 'good' ? 'text-primary-700' :
                      qualityFeedback.type === 'fair' ? 'text-warning-700' : 'text-error-700'
                    }`}>
                      Audio Quality: {qualityFeedback.type.charAt(0).toUpperCase() + qualityFeedback.type.slice(1)}
                    </h4>
                    <p className={`text-sm ${
                      qualityFeedback.type === 'excellent' ? 'text-success-600' :
                      qualityFeedback.type === 'good' ? 'text-primary-600' :
                      qualityFeedback.type === 'fair' ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {qualityFeedback.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Transcription */}
            {transcription && (
              <div className="p-4 bg-surface border border-border rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon name="FileText" size={16} className="text-text-secondary" />
                  <h4 className="font-medium text-text-primary">Speech Recognition Result</h4>
                </div>
                <p className="text-text-primary italic">"{transcription}"</p>
              </div>
            )}

            {/* AI Response */}
            {aiResponse && (
              <div className="p-4 bg-accent-50 border border-accent-100 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="Bot" size={16} className="text-accent" />
                    <h4 className="font-medium text-text-primary">AI Response</h4>
                  </div>
                  <button
                    onClick={playAIResponse}
                    className="flex items-center space-x-2 px-3 py-1 bg-accent text-white rounded-lg hover:bg-accent-600 transition-all duration-200"
                  >
                    <Icon name="Play" size={14} />
                    <span className="text-sm">Play</span>
                  </button>
                </div>
                <p className="text-text-primary">{aiResponse}</p>
              </div>
            )}

            {/* Recorded Audio Playback */}
            {recordedAudio && (
              <div className="p-4 bg-secondary-50 border border-border rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon name="Volume2" size={16} className="text-text-secondary" />
                  <h4 className="font-medium text-text-primary">Recorded Audio</h4>
                </div>
                <audio controls className="w-full">
                  <source src={recordedAudio} type={`audio/${audioSettings.audioFormat}`} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        )}

        {/* Tips and Recommendations */}
        <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Lightbulb" size={20} className="text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-primary-800">Testing Tips</h4>
              <ul className="text-sm text-primary-700 mt-2 space-y-1">
                <li>• Speak clearly and at a normal pace for best recognition</li>
                <li>• Test in different noise environments to find optimal settings</li>
                <li>• Try various accents and speaking styles to ensure robustness</li>
                <li>• Use the quality feedback to adjust your microphone settings</li>
                <li>• Test voice commands to ensure they're properly recognized</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTestingArea;