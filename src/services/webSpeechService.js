// Web Speech Service - Using Browser's Built-in APIs with Gemini AI
import geminiService from './geminiService.js';

class WebSpeechService {
  constructor() {
    // Speech Recognition (Speech-to-Text)
    this.recognition = null;
    this.isListening = false;
    this.isSTTSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    // Speech Synthesis (Text-to-Speech)
    this.synthesis = window.speechSynthesis;
    this.isTTSSupported = 'speechSynthesis' in window;
    this.voices = [];
    this.selectedVoice = null;
    
    // Event handlers
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;
    
    this.initialize();
  }

  async initialize() {
    try {
      // Initialize Speech Recognition
      if (this.isSTTSupported) {
        this.setupSpeechRecognition();
      }
      
      // Initialize Speech Synthesis
      if (this.isTTSSupported) {
        this.setupSpeechSynthesis();
      }
      
      console.log('Web Speech Service initialized successfully');
      console.log(`STT Supported: ${this.isSTTSupported}`);
      console.log(`TTS Supported: ${this.isTTSSupported}`);
    } catch (error) {
      console.error('Web Speech Service initialization failed:', error);
    }
  }

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition settings
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
    
    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Speech recognition started');
      if (this.onStart) this.onStart();
    };
    
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
      
      if (finalTranscript) {
        console.log('Final transcript:', finalTranscript);
        this.handleSpeechResult(finalTranscript);
      }
      
      if (this.onResult) {
        this.onResult({
          final: finalTranscript,
          interim: interimTranscript,
          isFinal: !!finalTranscript
        });
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (this.onError) this.onError(event.error);
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Speech recognition ended');
      if (this.onEnd) this.onEnd();
    };
  }

  setupSpeechSynthesis() {
    // Load available voices
    this.loadVoices();
    
    // Handle voice changes (some browsers load voices asynchronously)
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  loadVoices() {
    this.voices = this.synthesis.getVoices();
    
    // Select a default English voice
    this.selectedVoice = this.voices.find(voice => 
      voice.lang.startsWith('en') && voice.default
    ) || this.voices.find(voice => 
      voice.lang.startsWith('en')
    ) || this.voices[0];
    
    console.log(`Loaded ${this.voices.length} voices`);
    if (this.selectedVoice) {
      console.log(`Selected voice: ${this.selectedVoice.name} (${this.selectedVoice.lang})`);
    }
  }

  // Speech-to-Text Methods
  startListening() {
    if (!this.isSTTSupported) {
      throw new Error('Speech recognition is not supported in this browser');
    }
    
    if (this.isListening) {
      console.log('Already listening');
      return;
    }
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      throw error;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Handle speech result and send to Gemini AI
  async handleSpeechResult(transcript) {
    try {
      // Send the transcribed text to Gemini AI
      const response = await geminiService.sendMessage(transcript);
      
      // Speak the AI response
      if (response && response.text) {
        await this.speak(response.text);
      }
      
      return response;
    } catch (error) {
      console.error('Error processing speech with Gemini AI:', error);
      await this.speak('Sorry, I encountered an error processing your request.');
      throw error;
    }
  }

  // Text-to-Speech Methods
  async speak(text, options = {}) {
    if (!this.isTTSSupported) {
      throw new Error('Speech synthesis is not supported in this browser');
    }
    
    return new Promise((resolve, reject) => {
      // Stop any ongoing speech
      this.stopSpeaking();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure utterance
      utterance.voice = this.selectedVoice;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.lang || 'en-US';
      
      // Event handlers
      utterance.onstart = () => {
        console.log('Speech synthesis started');
      };
      
      utterance.onend = () => {
        console.log('Speech synthesis ended');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        reject(new Error(event.error));
      };
      
      // Start speaking
      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  // Voice Management
  getAvailableVoices() {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male',
      isDefault: voice.default
    }));
  }

  setVoice(voiceName) {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.selectedVoice = voice;
      console.log(`Voice changed to: ${voice.name}`);
      return true;
    }
    return false;
  }

  // Conversation Mode - Continuous speech interaction
  async startConversationMode() {
    if (!this.isSTTSupported || !this.isTTSSupported) {
      throw new Error('Conversation mode requires both speech recognition and synthesis support');
    }
    
    await this.speak('Hello! I\'m ready to chat. You can start speaking now.');
    
    // Set up continuous listening
    this.recognition.continuous = true;
    this.startListening();
    
    return {
      stop: () => {
        this.recognition.continuous = false;
        this.stopListening();
        this.stopSpeaking();
      }
    };
  }

  // Utility Methods
  isSupported() {
    return {
      speechToText: this.isSTTSupported,
      textToSpeech: this.isTTSSupported,
      fullSupport: this.isSTTSupported && this.isTTSSupported
    };
  }

  getStatus() {
    return {
      isListening: this.isListening,
      isSpeaking: this.synthesis.speaking,
      selectedVoice: this.selectedVoice?.name,
      availableVoices: this.voices.length,
      support: this.isSupported()
    };
  }

  // Event handler setters
  setOnResult(callback) {
    this.onResult = callback;
  }

  setOnError(callback) {
    this.onError = callback;
  }

  setOnStart(callback) {
    this.onStart = callback;
  }

  setOnEnd(callback) {
    this.onEnd = callback;
  }

  // Quick test methods
  async testTTS(text = 'Hello, this is a test of text to speech functionality.') {
    try {
      await this.speak(text);
      return { success: true, message: 'TTS test completed successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testSTT() {
    return new Promise((resolve) => {
      if (!this.isSTTSupported) {
        resolve({ success: false, error: 'STT not supported' });
        return;
      }
      
      let timeout;
      const originalOnResult = this.onResult;
      const originalOnError = this.onError;
      
      this.onResult = (result) => {
        if (result.isFinal) {
          clearTimeout(timeout);
          this.onResult = originalOnResult;
          this.onError = originalOnError;
          resolve({ success: true, transcript: result.final });
        }
      };
      
      this.onError = (error) => {
        clearTimeout(timeout);
        this.onResult = originalOnResult;
        this.onError = originalOnError;
        resolve({ success: false, error });
      };
      
      timeout = setTimeout(() => {
        this.stopListening();
        this.onResult = originalOnResult;
        this.onError = originalOnError;
        resolve({ success: false, error: 'Test timeout' });
      }, 10000);
      
      this.startListening();
    });
  }
}

// Create and export singleton instance
const webSpeechService = new WebSpeechService();
export default webSpeechService;
