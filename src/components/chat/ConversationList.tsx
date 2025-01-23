import React from 'react';
import { MessageSquare, Calendar, ChevronRight, Share2, Trash2 } from 'lucide-react';
import type { Conversation } from '../../services/conversations';

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  selectedId?: string;
  selectedConversations: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDelete: () => void;
}

export function ConversationList({ 
  conversations, 
  onSelect, 
  selectedId,
  selectedConversations,
  onToggleSelect,
  onSelectAll,
  onDelete 
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="w-80 border-r border-gray-200 bg-white p-4 text-center text-gray-500">
        No conversations yet
      </div>
    );
  }

  const getConversationTitle = (conversation: Conversation) => {
    // Get the first user message, if any
    const firstUserMessage = conversation.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      // Truncate message if it's too long
      return firstUserMessage.content.length > 50 
        ? firstUserMessage.content.substring(0, 50) + '...'
        : firstUserMessage.content;
    }
    return 'New conversation';
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <div className="flex items-center space-x-2">
            {selectedConversations.size > 0 && (
              <button
                onClick={onDelete}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={onSelectAll}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            {selectedConversations.size === conversations.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-gray-500">
            {selectedConversations.size} selected
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`w-full p-4 hover:bg-gray-50 transition-colors flex items-center ${
              selectedId === conversation.id ? 'bg-indigo-50' : ''
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              <input
                type="checkbox"
                checked={selectedConversations.has(conversation.id)}
                onChange={() => onToggleSelect(conversation.id)}
                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => onSelect(conversation)}
              className="flex-1 flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {conversation.shared_token ? (
                    <Share2 className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {getConversationTitle(conversation)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </span>
                    {conversation.shared_token && (
                      <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                        Shared
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}