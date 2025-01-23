import React, { useState } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { ModelSelect } from '../forms/ModelSelect';
import { PromptTextarea } from '../forms/PromptTextarea';
import { FirstMessageInput } from '../forms/FirstMessageInput';
import type { Agent } from '../../types/agent';

interface EditAgentFormProps {
  agent: Agent;
  onSubmit: (updates: Partial<Agent>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function EditAgentForm({ 
  agent, 
  onSubmit, 
  onCancel, 
  isSubmitting,
  error 
}: EditAgentFormProps) {
  const [formData, setFormData] = useState({
    name: agent.name,
    model: agent.model,
    instructions: agent.instructions,
    first_message: agent.first_message
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    model: '',
    instructions: '',
    first_message: ''
  });

  const validateForm = () => {
    const errors = {
      name: '',
      model: '',
      instructions: '',
      first_message: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Agent name is required';
      isValid = false;
    }
    if (!formData.model) {
      errors.model = 'Please select a model';
      isValid = false;
    }
    if (!formData.instructions.trim()) {
      errors.instructions = 'Instructions are required';
      isValid = false;
    }
    if (!formData.first_message.trim()) {
      errors.first_message = 'First message is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  return (
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
        error={formErrors.name}
      />

      <ModelSelect
        value={formData.model}
        onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
        error={formErrors.model}
      />

      <PromptTextarea
        value={formData.instructions}
        onChange={(value) => setFormData(prev => ({ ...prev, instructions: value }))}
        error={formErrors.instructions}
      />

      <FirstMessageInput
        value={formData.first_message}
        onChange={(value) => setFormData(prev => ({ ...prev, first_message: value }))}
        error={formErrors.first_message}
      />

      <div className="flex space-x-4">
        <Button type="submit" isLoading={isSubmitting}>
          Save Changes
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}