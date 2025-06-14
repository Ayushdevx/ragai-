// Enhanced Voice Service with Whisper and ElevenLabs Integration
import ragConfig from '../config/ragConfig.js';

class EnhancedVoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    this.whisperClient = null;
    this.elevenLabsClient = null;
    
    if (this.isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }

    this.initializeServices();
  }

  async initializeServices() {
    try {
      // Initialize Whisper API if configured
      if (ragConfig.voice.stt.provider === 'whisper' && ragConfig.voice.stt.whisper.apiKey) {
        this.initializeWhisper();
      }

      // Initialize ElevenLabs if configured
      if (ragConfig.voice.tts.provider === 'elevenlabs' && ragConfig.voice.tts.elevenlabs.apiKey) {
        this.initializeElevenLabs();
      }
    } catch (error) {
      console.error('Voice service initialization failed:', error);
    }
  }

  initializeWhisper() {
    this.whisperClient = {
      apiKey: ragConfig.voice.stt.whisper.apiKey,
      model: ragConfig.voice.stt.whisper.model,
      baseUrl: 'https://api.openai.com/v1/audio/transcriptions'
    };
  }

  initializeElevenLabs() {
    this.elevenLabsClient = {
      apiKey: ragConfig.voice.tts.elevenlabs.apiKey,
      voiceId: ragConfig.voice.tts.elevenlabs.voiceId,
      model: ragConfig.voice.tts.elevenlabs.model,
      baseUrl: `https://api.elevenlabs.io/v1/text-to-speech/${ragConfig.voice.tts.elevenlabs.voiceId}`
    };
  }

  setupRecognition() {
    if (!this.recognition) return;

    const config = ragConfig.voice.stt.webSpeech;
    this.recognition.continuous = config.continuous;
    this.recognition.interimResults = config.interimResults;
    this.recognition.lang = config.language;
    this.recognition.maxAlternatives = 1;
  }

  // Enhanced speech-to-text with Whisper fallback
  async transcribeAudio(audioBlob) {
    try {
      if (this.whisperClient) {
        return await this.transcribeWithWhisper(audioBlob);
      } else {
        return await this.transcribeWithWebSpeech(audioBlob);
      }
    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw error;
    }
  }

  async transcribeWithWhisper(audioBlob) {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', this.whisperClient.model);
      formData.append('language', 'en');

      const response = await fetch(this.whisperClient.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.whisperClient.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('Whisper transcription failed:', error);
      throw error;
    }
  }

  transcribeWithWebSpeech(audioBlob) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      // Web Speech API doesn't directly support audio blobs
      // This would need additional implementation for blob processing
      reject(new Error('Web Speech API blob transcription not implemented'));
    });
  }

  // Start listening with enhanced options
  startListening(onResult, onError, options = {}) {
    if (!this.isSupported) {
      onError('Speech recognition not supported');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.isListening = true;

    // Configure recognition based on options
    if (options.language) {
      this.recognition.lang = options.language;
    }

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      onResult(finalTranscript, interimTranscript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (error) {
      this.isListening = false;
      onError(error.message);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Enhanced text-to-speech with ElevenLabs
  async speak(text, options = {}) {
    try {
      if (this.elevenLabsClient && ragConfig.voice.tts.provider === 'elevenlabs') {
        return await this.speakWithElevenLabs(text, options);
      } else {
        return await this.speakWithWebSpeech(text, options);
      }
    } catch (error) {
      console.error('Text-to-speech failed:', error);
      // Fallback to web speech
      return await this.speakWithWebSpeech(text, options);
    }
  }

  async speakWithElevenLabs(text, options = {}) {
    try {
      const response = await fetch(this.elevenLabsClient.baseUrl, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsClient.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: this.elevenLabsClient.model,
          voice_settings: {
            stability: options.stability || 0.5,
            similarity_boost: options.similarityBoost || 0.5,
            style: options.style || 0.0,
            use_speaker_boost: options.useSpeakerBoost || true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play();
      });
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error);
      throw error;
    }
  }

  speakWithWebSpeech(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options
      const config = ragConfig.voice.tts.webSpeech;
      utterance.rate = options.rate || config.rate;
      utterance.pitch = options.pitch || config.pitch;
      utterance.volume = options.volume || config.volume;

      // Set voice if specified
      if (options.voice || config.voice) {
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find(voice => 
          voice.name === (options.voice || config.voice) ||
          voice.lang.includes('en')
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  // Stop current speech
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Get available voices
  getVoices() {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  // Enhanced voice recording for RAG integration
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks = [];

      return new Promise((resolve, reject) => {
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          try {
            const transcript = await this.transcribeAudio(audioBlob);
            resolve({
              audioBlob,
              transcript,
              duration: audioChunks.length
            });
          } catch (error) {
            reject(error);
          }
        };

        mediaRecorder.onerror = (error) => {
          reject(error);
        };

        mediaRecorder.start();

        // Return control object
        resolve({
          stop: () => {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
          },
          mediaRecorder
        });
      });
    } catch (error) {
      console.error('Recording failed:', error);
      throw error;
    }
  }

  // Voice activity detection
  async detectVoiceActivity(audioStream) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(audioStream);
    
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;
    microphone.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    return {
      isActive: () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        return average > 20; // Threshold for voice detection
      },
      getLevel: () => {
        analyser.getByteFrequencyData(dataArray);
        return dataArray.reduce((a, b) => a + b) / bufferLength;
      },
      cleanup: () => {
        audioContext.close();
      }
    };
  }

  // Test voice capabilities
  async testVoiceCapabilities() {
    const capabilities = {
      speechRecognition: this.isSupported,
      speechSynthesis: !!this.synthesis,
      whisperAPI: !!this.whisperClient,
      elevenLabsAPI: !!this.elevenLabsClient,
      mediaRecorder: !!window.MediaRecorder,
      getUserMedia: !!navigator.mediaDevices?.getUserMedia
    };

    // Test each capability
    if (capabilities.speechSynthesis) {
      try {
        await this.speakWithWebSpeech('Voice test', { volume: 0.1 });
        capabilities.speechSynthesisWorking = true;
      } catch (error) {
        capabilities.speechSynthesisWorking = false;
      }
    }

    if (capabilities.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        capabilities.microphoneAccess = true;
      } catch (error) {
        capabilities.microphoneAccess = false;
      }
    }

    return capabilities;
  }
}

export default new EnhancedVoiceService();
