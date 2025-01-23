import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AgentSelect } from './AgentSelect';
import { APIKeyInput } from './APIKeyInput';
import { LocationInput } from './LocationInput';
import { OpeningMessageInput } from './OpeningMessageInput';
import { TimeZoneSelect } from './TimeZoneSelect';

export default function ImportAIAgent() {
  // Form state
  const [selectedAgent, setSelectedAgent] = useState('');
  const [locationId, setLocationId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [openingMessage, setOpeningMessage] = useState('');
  const [timeDetectionEnabled, setTimeDetectionEnabled] = useState(false);
  const [moderationEnabled, setModerationEnabled] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement import logic
      console.log('Importing with:', {
        selectedAgent,
        locationId,
        apiKey,
        openingMessage,
        timeDetectionEnabled,
        moderationEnabled,
        selectedTimezone
      });
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Import AI Agent to GoHighLevel</h1>
          <p className="text-gray-600">Connect your AI agent with your GoHighLevel account</p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
          {/* Agent Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select AI Agent</label>
            <AgentSelect 
              value={selectedAgent}
              onChange={setSelectedAgent}
            />
          </div>

          {/* Location ID */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Location ID</label>
            <LocationInput 
              value={locationId}
              onChange={setLocationId}
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <APIKeyInput 
              value={apiKey}
              onChange={setApiKey}
              isLoading={isLoading}
            />
          </div>

          {/* Opening Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Opening Message</label>
            <OpeningMessageInput 
              value={openingMessage}
              onChange={setOpeningMessage}
            />
          </div>

          {/* AI Features Section */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced AI Features</h3>
            
            {/* Time Detection */}
            <div className="space-y-4 mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timeDetectionEnabled}
                  onChange={(e) => setTimeDetectionEnabled(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Include AI Time Detection
                  <span className="block text-xs text-gray-500">Useful for booking calls and scheduling</span>
                </span>
              </label>

              {/* Timezone Selection - Conditional Render */}
              {timeDetectionEnabled && (
                <div className="ml-7 mt-3">
                  <TimeZoneSelect
                    value={selectedTimezone}
                    onChange={setSelectedTimezone}
                  />
                </div>
              )}
            </div>

            {/* AI Moderation */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moderationEnabled}
                  onChange={(e) => setModerationEnabled(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Include AI Moderation
                  <span className="block text-xs text-gray-500">Useful for moderating & terminating conversations</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Import Button */}
        <button
          type="button"
          onClick={handleImport}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Importing...' : 'Import to GHL'}
        </button>
      </div>
    </div>
  );
} 
