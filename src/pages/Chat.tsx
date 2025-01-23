import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

// Layout
import { DashboardLayout } from '../layouts/DashboardLayout';

// Components
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatMessages } from '../components/chat/ChatMessages';
import { ChatInput } from '../components/chat/ChatInput';
import { FeedbackButton } from '../components/chat/FeedbackButton';
import { FeedbackForm } from '../components/chat/FeedbackForm';
import { FeedbackList } from '../components/chat/FeedbackList';
import { Notification } from '../components/Notification';

// Hooks and Services
import { useChat } from '../services/chat/hooks';
import { getAgent } from '../services/agents';
import { useConversation } from '../hooks/useConversation';
import { createFeedback, getFeedbacks } from '../services/feedback';
import { useConversationProgress } from '../hooks/useConversationProgress';
import { useConversationTermination } from '../hooks/useConversationTermination';

// Types
import type { Agent } from '../types/agent';
import type { Feedback } from '../types/feedback';
import type { Message } from '../services/chat/types';

export function Chat() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const { conversationId, initializeConversation, saveMessageToDb } = useConversation(agentId);
  const { messages, isLoading, isInitializing, error, sendMessage, refreshChat } = useChat(
    agent?.assistant_id,
    saveMessageToDb
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showFirstMessage, setShowFirstMessage] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Conversation progress and termination
  const conversationStage = useConversationProgress(messages);
  const isTerminated = useConversationTermination(messages);

  useEffect(() => {
    if (agentId) {
      loadAgent();
      loadFeedbacks();
    }
  }, [agentId]);

  useEffect(() => {
    if (agentId && !conversationId) {
      initializeConversation();
    }
  }, [agentId, conversationId, initializeConversation]);

  useEffect(() => {
    if (agent && !isInitializing && !showFirstMessage) {
      const timer = setTimeout(() => {
        setShowFirstMessage(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [agent, isInitializing, showFirstMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showFirstMessage]);

  const loadAgent = async () => {
    try {
      const data = await getAgent(agentId!);
      setAgent(data);
    } catch (error) {
      console.error('Failed to load agent:', error);
    } finally {
      setIsLoadingAgent(false);
    }
  };

  const loadFeedbacks = async () => {
    if (!agentId) return;
    try {
      const data = await getFeedbacks(agentId);
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to load feedbacks:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!agent) return;

    try {
      console.log('[Chat] Sending message:', { content: content.substring(0, 50) + '...' });
      // Update UI immediately with the user message
      const userMessage: Message = { role: 'user', content };
      sendMessage(content);

      // Handle persistence in the background
      console.log('[Chat] Saving user message to database');
      saveMessageToDb(userMessage).catch(error => {
        console.error('[Chat] Failed to save user message to database:', error);
      });
    } catch (error) {
      console.error('[Chat] Error handling message:', error);
    }
  };

  const handleRefresh = async () => {
    setShowFirstMessage(false);
    refreshChat();
    await initializeConversation();
  };

  const handleFeedbackSubmit = async (feedback: { rating: number; comment: string }) => {
    if (!agentId) return;
    
    setIsSubmittingFeedback(true);
    try {
      await createFeedback(agentId, feedback);
      await loadFeedbacks();
      setShowFeedbackForm(false);
      setNotification({ type: 'success', message: 'Thank you for your feedback!' });
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to submit feedback' 
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isLoadingAgent || !agent) return null;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <ChatHeader 
          agent={agent} 
          onBack={() => navigate('/agents')}
          conversationStage={conversationStage}
          isTerminated={isTerminated}
        />

        <ChatMessages
          agent={agent}
          messages={messages}
          showFirstMessage={showFirstMessage}
          isLoading={isLoading}
          error={error}
          messagesEndRef={messagesEndRef}
        />

        <div className="p-4 border-t space-y-4">
          <div className="flex space-x-2">
            <ChatInput 
              onSend={handleSendMessage} 
              disabled={isLoading || isInitializing || !showFirstMessage || isTerminated}
            />
            <button
              onClick={handleRefresh}
              disabled={isLoading || isInitializing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Refresh chat"
            >
              <RefreshCw className={`w-4 h-4 ${isInitializing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex justify-center">
            <FeedbackButton 
              onClick={() => setShowFeedbackForm(true)} 
              feedbackCount={feedbacks.length}
            />
          </div>

          <FeedbackList feedbacks={feedbacks} />
        </div>
      </div>

      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        onSubmit={handleFeedbackSubmit}
        isSubmitting={isSubmittingFeedback}
      />
    </DashboardLayout>
  );
}