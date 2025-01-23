import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAssistant } from '../../../services/openai';
import { saveAgent } from '../../../services/agents';
import { formatInstructions } from '../utils/formatInstructions';
import type { BasicTemplateFormData } from '../types';

const initialFormData: BasicTemplateFormData = {
  companyName: '',
  country: '',
  industry: '',
  service: '',
  phone: '',
  website: '',
  offer: '',
  openingTimes: '',
  openingMessage: '',
  qualifiedProspect: '',
  model: 'gpt-4o', // Default to GPT-4 Original
  faqs: [{ question: '', answer: '' }]
};

export function useBasicTemplateForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const instructions = formatInstructions(formData);

      // Create OpenAI assistant
      const assistant = await createAssistant({
        name: `${formData.companyName} Sales Assistant`,
        model: formData.model,
        instructions
      });
      
      // Save agent to database
      await saveAgent({
        assistant_id: assistant.id,
        name: `${formData.companyName} Sales Assistant`,
        model: formData.model,
        instructions,
        first_message: formData.openingMessage
      });

      navigate('/agents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    error,
    handleSubmit
  };
}