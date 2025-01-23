import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Bot, Plus } from 'lucide-react';
import { AgentCard } from '../components/agents/AgentCard';
import { EditAgentForm } from '../components/agents/EditAgentForm';
import { Button } from '../components/Button';
import { getAgents, updateAgent, deleteAgent } from '../services/agents';
import { updateAssistant, deleteAssistant } from '../services/openai';
import type { Agent } from '../types/agent';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../components/Notification';

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setError('');
  };

  const handleUpdate = async (updates: Partial<Agent>) => {
    if (!editingAgent) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await updateAssistant(editingAgent.assistant_id, {
        name: updates.name!,
        model: updates.model!,
        instructions: updates.instructions!
      });
      
      const updatedAgent = await updateAgent(editingAgent.id, updates);
      setAgents(prev => prev.map(agent => 
        agent.id === updatedAgent.id ? updatedAgent : agent
      ));
      
      setEditingAgent(null);
      setNotification({ type: 'success', message: 'Agent updated successfully' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (agent: Agent, deleteFromOpenAI: boolean) => {
    try {
      if (deleteFromOpenAI) {
        await deleteAssistant(agent.assistant_id);
      }
      await deleteAgent(agent.id);
      setAgents(prev => prev.filter(a => a.id !== agent.id));
      setNotification({ 
        type: 'success', 
        message: `Agent deleted successfully${deleteFromOpenAI ? ' from database and OpenAI' : ' from database'}`
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete agent'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My AI Agents</h1>
            <p className="text-gray-600 mt-1">View and manage your AI agents</p>
          </div>
          <Button onClick={() => navigate('/create-agent')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading agents...</p>
          </div>
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              editingAgent?.id === agent.id ? (
                <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <EditAgentForm
                    agent={agent}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingAgent(null)}
                    isSubmitting={isSubmitting}
                    error={error}
                  />
                </div>
              ) : (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
                <Bot className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No agents yet</h2>
              <p className="text-gray-600 mb-6">Create your first AI agent to get started</p>
              <Button onClick={() => navigate('/create-agent')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}