import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AgentSelect } from '../components/ghl/AgentSelect';
import { LocationInput } from '../components/ghl/LocationInput';
import { APIKeyInput } from '../components/ghl/APIKeyInput';
import { OpeningMessageInput } from '../components/ghl/OpeningMessageInput';
import { TimeZoneSelect } from '../components/ghl/TimeZoneSelect';
import { Button } from '../components/Button';
import { useGHLCustomFields } from '../hooks/useGHLCustomFields';
import { updateCustomValues } from '../services/ghl/api';
import { REQUIRED_FIELD_KEYS } from '../services/ghl/constants';
import { getApiKey } from '../services/apiKeys';
import { getAgent } from '../services/agents';
import { Notification } from '../components/Notification';
import { ModerationLevelSelect, ModerationLevel } from '../components/ghl/ModerationLevelSelect';
import { supabase } from '../lib/supabaseClient';
import { createWebhook } from '../services/webhooks/api';
import { analyzeAgentObjective, generateModerationPrompt, identifyComplianceBody } from '../services/openai/api';

export function ImportGHL() {
  const [formData, setFormData] = useState({
    agentId: '',
    locationId: '',
    apiKey: '',
    openingMessage: "Hi it's Sarah from Company Name, is that the same {{contact.first_name}} who was interested in product/service?",
    timeDetectionEnabled: false,
    moderationEnabled: false,
    moderationLevel: 'medium' as ModerationLevel,
    timezone: '',
    moderationPrompt: ''
  });

  const { customFields, isLoading, error } = useGHLCustomFields(formData.apiKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Load agent's opening message when selected
  useEffect(() => {
    if (formData.agentId) {
      getAgent(formData.agentId).then(agent => {
        if (agent?.first_message) {
          setFormData(prev => ({
            ...prev,
            openingMessage: agent.first_message
          }));
        }
      }).catch(console.error);
    }
  }, [formData.agentId]);

  const savePreferences = async (assistantId: string, webhookUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First try to get existing preference
      const { data: existingPref, error: selectError } = await supabase
        .from('ghl_preferences')
        .select('*')
        .eq('id', user.id)
        .eq('assistant_id', assistantId)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking existing preferences:', selectError);
      }

      const preferences = {
        id: user.id,
        assistant_id: assistantId,
        time_detection_enabled: formData.timeDetectionEnabled,
        timezone: formData.timeDetectionEnabled ? formData.timezone : null,
        moderation_enabled: formData.moderationEnabled,
        moderation_level: formData.moderationEnabled ? formData.moderationLevel : null,
        moderation_prompt: formData.moderationEnabled ? formData.moderationPrompt : null,
        webhook_url: webhookUrl
      };

      if (existingPref) {
        const { error: updateError } = await supabase
          .from('ghl_preferences')
          .update(preferences)
          .eq('preference_id', existingPref.preference_id);

        if (updateError) {
          console.error('Error updating preferences:', updateError);
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('ghl_preferences')
          .insert(preferences);

        if (insertError) {
          console.error('Error inserting preferences:', insertError);
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Error in savePreferences:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agentId || !formData.locationId || !formData.apiKey) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    let ghlSuccess = false;

    try {
      // 1. First attempt the GHL API integration
      const openAIApiKey = await getApiKey();
      if (!openAIApiKey) {
        throw new Error('OpenAI API key not found');
      }

      const agent = await getAgent(formData.agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // If moderation is enabled, generate the moderation prompt
      if (formData.moderationEnabled) {
        try {
          const objective = await analyzeAgentObjective(openAIApiKey, agent.instructions);
          
          if (formData.moderationLevel === 'compliant') {
            // For compliance mode, we need both the objective and compliance body
            const complianceBody = await identifyComplianceBody(openAIApiKey, agent.instructions);
            const moderationPrompt = await generateModerationPrompt(openAIApiKey, objective, formData.moderationLevel, complianceBody);
            formData.moderationPrompt = moderationPrompt;
          } else {
            // For light and medium modes, we only need the objective
            const moderationPrompt = await generateModerationPrompt(openAIApiKey, objective, formData.moderationLevel);
            formData.moderationPrompt = moderationPrompt;
          }
        } catch (error) {
          console.error('Failed to generate moderation prompt:', error);
          throw new Error('Failed to generate moderation prompt. Please try again.');
        }
      }

      // Find custom value IDs
      const fieldMap = customFields.reduce((acc, field) => {
        acc[field.fieldKey] = field.id;
        return acc;
      }, {} as Record<string, string>);

      // Prepare updates
      const updates = [
        {
          customValueId: fieldMap[REQUIRED_FIELD_KEYS.WEBHOOK_CHAT_GPT3],
          value: 'www.example.com'
        },
        {
          customValueId: fieldMap[REQUIRED_FIELD_KEYS.FIRST_OUTGOING_MESSAGE],
          value: formData.openingMessage
        },
        {
          customValueId: fieldMap[REQUIRED_FIELD_KEYS.AI_KEY],
          value: openAIApiKey
        },
        {
          customValueId: fieldMap[REQUIRED_FIELD_KEYS.ASSISTANT_ID],
          value: agent.assistant_id
        },
        {
          customValueId: fieldMap[REQUIRED_FIELD_KEYS.GHL_API_KEY],
          value: formData.apiKey
        },
        {
          customValueId: fieldMap[REQUIRED_FIELD_KEYS.GHL_LOCATION_ID],
          value: formData.locationId
        }
      ];

      // 2. Create webhook (non-blocking)
      try {
        const webhook = await createWebhook();
        console.log('Webhook created:', webhook);

        // Update the webhook URL in the updates array
        const webhookUpdate = updates.find(u => u.customValueId === fieldMap[REQUIRED_FIELD_KEYS.WEBHOOK_CHAT_GPT3]);
        if (webhookUpdate) {
          webhookUpdate.value = webhook.webhook_url;
        }
        
        // Perform the GHL update with the real webhook URL
        await updateCustomValues(formData.apiKey, updates);
        ghlSuccess = true;
        
        // Save preferences to Supabase with webhook URL
        await savePreferences(agent.assistant_id, webhook.webhook_url);
      } catch (webhookError) {
        console.error('Webhook creation failed:', webhookError);
        // If webhook creation fails, proceed with GHL update using default URL
        try {
          await updateCustomValues(formData.apiKey, updates);
          ghlSuccess = true;
          // Save preferences without webhook URL
          await savePreferences(agent.assistant_id);
        } catch (error) {
          console.error('GHL update failed:', error);
          throw error;
        }
      }

      setNotification({
        type: 'success',
        message: 'Successfully imported to GHL'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to import to GHL'
      });

      // Only try to save preferences if we haven't already
      if (!ghlSuccess && formData.agentId) {
        try {
          const agent = await getAgent(formData.agentId);
          if (agent) {
            await savePreferences(agent.assistant_id);
          }
        } catch (prefError) {
          console.error('Fallback preference saving failed:', prefError);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import AI Agent to GoHighLevel</h1>
          <p className="text-gray-600 mt-1">Connect your AI agent with your GoHighLevel account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
            <AgentSelect
              value={formData.agentId}
              onChange={(value) => setFormData(prev => ({ ...prev, agentId: value }))}
            />

            <LocationInput
              value={formData.locationId}
              onChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
            />

            <APIKeyInput
              value={formData.apiKey}
              onChange={(value) => setFormData(prev => ({ ...prev, apiKey: value }))}
              isLoading={isLoading}
            />

            <OpeningMessageInput
              value={formData.openingMessage}
              onChange={(value) => setFormData(prev => ({ ...prev, openingMessage: value }))}
            />

            {/* AI Features Section */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced AI Features</h3>
              
              {/* Time Detection */}
              <div className="space-y-4 mb-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.timeDetectionEnabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeDetectionEnabled: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    Include AI Time Detection
                    <span className="block text-xs text-gray-500">Useful for booking calls and scheduling</span>
                  </span>
                </label>

                {/* Timezone Selection - Conditional Render */}
                {formData.timeDetectionEnabled && (
                  <div className="ml-7 mt-3">
                    <TimeZoneSelect
                      value={formData.timezone}
                      onChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                    />
                  </div>
                )}
              </div>

              {/* AI Moderation */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.moderationEnabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, moderationEnabled: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    Include AI Moderation
                    <span className="block text-xs text-gray-500">Useful for moderating & terminating conversations</span>
                  </span>
                </label>

                {/* Moderation Level Selection - Conditional Render */}
                {formData.moderationEnabled && (
                  <ModerationLevelSelect
                    value={formData.moderationLevel}
                    onChange={(value) => setFormData(prev => ({ ...prev, moderationLevel: value }))}
                  />
                )}
              </div>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading || isSubmitting} className="w-full">
            Import to GHL
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}