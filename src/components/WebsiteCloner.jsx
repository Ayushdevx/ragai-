import React, { useState } from 'react';
import { generateWebsiteClone, generateCodeFromScreenshot } from '../services/geminiService';

const WebsiteCloner = () => {
  const [url, setUrl] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('url');

  const handleScreenshotUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setScreenshot(file);
      setError('');
    } else {
      setError('Please upload a valid image file');
    }
  };

  const generateCodeFromUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedCode('');    try {
      const result = await generateWebsiteClone(url);
      setGeneratedCode(result);
    } catch (err) {
      setError('Failed to generate code from URL. Please try again.');
      console.error('Code generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCodeFromScreenshot = async () => {
    if (!screenshot) {
      setError('Please upload a screenshot first');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedCode('');    try {
      const result = await generateCodeFromScreenshot(screenshot);
      setGeneratedCode(result);
    } catch (err) {
      setError('Failed to generate code from screenshot. Please try again.');
      console.error('Image analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      // You could add a toast notification here
      alert('Code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cloned-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Website Cloner</h2>
        <p className="text-gray-600">
          Generate code by analyzing a website URL or uploading a screenshot
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'url'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Analyze URL
        </button>
        <button
          onClick={() => setActiveTab('screenshot')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'screenshot'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload Screenshot
        </button>
      </div>

      {/* URL Input Tab */}
      {activeTab === 'url' && (
        <div className="mb-6">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={generateCodeFromUrl}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Generate Code'}
            </button>
          </div>
        </div>
      )}

      {/* Screenshot Upload Tab */}
      {activeTab === 'screenshot' && (
        <div className="mb-6">
          <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Screenshot
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="screenshot"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="hidden"
            />
            <label
              htmlFor="screenshot"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600">
                {screenshot ? screenshot.name : 'Click to upload or drag and drop'}
              </span>
              <span className="text-gray-400 text-sm">PNG, JPG, GIF up to 10MB</span>
            </label>
          </div>
          {screenshot && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={generateCodeFromScreenshot}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : 'Generate Code'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Generating code...</span>
        </div>
      )}

      {/* Generated Code Display */}
      {generatedCode && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Generated Code</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Copy
              </button>
              <button
                onClick={downloadCode}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Download
              </button>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
            <pre className="text-green-400 text-sm whitespace-pre-wrap">{generatedCode}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteCloner;

