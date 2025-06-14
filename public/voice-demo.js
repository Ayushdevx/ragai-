// Voice Features Demo Script
// This script can be run in the browser console to test voice features

console.log('🎤 Voice Features Demo Script');
console.log('Testing Web Speech API integration...');

// Test 1: Check if voice features are available
const testVoiceSupport = () => {
  const hasSTT = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const hasTTS = 'speechSynthesis' in window;
  
  console.log(`✅ Speech Recognition (STT): ${hasSTT ? 'Supported' : 'Not Supported'}`);
  console.log(`✅ Speech Synthesis (TTS): ${hasTTS ? 'Supported' : 'Not Supported'}`);
  
  return { hasSTT, hasTTS };
};

// Test 2: Test Text-to-Speech
const testTTS = (text = "Hello! This is a test of the text to speech functionality.") => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    utterance.onstart = () => console.log('🔊 TTS Started');
    utterance.onend = () => console.log('✅ TTS Completed');
    utterance.onerror = (e) => console.error('❌ TTS Error:', e);
    
    speechSynthesis.speak(utterance);
    console.log('🎵 Playing TTS...');
  } else {
    console.error('❌ TTS not supported');
  }
};

// Test 3: Test Speech Recognition
const testSTT = () => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      console.log('🎤 STT Started - Please speak...');
    };
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        console.log('📝 Recognized:', finalTranscript);
        testTTS(`You said: ${finalTranscript}`);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('❌ STT Error:', event.error);
    };
    
    recognition.onend = () => {
      console.log('✅ STT Completed');
    };
    
    recognition.start();
  } else {
    console.error('❌ STT not supported');
  }
};

// Test 4: Check available voices
const listVoices = () => {
  if ('speechSynthesis' in window) {
    const voices = speechSynthesis.getVoices();
    console.log(`🗣️ Available voices (${voices.length}):`);
    voices.forEach((voice, index) => {
      console.log(`  ${index + 1}. ${voice.name} (${voice.lang}) ${voice.default ? '⭐' : ''}`);
    });
  } else {
    console.error('❌ Speech Synthesis not supported');
  }
};

// Test 5: Test with Gemini AI simulation
const testVoiceWithAI = async () => {
  console.log('🤖 Testing voice integration with AI...');
  
  // Simulate AI response
  const simulateAIResponse = (userInput) => {
    return `I heard you say: "${userInput}". This is a simulated response from the AI assistant.`;
  };
  
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        console.log('📝 User said:', finalTranscript);
        const aiResponse = simulateAIResponse(finalTranscript);
        console.log('🤖 AI response:', aiResponse);
        testTTS(aiResponse);
      }
    };
    
    recognition.start();
    console.log('🎤 Speak now to test the full voice pipeline...');
  }
};

// Main demo function
const runVoiceDemo = () => {
  console.log('🚀 Starting Voice Features Demo...');
  console.log('================================');
  
  // Test support
  const support = testVoiceSupport();
  
  if (support.hasTTS) {
    // Load voices (they might not be immediately available)
    setTimeout(() => {
      listVoices();
      
      // Test TTS
      setTimeout(() => {
        console.log('\n🔊 Testing Text-to-Speech...');
        testTTS();
      }, 1000);
      
    }, 500);
  }
  
  // Instructions for manual testing
  console.log('\n📋 Manual Test Instructions:');
  console.log('1. Run testTTS() to test text-to-speech');
  console.log('2. Run testSTT() to test speech recognition');
  console.log('3. Run testVoiceWithAI() to test full pipeline');
  console.log('4. Run listVoices() to see available voices');
  
  return {
    testTTS,
    testSTT,
    testVoiceWithAI,
    listVoices,
    testVoiceSupport
  };
};

// Auto-run demo
const voiceDemo = runVoiceDemo();

// Export for manual testing
window.voiceDemo = voiceDemo;
