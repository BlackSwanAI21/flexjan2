import React from 'react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import type { Agent } from '../../types/agent';
import type { Message } from '../../services/chat/types';

interface ChatMessagesProps {
  agent: Agent;
  messages: Message[];
  showFirstMessage: boolean;
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessages({
  agent,
  messages,
  showFirstMessage,
  isLoading,
  error,
  messagesEndRef
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {!showFirstMessage ? (
        <TypingIndicator />
      ) : (
        <>
          <ChatMessage
            message={agent.first_message}
            isUser={false}
          />
          {messages.map((message, index, array) => {
            // Skip if this is a duplicate of the previous message
            if (index > 0 &&
                message.role === array[index - 1].role &&
                message.content === array[index - 1].content &&
                message.run_id === array[index - 1].run_id) {
              return null;
            }
            return (
              <ChatMessage
                key={`${message.run_id}-${index}`}
                message={message.content}
                isUser={message.role === 'user'}
              />
            );
          })}
        </>
      )}
      {isLoading && <TypingIndicator />}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}