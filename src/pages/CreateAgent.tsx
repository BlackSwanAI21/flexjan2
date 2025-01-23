import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { CreateAgentCard } from '../components/agents/CreateAgentCard';
import { FileText, Globe, Import, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApiKeyCheck } from '../hooks/useApiKeyCheck';

export function CreateAgent() {
  const navigate = useNavigate();
  const { hasApiKey, isLoading, redirectToApiKeySetup } = useApiKeyCheck();

  const handleCreateAgent = (path: string) => {
    if (!isLoading && !hasApiKey) {
      redirectToApiKeySetup();
    } else {
      navigate(path);
    }
  };

  const createOptions = [
    {
      id: 'basic-template',
      icon: FileText,
      title: 'Basic Template',
      description: 'Create your AI agent using our standard Flexx template with manual input fields.',
      buttonText: 'Use Basic Template',
      onClick: () => handleCreateAgent('/create-agent/basic-template')
    },
    {
      id: 'web-scraper',
      icon: Globe,
      title: 'Web Scrape Template',
      description: "Automatically extract information from your client's website to populate the template.",
      buttonText: 'Use Web Scrape Template',
      onClick: () => handleCreateAgent('/create-agent/web-scraper'),
      disabled: false, // Changed from true to false
      comingSoon: false // Changed from true to false
    },
    {
      id: 'import',
      icon: Import,
      title: 'Import from OpenAI',
      description: 'Import your existing OpenAI assistants and customize them for your needs.',
      buttonText: 'Import Assistant',
      onClick: () => handleCreateAgent('/import')
    },
    {
      id: 'custom',
      icon: PenTool,
      title: 'Custom Prompt',
      description: 'Write your own custom prompt and select an AI model for complete control over your agent.',
      buttonText: 'Use Custom Prompt',
      onClick: () => handleCreateAgent('/create-agent/custom')
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New AI Agent</h1>
          <p className="text-gray-600 mt-1">Configure a new AI agent for your client</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {createOptions.map((option) => (
            <CreateAgentCard
              key={option.id}
              icon={option.icon}
              title={option.title}
              description={option.description}
              buttonText={option.buttonText}
              onClick={option.onClick}
              disabled={option.disabled}
              comingSoon={option.comingSoon}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}