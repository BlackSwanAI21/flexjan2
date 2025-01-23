import React from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { createAssistant } from '../../services/openai';
import { saveAgent } from '../../services/agents';
import { CompanyInfoSection } from './components/CompanyInfoSection';
import { QualificationSection } from './components/QualificationSection';
import { FaqSection } from './components/FaqSection';
import { useBasicTemplateForm } from './hooks/useBasicTemplateForm';

export function BasicTemplateForm() {
  const navigate = useNavigate();
  const { formData, isSubmitting, error, handleSubmit } = useBasicTemplateForm();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Basic Template</h1>
          <p className="text-gray-600 mt-1">Create your AI agent using our standard template</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <CompanyInfoSection formData={formData} />
          <QualificationSection formData={formData} />
          <FaqSection formData={formData} />

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