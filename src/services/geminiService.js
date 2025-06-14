git commit -m "clone it added"git commit -m "clone it added"// src/services/geminiService.js
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

export default genAI;