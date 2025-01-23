import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Input } from '../../Input';
import { Button } from '../../Button';

interface WebsiteFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function WebsiteForm({ onSubmit, isLoading, error }: WebsiteFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    // Clean up URL
    let cleanUrl = url.trim().toLowerCase();
    
    // Remove protocol if present
    cleanUrl = cleanUrl.replace(/^(https?:\/\/)?(www\.)?/, '');
    
    // Remove trailing slash
    cleanUrl = cleanUrl.replace(/\/$/, '');
    
    await onSubmit(cleanUrl);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Website URL</h2>
          <p className="text-sm text-gray-500">Enter your client's website URL</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Website URL"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          required
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button type="submit" isLoading={isLoading}>
          Analyze Website
        </Button>
      </form>
    </div>
  );
}