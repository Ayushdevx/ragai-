# 🎤 **Voice Features Testing Guide**

## ✅ **How to Test Your Voice-Enabled RAG AI Chatbot**

Your chatbot is now running with comprehensive voice features! Here's how to test everything:

---

## 🚀 **Quick Start Testing**

### **1. Open the Chatbot**
- Navigate to: http://localhost:5173/
- Look for the floating chatbot icon in the bottom-right corner
- Click to open the chatbot interface

### **2. Check Voice Support**
- Look for the **Voice Controls Panel** (appears if voice is supported)
- Should show **STT** and **TTS** badges if features are available
- Grant microphone permission when prompted

### **3. Test Speech-to-Text (STT)**
```
🎤 Method 1: Click the microphone icon in the chat input
🎤 Method 2: Press Ctrl + M
🎤 Method 3: Say "Start listening" (if in conversation mode)
```

### **4. Test Text-to-Speech (TTS)**
```
🔊 Method 1: Click the speaker icon next to any AI message
🔊 Method 2: Enable "Auto Speak" in chatbot settings
🔊 Method 3: Use conversation mode for automatic responses
```

---

## 🧪 **Advanced Testing**

### **Browser Console Tests**
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Load the test script:
```javascript
// Load test suite
const script = document.createElement('script');
script.src = '/feature-test-suite.js';
document.head.appendChild(script);
```

4. Run individual tests:
```javascript
// Test voice features
testSuite.testVoiceFeatures();

// Test all features
testSuite.runAllTests();
```

### **Voice Demo Script**
```javascript
// Load voice demo
const voiceScript = document.createElement('script');
voiceScript.src = '/voice-demo.js';
document.head.appendChild(voiceScript);

// Run voice tests
voiceDemo.testTTS("Hello, this is a voice test!");
voiceDemo.testSTT(); // Speak after running this
```

---

## 🎯 **Feature Testing Checklist**

### **✅ Basic Voice Features**
- [ ] Microphone icon appears in chat input
- [ ] Clicking microphone starts voice recognition
- [ ] Speaking converts to text in input field
- [ ] Text automatically sends to AI
- [ ] AI responds with text
- [ ] Speaker icons appear next to AI messages
- [ ] Clicking speaker plays AI message audio

### **✅ Advanced Voice Features**
- [ ] Voice Controls Panel appears
- [ ] "Voice Chat" button starts conversation mode
- [ ] Continuous voice conversation works
- [ ] "Test" button runs voice feature tests
- [ ] Keyboard shortcuts work (Ctrl+M, Ctrl+Shift+V)
- [ ] Voice status indicators show in header
- [ ] Auto-speak setting works in chatbot settings

### **✅ RAG & Document Features**
- [ ] File upload button works
- [ ] Can upload PDF files
- [ ] Can upload text/markdown files
- [ ] Can upload image files (with OCR)
- [ ] Document count shows in header
- [ ] RAG-enhanced responses include document references
- [ ] Session management collects user info

### **✅ UI/UX Features**
- [ ] Chatbot opens/closes smoothly
- [ ] Messages display properly with formatting
- [ ] Typing indicators work
- [ ] Toast notifications appear
- [ ] Settings panel functions
- [ ] Export chat works
- [ ] Responsive design on mobile

---

## 🛠️ **Troubleshooting**

### **Voice Not Working?**
1. **Check browser support**:
   - Chrome/Edge: Full support ✅
   - Safari: Full support ✅  
   - Firefox: TTS only ⚠️

2. **Check permissions**:
   - Allow microphone access when prompted
   - Ensure HTTPS connection (required for mic access)

3. **Check console errors**:
   - Open Developer Tools (F12)
   - Look for voice-related error messages
   - Common fix: Refresh page and retry

### **PDF Upload Issues?**
1. **Check file size**: Must be under 10MB
2. **Check file type**: Only PDF files supported
3. **Internet connection**: PDF.js loads from CDN

### **Performance Issues?**
1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Restart browser**: Close and reopen
3. **Check memory**: Large files may slow processing

---

## 🎪 **Demo Scenarios**

### **Scenario 1: Voice Chat Demo**
1. Open chatbot
2. Click "Voice Chat" 
3. Say: "Hello, can you help me with JavaScript?"
4. Listen to AI response
5. Continue conversation vocally

### **Scenario 2: Document Analysis**
1. Upload a PDF document
2. Ask: "What's the main topic of this document?"
3. Use voice input for the question
4. Get RAG-enhanced response with document context

### **Scenario 3: Hands-Free Coding Help**
1. Enable conversation mode
2. Say: "I need help debugging a React component"
3. Follow up with specific questions
4. Get spoken responses while coding

---

## 📊 **Expected Performance**

### **Voice Features**
- **STT Latency**: < 2 seconds for short phrases
- **TTS Playback**: Immediate start, natural pace
- **Recognition Accuracy**: 85-95% with clear speech

### **File Processing**
- **Text files**: Instant processing
- **Images**: 5-30 seconds for OCR
- **PDFs**: 2-10 seconds depending on size

### **AI Responses**
- **Simple queries**: 1-3 seconds
- **RAG-enhanced**: 3-7 seconds
- **Complex analysis**: 5-15 seconds

---

## 🎉 **Success Indicators**

You'll know everything is working when you see:

✅ **Voice Controls Panel** with STT/TTS badges  
✅ **Microphone icon** in chat input  
✅ **Speaker icons** on AI messages  
✅ **Voice status indicators** in header  
✅ **Smooth voice-to-text conversion**  
✅ **Clear text-to-speech playback**  
✅ **Conversation mode** working hands-free  
✅ **Document upload and RAG responses**  
✅ **No console errors** (except harmless warnings)  

---

## 🆘 **Need Help?**

If you encounter issues:

1. **Check the browser console** for specific error messages
2. **Try different browsers** (Chrome/Edge recommended)
3. **Verify microphone permissions** in browser settings
4. **Test with simple text chat** first, then add voice
5. **Restart the development server** if needed

---

**🚀 Your RAG AI Chatbot with Voice Features is ready for testing!**

**Access URL**: http://localhost:5173/  
**Voice Features**: Enabled with Web Speech API  
**AI Engine**: Gemini AI  
**Document Processing**: PDF, Text, Images with OCR  
**Session Management**: User info collection and email summaries
