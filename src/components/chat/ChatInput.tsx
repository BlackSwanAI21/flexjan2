import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSend(message.trim());
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={disabled ? 'Please wait...' : 'Type your message...'}
        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}