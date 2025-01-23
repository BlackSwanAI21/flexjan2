import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AssistantCard } from '../components/assistants/AssistantCard';
import { listAssistants, type OpenAIAssistant } from '../services/openai/assistants';
import { saveAgent } from '../services/agents';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../components/Notification';
import { Bot } from 'lucide-react';

export function ImportAssistant() {
  const [assistants, setAssistants] = useState<OpenAIAssistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadAssistants();
  }, []);

  const loadAssistants = async () => {
    try {
      const data = await listAssistants();
      setAssistants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assistants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (assistant: OpenAIAssistant) => {
    setImportingId(assistant.id);
    try {
      await saveAgent({
        assistant_id: assistant.id,
        name: assistant.name,
        model: assistant.model,
        instructions: assistant.instructions,
        first_message: 'Hello! How can I help you today?'
      });
      
      setNotification({
        type: 'success',
        message: 'Assistant imported successfully'
      });
      
      // Navigate to agents list after short delay
      setTimeout(() => navigate('/agents'), 1500);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to import assistant'
      });
    } finally {
      setImportingId(null);
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

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import from OpenAI</h1>
          <p className="text-gray-600 mt-1">Import your existing OpenAI assistants</p>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading assistants...</p>
          </div>
        ) : assistants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assistants.map((assistant) => (
              <AssistantCard
                key={assistant.id}
                assistant={assistant}
                onImport={handleImport}
                isImporting={importingId === assistant.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
              <Bot className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No assistants found</h2>
            <p className="text-gray-600">Create assistants in OpenAI to import them here</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}