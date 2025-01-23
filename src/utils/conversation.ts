import { PHONE_PATTERNS, QUALIFYING_KEYWORDS, COMPLETION_KEYWORDS } from '../constants/conversation';
import type { Message } from '../services/chat/types';

export function containsPhoneNumber(text: string): boolean {
  return PHONE_PATTERNS.some(pattern => pattern.test(text));
}

export function hasQualifyingKeywords(text: string): boolean {
  return QUALIFYING_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
}

export function hasCompletionKeywords(text: string): boolean {
  return COMPLETION_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword)
  ) || containsPhoneNumber(text);
}

export function hasUserResponse(messages: Message[]): boolean {
  return messages.some(msg => msg.role === 'user');
}

export function isTerminationMessage(message: Message): boolean {
  return message.role === 'assistant' && 
         message.content.toLowerCase().trim() === 'goodbye';
}