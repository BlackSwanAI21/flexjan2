import React from 'react';
import { Input } from '../Input';

interface APIKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

export function APIKeyInput({ value, onChange, isLoading }: APIKeyInputProps) {
  return (
    <Input
      label="API Key"
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your GHL API key"
      disabled={isLoading}
    />
  );
}