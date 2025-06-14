// src/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initialize the Gemini client with the API key from environment variables.
 * @returns {GoogleGenerativeAI} Configured Gemini client instance.
 */
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Generates a text response based on user input.
 * @param {string} prompt - The user's input prompt.
 * @returns {Promise<string>} The generated text.
 */
export async function generateText(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in text generation:', error);
    throw error;
  }
}

/**
 * Streams a text response chunk by chunk.
 * @param {string} prompt - The user's input prompt.
 * @param {Function} onChunk - Callback to handle each streamed chunk.
 */
export async function streamText(prompt, onChunk) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        onChunk(text);
      }
    }
  } catch (error) {
    console.error('Error in streaming text generation:', error);
    throw error;
  }
}

/**
 * Manages a chat session with history.
 * @param {string} prompt - The user's input prompt.
 * @param {Array} history - The chat history.
 * @returns {Promise<{response: string, updatedHistory: Array}>} The response and updated history.
 */
export async function chatWithHistory(prompt, history = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({ history });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    const updatedHistory = [
      ...history,
      { role: 'user', parts: [{ text: prompt }] },
      { role: 'model', parts: [{ text }] },
    ];

    return { response: text, updatedHistory };
  } catch (error) {
    console.error('Error in chat session:', error);
    throw error;
  }
}

/**
 * Generates text based on a text prompt and an image.
 * @param {string} prompt - The text prompt.
 * @param {File} imageFile - The image file.
 * @returns {Promise<string>} The generated text.
 */
export async function generateTextFromImage(prompt, imageFile) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Convert image file to base64
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
      });

    const imageBase64 = await toBase64(imageFile);
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: imageFile.type,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in multimodal generation:', error);
    throw error;
  }
}

/**
 * Generates website clone code from a URL analysis
 * @param {string} url - The website URL to analyze and clone
 * @returns {Promise<string>} The generated HTML/CSS/JS code
 */
export async function generateWebsiteClone(url) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `As an expert web developer, analyze the website at ${url} and create a complete, modern implementation that clones its design and functionality.

Generate a single HTML file with embedded CSS and JavaScript that includes:

1. **HTML Structure:**
   - Semantic HTML5 elements
   - Proper document structure
   - Accessibility attributes (alt tags, ARIA labels, etc.)
   - Meta tags for responsiveness

2. **CSS Styling:**
   - Modern CSS with Flexbox/Grid layouts
   - CSS custom properties (variables) for colors and spacing
   - Responsive design with mobile-first approach
   - Smooth transitions and hover effects
   - Typography that matches the original design

3. **JavaScript Functionality:**
   - Interactive elements (menus, buttons, forms)
   - Smooth scrolling and animations
   - Form validation if applicable
   - Modern ES6+ syntax
   - Event handling for user interactions

4. **Design Accuracy:**
   - Color scheme matching the original
   - Font choices and hierarchy
   - Spacing and layout proportions
   - Component structure and organization

5. **Modern Best Practices:**
   - Clean, maintainable code structure
   - Performance optimizations
   - SEO-friendly markup
   - Cross-browser compatibility
   - Progressive enhancement

Please provide a complete, production-ready HTML file with embedded CSS and JavaScript that accurately recreates the website's appearance and core functionality. Include detailed comments explaining the code structure and implementation choices.

Focus on creating a pixel-perfect clone while ensuring the code follows modern web development standards and best practices.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in website clone generation:', error);
    throw error;
  }
}

/**
 * Analyzes a website screenshot and generates corresponding code
 * @param {File} imageFile - The screenshot image file
 * @param {string} additionalContext - Optional context about the website
 * @returns {Promise<string>} The generated HTML/CSS/JS code
 */
export async function generateCodeFromScreenshot(imageFile, additionalContext = '') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Convert image file to base64
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
      });

    const imageBase64 = await toBase64(imageFile);
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: imageFile.type,
      },
    };

    const prompt = `Analyze this website screenshot and create a complete, pixel-perfect HTML implementation.

${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Generate a single HTML file with embedded CSS and JavaScript that recreates this design exactly:

1. **Visual Analysis:**
   - Identify layout structure (header, navigation, content sections, footer)
   - Extract color palette and color scheme
   - Analyze typography (fonts, sizes, weights, spacing)
   - Note spacing, margins, and padding patterns
   - Identify interactive elements and their states

2. **HTML Structure:**
   - Create semantic HTML5 markup
   - Use appropriate tags for content sections
   - Include proper accessibility attributes
   - Structure content hierarchically

3. **CSS Implementation:**
   - Replicate exact colors, fonts, and spacing
   - Use modern layout techniques (Flexbox/Grid)
   - Implement responsive design principles
   - Add hover effects and transitions where appropriate
   - Use CSS custom properties for maintainability

4. **JavaScript Functionality:**
   - Add interactivity for navigation menus
   - Implement any visible dynamic elements
   - Include smooth scrolling and animations
   - Add form functionality if present

5. **Accuracy Requirements:**
   - Match pixel-perfect positioning and sizing
   - Replicate exact color values
   - Maintain proper proportions and aspect ratios
   - Ensure visual hierarchy matches the original

Please provide complete, production-ready code with detailed comments. Focus on creating an exact visual replica while following modern web development best practices.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in screenshot code generation:', error);
    throw error;
  }
}

export default genAI;