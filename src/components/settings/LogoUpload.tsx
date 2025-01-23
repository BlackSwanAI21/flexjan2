import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '../Button';
import { supabase } from '../../lib/supabase';

interface LogoUploadProps {
  currentLogo?: string;
  onUpload: (url: string) => Promise<void>;
}

export function LogoUpload({ currentLogo, onUpload }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload to storage
      const filename = `${user.id}/${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filename);

      await onUpload(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Logo
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-600 transition-colors">
            <div className="space-y-1 text-center">
              {currentLogo ? (
                <div className="relative inline-block">
                  <img
                    src={currentLogo}
                    alt="Company logo"
                    className="max-h-20 rounded"
                  />
                  <button
                    onClick={() => onUpload('')}
                    className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={isUploading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {isUploading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
        </div>
      )}
    </div>
  );
}