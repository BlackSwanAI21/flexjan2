import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Copy, Check } from 'lucide-react';
import { createShareUrl } from '../../services/shareUrls';

interface ShareAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
}

export function ShareAgentModal({ isOpen, onClose, agentId }: ShareAgentModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateShareUrl();
    }
  }, [isOpen, agentId]);

  const generateShareUrl = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { url_token } = await createShareUrl(agentId);
      setShareUrl(`${window.location.origin}/public-chat/${url_token}`);
    } catch (err) {
      setError('Failed to generate share link');
      console.error('Error generating share URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
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
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Share this link to let others chat with your AI agent:
        </p>

        {error ? (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900 flex-1 break-all">
              {shareUrl}
            </span>
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              title="Copy link"
            >
              {isCopied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        )}

        <p className="text-sm text-gray-500">
          Anyone with this link can chat with your AI agent using your OpenAI API key.
        </p>
      </div>
    </Modal>
  );
}