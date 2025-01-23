import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { WebsiteForm } from '../../components/agents/webscraper/WebsiteForm';
import { ScrapingPreview } from '../../components/agents/webscraper/ScrapingPreview';
import { AgentConfigForm } from '../../components/agents/webscraper/AgentConfigForm';
import { useWebScraper } from '../../hooks/useWebScraper';
import { createAssistant } from '../../services/openai';
import { saveAgent } from '../../services/agents';
import { formatInstructions } from '../../services/webscraper/formatters/promptFormatter';
import { Notification } from '../../components/Notification';
import type { WebScraperFormData } from '../../types/webscraper';

export function WebScraperTemplate() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { scrapedData, isLoading, error, scrapeWebsite } = useWebScraper();
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (url: string) => {
    try {
      await scrapeWebsite(url);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to analyze website'
      });
    }
  };

  const handleCreate = async (formData: WebScraperFormData) => {
    setIsCreating(true);
    try {
      // Format instructions using the formatter
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
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create agent'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Web Scraper Template</h1>
          <p className="text-gray-600 mt-1">Create an AI agent by analyzing your client's website</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <WebsiteForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
            error={error}
          />
          <ScrapingPreview 
            data={scrapedData} 
            isLoading={isLoading} 
          />
        </div>

        {scrapedData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <AgentConfigForm
              scrapedData={scrapedData}
              onSubmit={handleCreate}
              isSubmitting={isCreating}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}