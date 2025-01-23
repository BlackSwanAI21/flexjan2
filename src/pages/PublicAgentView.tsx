import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Bot, RefreshCw } from 'lucide-react';
import { getPublicAgent } from '../services/agents/public';
import { useChat } from '../services/chat/hooks';
import { useSharedConversation } from '../hooks/useSharedConversation';
import { ChatMessages } from '../components/chat/ChatMessages';
import { ChatInput } from '../components/chat/ChatInput';
import { FeedbackButton } from '../components/chat/FeedbackButton';
import { FeedbackForm } from '../components/chat/FeedbackForm';
import { FeedbackList } from '../components/chat/FeedbackList';
import { Notification } from '../components/Notification';
import { LoadingScreen } from '../components/LoadingScreen';
import { createFeedback, getFeedbacks } from '../services/feedback';
import { useConversationProgress } from '../hooks/useConversationProgress';
import { useConversationTermination } from '../hooks/useConversationTermination';
import { ConversationProgress } from '../components/chat/ConversationProgress';
import { ConversationWarning } from '../components/chat/ConversationWarning';
import { Logo } from '../components/Logo';
import { useLogo } from '../hooks/useLogo';
import { supabase } from '../lib/supabase';
import type { Agent } from '../types/agent';
import type { Feedback } from '../types/feedback';

export function PublicAgentView() {
  const { token } = useParams<{ token: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFirstMessage, setShowFirstMessage] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { logo, isLoading: isLogoLoading } = useLogo();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat state
  const { messages, isLoading: isLoadingChat, error: chatError, sendMessage, refreshChat, isInitializing } = useChat(
    agent?.assistant_id
  );
  const { saveMessageToDb } = useSharedConversation(agent?.id, token);
  const conversationStage = useConversationProgress(messages);
  const isTerminated = useConversationTermination(messages);

  useEffect(() => {
    if (token && !isTokenSet) {
      initializeAgent();
    }
  }, [token, isTokenSet]);

  // Only show first message after both agent and logo are loaded
  useEffect(() => {
    if (agent && !isInitializing && !showFirstMessage && !isLogoLoading) {
      const timer = setTimeout(() => {
        setShowFirstMessage(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [agent, isInitializing, showFirstMessage, isLogoLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showFirstMessage]);

  const initializeAgent = async () => {
    try {
      setIsLoading(true);
      await supabase.rpc('set_share_token', { share_token: token });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTokenSet(true);
      const data = await getPublicAgent(token!);
      setAgent(data);
      loadFeedbacks(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeedbacks = async (agentId: string) => {
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
      await saveMessageToDb({ role: 'user', content });
      const response = await sendMessage(content);
      if (response && response.role === 'assistant') {
        await saveMessageToDb(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleRefresh = () => {
    setShowFirstMessage(false);
    refreshChat();
  };

  const handleFeedbackSubmit = async (feedback: { rating: number; comment: string }) => {
    if (!agent) return;
    
    setIsSubmittingFeedback(true);
    try {
      await createFeedback(agent.id, feedback, token);
      await loadFeedbacks(agent.id);
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

  if (isLoading || !agent || isLogoLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          {logo && <Logo logo={logo} className="h-12 mx-auto mb-4" />}
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">Loading your chat session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Logo logo={logo} className="h-12 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error}
          </h1>
          <p className="text-gray-600">
            This agent may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="h-screen flex flex-col">
        {/* Header with Logo */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              <Logo logo={logo} className="h-8" />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <h1 className="font-semibold text-gray-900">{agent.name}</h1>
                  <p className="text-sm text-gray-500">{agent.model}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar or Warning */}
        {isTerminated ? (
          <ConversationWarning />
        ) : (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto">
              <ConversationProgress currentStage={conversationStage} />
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-full flex flex-col bg-white shadow-sm rounded-lg">
              <ChatMessages
                agent={agent}
                messages={messages}
                showFirstMessage={showFirstMessage}
                isLoading={isLoadingChat}
                error={chatError}
                messagesEndRef={messagesEndRef}
              />

              <div className="p-4 border-t space-y-4">
                <div className="flex space-x-2">
                  <ChatInput
                    onSend={handleSendMessage}
                    disabled={isLoadingChat || isInitializing || !showFirstMessage || isTerminated}
                  />
                  <button
                    onClick={handleRefresh}
                    disabled={isLoadingChat || isInitializing}
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
          </div>
        </div>
      </div>

      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        onSubmit={handleFeedbackSubmit}
        isSubmitting={isSubmittingFeedback}
      />
    </div>
  );
}