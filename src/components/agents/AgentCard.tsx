import React, { useState } from 'react';
import { Bot, Pencil, MessageSquare, Trash2, Share2, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Agent } from '../../types/agent';
import { DeleteAgentModal } from './DeleteAgentModal';
import { ShareLinkModal } from '../share/ShareLinkModal';
import { Notification } from '../Notification';

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent, deleteFromOpenAI: boolean) => Promise<void>;
}

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleDelete = async (deleteFromOpenAI: boolean) => {
    setIsDeleting(true);
    try {
      await onDelete(agent, deleteFromOpenAI);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleChat = () => {
    navigate(`/chat/${agent.id}`);
  };

  const handleHistory = () => {
    navigate(`/conversations/${agent.id}`);
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-500">{agent.model}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(agent)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit agent"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleChat}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Chat with agent"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={handleHistory}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="View chat history"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Share agent"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete agent"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-600 text-sm line-clamp-3">{agent.instructions}</p>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              <span className="font-medium">First Message:</span> {agent.first_message}
            </p>
          </div>
        </div>
      </div>

      <DeleteAgentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <ShareLinkModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        agentId={agent.id}
        agentName={agent.name}
      />
    </>
  );
}