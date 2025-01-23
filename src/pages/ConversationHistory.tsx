import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ConversationList } from '../components/chat/ConversationList';
import { useAgent } from '../hooks/useAgent';
import { getConversations, deleteConversations, type Conversation } from '../services/conversations';
import { ArrowLeft } from 'lucide-react';
import { Notification } from '../components/Notification';

export function ConversationHistory() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { agent } = useAgent(agentId);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation>();
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (agentId) {
      loadConversations();
    }
  }, [agentId]);

  const loadConversations = async () => {
    try {
      const data = await getConversations(agentId!);
      // Sort conversations by creation date, newest first
      const sortedConversations = data.map(conv => ({
        ...conv,
        messages: conv.messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }));
      setConversations(sortedConversations);
      if (sortedConversations.length > 0) {
        setSelectedConversation(sortedConversations[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load conversations'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedConversations(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedConversations(prev => {
      if (prev.size === conversations.length) {
        return new Set();
      }
      return new Set(conversations.map(c => c.id));
    });
  };

  const handleDelete = async () => {
    if (selectedConversations.size === 0) return;

    try {
      await deleteConversations(Array.from(selectedConversations));
      setNotification({
        type: 'success',
        message: `Successfully deleted ${selectedConversations.size} conversation${selectedConversations.size === 1 ? '' : 's'}`
      });
      // Clear selections
      setSelectedConversations(new Set());
      // Reload conversations
      await loadConversations();
    } catch (error) {
      console.error('Failed to delete conversations:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete conversations'
      });
    }
  };

  if (!agent) return null;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)]">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={() => navigate('/agents')}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conversation History</h1>
            <p className="text-gray-600">View past conversations with {agent.name}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100%-4rem)] flex">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : (
            <>
              <ConversationList
                conversations={conversations}
                onSelect={setSelectedConversation}
                selectedId={selectedConversation?.id}
                selectedConversations={selectedConversations}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onDelete={handleDelete}
              />
              
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Show first message from agent */}
                    <div className="mb-4 text-left">
                      <div className="inline-block max-w-[80%] px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                        {agent.first_message}
                      </div>
                    </div>
                    
                    {/* Show conversation messages */}
                    {selectedConversation.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a conversation to view
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}