import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Modal } from '../Modal';
import { Toggle } from './Toggle';
import { WelcomePagePreview } from './WelcomePagePreview';
import { createShareUrl } from '../../services/shareUrls';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
}

export function ShareLinkModal({ isOpen, onClose, agentId, agentName }: ShareLinkModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [showWelcomePage, setShowWelcomePage] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateShareUrl = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { url_token } = await createShareUrl(agentId);
      const baseUrl = window.location.origin;
      const path = showWelcomePage ? `/welcome/${url_token}` : `/shared/${url_token}`;
      setShareUrl(`${baseUrl}${path}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      generateShareUrl();
    }
  }, [isOpen, showWelcomePage]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share AI Agent"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Welcome Page
            </label>
            <Toggle
              checked={showWelcomePage}
              onChange={setShowWelcomePage}
            />
          </div>
          
          {showWelcomePage && (
            <WelcomePagePreview agentName={agentName} />
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Share Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-gray-900"
            />
            <button
              onClick={handleCopy}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title={isCopied ? 'Copied!' : 'Copy link'}
            >
              {isCopied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
          </div>
        )}
      </div>
    </Modal>
  );
}