import React, { useState, useEffect, useRef } from 'react';
import Icon from 'components/AppIcon';
import { generateText } from 'services/geminiService';

const VoiceInterface = ({ isRecording, setIsRecording, onClose }) => {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('inactive');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setStatus('recording');
        setIsRecording(true);
      };

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Error: ${event.error}`);
        setStatus('error');
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setStatus('inactive');
        setIsRecording(false);
      };
    } else {
      setError('Speech recognition is not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setIsRecording]);

  const toggleRecording = () => {
    if (status === 'recording') {
      recognitionRef.current?.stop();
      processTranscript();
    } else {
      setTranscript('');
      setAiResponse('');
      setError(null);
      recognitionRef.current?.start();
    }
  };

  const processTranscript = async () => {
    if (!transcript) return;
    
    setStatus('processing');
    try {
      // Use Gemini AI to generate a response
      const response = await generateText(transcript);
      setAiResponse(response);
      setStatus('completed');
    } catch (error) {
      console.error('Error processing voice transcript:', error);
      setError('Error processing your request. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="absolute inset-0 bg-background bg-opacity-95 backdrop-blur-sm z-10 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 max-w-2xl mx-auto w-full">
        <div className="w-20 h-20 rounded-full bg-surface border-4 border-primary flex items-center justify-center relative">
          <div 
            className={`absolute inset-0 rounded-full ${status === 'recording' ? 'animate-pulse' : ''} ${status === 'processing' ? 'animate-spin' : ''}`}
            style={{
              background: status === 'recording' ?'radial-gradient(circle, rgba(255,59,48,0.2) 0%, rgba(255,59,48,0) 70%)' :'none'
            }}
          />
          <button 
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${status === 'recording' ? 'bg-accent' : 'bg-primary'}`}
            disabled={status === 'processing'}
          >
            <Icon 
              name={status === 'recording' ? 'Square' : status === 'processing' ? 'Loader' : 'Mic'} 
              size={24} 
              color="white" 
            />
          </button>
        </div>
        
        <div className="text-center">
          <h2 className="text-lg font-medium text-text-primary mb-2">
            {status === 'inactive' && 'Tap to speak'}
            {status === 'recording' && 'Listening...'}
            {status === 'processing' && 'Processing...'}
            {status === 'completed' && 'I heard you say:'}
            {status === 'error' && 'Error'}
          </h2>
          
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              {transcript && (
                <div className="p-4 bg-surface border border-border rounded-lg mb-4 max-h-24 overflow-y-auto">
                  <p className="text-text-primary">{transcript}</p>
                </div>
              )}
              
              {aiResponse && (
                <div className="p-4 bg-primary bg-opacity-5 border border-primary border-opacity-30 rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-text-primary">{aiResponse}</p>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-secondary-50 transition-all duration-200"
          >
            Close
          </button>
          
          {(status === 'completed' || transcript) && (
            <button
              onClick={toggleRecording}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-all duration-200"
            >
              {status === 'completed' ? 'Try Again' : 'Stop'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;