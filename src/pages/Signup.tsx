import React, { useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { signUp } from '../services/auth';

interface SignupProps {
  onLoginClick: () => void;
  onSignupSuccess: () => void;
}

export function Signup({ onLoginClick, onSignupSuccess }: SignupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_name: formData.companyName
      });
      onSignupSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start creating AI agents for your clients"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            required
          />
          <Input
            label="Last name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            required
          />
        </div>
        
        <Input
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />
        
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a strong password"
          required
        />
        
        <Input
          label="Company name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Your company name"
          required
        />

        <Button type="submit" isLoading={isLoading}>
          Create account
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onLoginClick}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Sign in
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}