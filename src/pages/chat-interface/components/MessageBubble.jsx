import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Icon from 'components/AppIcon';

const MessageBubble = ({ message }) => {
  const [showCitations, setShowCitations] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[80%] lg:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Bot" size={16} color="white" />
            </div>
            <div className="flex-1">
              <div className="bg-surface border border-border rounded-2xl rounded-tl-md px-4 py-3 shadow-elevation-1">
                <div className="prose prose-sm max-w-none text-text-primary">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom styling for markdown elements
                      p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                      strong: ({children}) => <strong className="font-semibold text-text-primary">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="leading-relaxed">{children}</li>,
                      code: ({children, inline}) => 
                        inline ? 
                          <code className="bg-secondary-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code> :
                          <code className="block bg-secondary-100 p-2 rounded text-sm font-mono whitespace-pre-wrap">{children}</code>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic">{children}</blockquote>
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => setShowCitations(!showCitations)}
                      className="flex items-center space-x-2 text-xs text-text-secondary hover:text-text-primary transition-colors duration-200"
                    >
                      <Icon name="FileText" size={12} />
                      <span>{message.citations.length} source{message.citations.length !== 1 ? 's' : ''}</span>
                      <Icon name={showCitations ? 'ChevronUp' : 'ChevronDown'} size={12} />
                    </button>

                    {showCitations && (
                      <div className="mt-2 space-y-2">
                        {message.citations.map((citation, index) => (
                          <div key={index} className="bg-secondary-50 rounded-lg p-2 text-xs">
                            <div className="flex items-center space-x-2">
                              <Icon name="FileText" size={12} className="text-primary" />
                              <span className="font-medium text-text-primary">{citation.document}</span>
                            </div>
                            <div className="mt-1 text-text-secondary">
                              Page {citation.page} • {citation.section}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Actions */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs text-text-secondary">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="p-1 text-text-secondary hover:text-text-primary transition-colors duration-200"
                      title="Copy message"
                    >
                      <Icon name={copied ? 'Check' : 'Copy'} size={12} />
                    </button>
                    <button
                      className="p-1 text-text-secondary hover:text-text-primary transition-colors duration-200"
                      title="Share message"
                    >
                      <Icon name="Share" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Message */}
        {isUser && (
          <div className="flex items-start space-x-3 justify-end">
            <div className="flex-1">
              <div className="bg-primary text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-elevation-2">
                <div className="prose prose-sm max-w-none text-white">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed text-white">{children}</p>,
                      strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                      em: ({children}) => <em className="italic text-white">{children}</em>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1 text-white">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1 text-white">{children}</ol>,
                      li: ({children}) => <li className="leading-relaxed text-white">{children}</li>,
                      code: ({children, inline}) => 
                        inline ? 
                          <code className="bg-primary-700 px-1 py-0.5 rounded text-sm font-mono text-white">{children}</code> :
                          <code className="block bg-primary-700 p-2 rounded text-sm font-mono whitespace-pre-wrap text-white">{children}</code>
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Message Actions */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs text-primary-100">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="p-1 text-primary-100 hover:text-white transition-colors duration-200"
                      title="Copy message"
                    >
                      <Icon name={copied ? 'Check' : 'Copy'} size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="User" size={16} className="text-text-secondary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;