import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FormField } from './FormField';
import { Button } from '../../Button';
import { ModelSelect } from '../../forms/ModelSelect';
import { FAQEditor } from './FAQEditor';
import { generateQualifiedProspectQuestions } from '../../../utils/qualifiedProspect';
import type { ScrapedData, WebScraperFormData, FAQ } from '../../../types/webscraper';

interface AgentConfigFormProps {
  scrapedData: ScrapedData;
  onSubmit: (data: WebScraperFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function AgentConfigForm({ scrapedData, onSubmit, isSubmitting }: AgentConfigFormProps) {
  const [formData, setFormData] = useState<WebScraperFormData>({
    url: '',
    companyName: '',
    country: '',
    industry: '',
    service: '',
    phone: '',
    openingTimes: '',
    description: '',
    services: [],
    openingMessage: '',
    qualifiedProspect: '',
    model: 'gpt-4o',
    faqs: []
  });

  // Highlight empty required fields
  const [highlightFields, setHighlightFields] = useState<Record<string, boolean>>({});

  const generateOpeningMessage = (companyName: string, service: string) => {
    return `Hi it's Sarah from ${companyName}, is that the same {{contact.first_name}} who was interested in ${service}?`;
  };

  // Update form when scraped data changes
  useEffect(() => {
    if (scrapedData) {
      const companyName = scrapedData.companyName.split('–')[0].trim();
      const service = scrapedData.service || '';
      
      setFormData(prev => ({
        ...prev,
        companyName,
        country: scrapedData.country || prev.country,
        industry: scrapedData.industry || prev.industry,
        service,
        phone: scrapedData.contactInfo?.phone || prev.phone,
        openingTimes: scrapedData.openingTimes || prev.openingTimes,
        description: scrapedData.description || prev.description,
        services: scrapedData.services || prev.services,
        faqs: scrapedData.faqs || prev.faqs,
        openingMessage: generateOpeningMessage(companyName, service)
      }));

      // Generate qualified prospect questions
      generateQualifiedProspectQuestions(service).then(questions => {
        setFormData(prev => ({
          ...prev,
          qualifiedProspect: questions
        }));
      });

      // Check for empty required fields
      setHighlightFields({
        companyName: !companyName,
        country: !scrapedData.country,
        industry: !scrapedData.industry,
        service: !service,
        phone: !scrapedData.contactInfo?.phone,
        openingTimes: !scrapedData.openingTimes
      });
    }
  }, [scrapedData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleFAQChange = (index: number, field: keyof FAQ, value: string) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const handleRemoveFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const handleAddFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Company Name"
          value={formData.companyName}
          onChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
          required
          highlight={highlightFields.companyName}
        />
        
        <FormField
          label="Country"
          value={formData.country}
          onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
          required
          highlight={highlightFields.country}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Industry"
          value={formData.industry}
          onChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
          required
          highlight={highlightFields.industry}
        />
        
        <FormField
          label="Service"
          value={formData.service}
          onChange={(value) => setFormData(prev => ({ ...prev, service: value }))}
          required
          highlight={highlightFields.service}
        />
      </div>

      <ModelSelect
        value={formData.model}
        onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Phone Number"
          value={formData.phone}
          onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
          required
          highlight={highlightFields.phone}
        />
        
        <FormField
          label="Opening Times"
          value={formData.openingTimes}
          onChange={(value) => setFormData(prev => ({ ...prev, openingTimes: value }))}
          required
          highlight={highlightFields.openingTimes}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Opening Message
        </label>
        <textarea
          value={formData.openingMessage}
          onChange={(e) => setFormData(prev => ({ ...prev, openingMessage: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Qualified Prospect Questions
        </label>
        <textarea
          value={formData.qualifiedProspect}
          onChange={(e) => setFormData(prev => ({ ...prev, qualifiedProspect: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">FAQs</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddFAQ}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </div>
        
        <FAQEditor
          faqs={formData.faqs}
          onChange={handleFAQChange}
          onRemove={handleRemoveFAQ}
        />
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        Create Agent
      </Button>
    </form>
  );
}