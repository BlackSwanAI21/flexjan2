import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface WebhookRequest {
  timestamp: string;
  body: any;
}

export const WebhookManager: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<WebhookRequest | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const generateWebhook = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Generate a unique webhook URL
      const { data, error: webhookError } = await supabase
        .from('webhooks')
        .insert({
          user_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (webhookError) throw webhookError;
      setWebhookUrl(data.webhook_url);
      setError(null);
    } catch (err) {
      setError('Failed to generate webhook');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyWebhook = async () => {
    if (!webhookUrl) return;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopyStatus('copied');
      setIsListening(true);
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy webhook URL:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Webhook Testing</h2>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {!webhookUrl ? (
          <button
            onClick={generateWebhook}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Generate Webhook
          </button>
        ) : (
          <div className="space-y-4">
            <div className="border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Your Webhook URL:</p>
                <button
                  onClick={copyWebhook}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded flex items-center gap-2"
                >
                  {copyStatus === 'copied' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <code className="block bg-gray-100 p-3 rounded break-all">
                {webhookUrl}
              </code>
            </div>

            {isListening && (
              <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full absolute top-0 animate-ping"></div>
                  </div>
                  <p className="font-medium">Listening for webhook requests...</p>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Your webhook is active and ready to receive POST requests. Send a request to test it.
                </p>
              </div>
            )}

            {lastRequest && (
              <div className="border p-4 rounded-lg">
                <p className="font-medium mb-2">Last Request:</p>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(lastRequest.timestamp).toLocaleString()}
                </p>
                <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(lastRequest.body, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 