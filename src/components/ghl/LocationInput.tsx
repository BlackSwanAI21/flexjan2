import React from 'react';
import { Input } from '../Input';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  return (
    <Input
      label="Location ID"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g., lSax3DSxFxETSEPGma5u1"
    />
  );
}