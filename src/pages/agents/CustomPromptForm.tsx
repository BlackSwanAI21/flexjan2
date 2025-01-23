import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ModelSelect } from '../../components/forms/ModelSelect';
import { PromptTextarea } from '../../components/forms/PromptTextarea';
import { FirstMessageInput } from '../../components/forms/FirstMessageInput';
import { createAssistant } from '../../services/openai';
import { saveAgent } from '../../services/agents';
import { useNavigate } from 'react-router-dom';

export function CustomPromptForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    instructions: '',
    first_message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const assistant = await createAssistant({
        name: formData.name,
        model: formData.model,
        instructions: formData.instructions
      });
      
      await saveAgent({
        assistant_id: assistant.id,
        name: formData.name,
        model: formData.model,
        instructions: formData.instructions,
        first_message: formData.first_message
      });

      navigate('/agents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Prompt</h1>
          <p className="text-gray-600 mt-1">Create an AI agent with your own custom prompt</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Agent Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Customer Support Assistant"
            required
          />

          <ModelSelect
            value={formData.model}
            onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
            required
          />

          <PromptTextarea
            value={formData.instructions}
            onChange={(value) => setFormData(prev => ({ ...prev, instructions: value }))}
            required
          />

          <FirstMessageInput
            value={formData.first_message}
            onChange={(value) => setFormData(prev => ({ ...prev, first_message: value }))}
            required
          />

          <div className="flex space-x-4">
            <Button type="submit" isLoading={isSubmitting}>
              Create Agent
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/create-agent')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}