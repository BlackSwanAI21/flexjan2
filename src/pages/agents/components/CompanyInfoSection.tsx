import React from 'react';
import { Input } from '../../../components/Input';
import { ModelSelect } from '../../../components/forms/ModelSelect';
import type { BasicTemplateFormData } from '../types';

interface CompanyInfoSectionProps {
  formData: BasicTemplateFormData;
}

export function CompanyInfoSection({ formData }: CompanyInfoSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Company Name"
          value={formData.companyName}
          onChange={(e) => formData.setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          placeholder="Enter your company name"
          required
        />
        
        <Input
          label="Country"
          value={formData.country}
          onChange={(e) => formData.setFormData(prev => ({ ...prev, country: e.target.value }))}
          placeholder="Enter your country"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Industry"
          value={formData.industry}
          onChange={(e) => formData.setFormData(prev => ({ ...prev, industry: e.target.value }))}
          placeholder="e.g., Solar Energy"
          required
        />
        
        <Input
          label="Service"
          value={formData.service}
          onChange={(e) => formData.setFormData(prev => ({ ...prev, service: e.target.value }))}
          placeholder="e.g., Solar Panel Installation"
          required
        />
      </div>

      <ModelSelect
        value={formData.model}
        onChange={(value) => formData.setFormData(prev => ({ ...prev, model: value }))}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => formData.setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Enter your phone number"
          required
        />
        
        <Input
          label="Website"
          value={formData.website}
          onChange={(e) => formData.setFormData(prev => ({ ...prev, website: e.target.value }))}
          placeholder="Enter your website URL"
          required
        />
      </div>

      <Input
        label="Opening Times"
        value={formData.openingTimes}
        onChange={(e) => formData.setFormData(prev => ({ ...prev, openingTimes: e.target.value }))}
        placeholder="e.g., Monday-Friday 9am-5pm"
        required
      />
    </div>
  );
}