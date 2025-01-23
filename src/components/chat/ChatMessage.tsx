import React from 'react';
import { Bot } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

function linkifyText(text: string) {
  const parts = [];
  let lastIndex = 0;
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/g;
  let match;

  while ((match = urlPattern.exec(text)) !== null) {
    // Add the text before the URL
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add the URL as a link
    const url = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
    parts.push(
      <a
        key={`link-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-blue-200 break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {match[0]}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        flex items-start space-x-2 max-w-[80%]
        ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}
      `}>
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
          ${isUser ? 'bg-indigo-600' : 'bg-gray-100'}
        `}>
          {isUser ? (
            <span className="text-white font-medium">You</span>
          ) : (
            <Bot className="w-4 h-4 text-indigo-600" />
          )}
        </div>
        <div className={`
          py-2 px-3 rounded-lg
          ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}
        `}>
          <p className="whitespace-pre-wrap">
            {linkifyText(message)}
          </p>
        </div>
      </div>
    </div>
  );
}