import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Calendar, Cog } from 'lucide-react';
import { getPublicAgent } from '../services/agents/public';
import { useLogo } from '../hooks/useLogo';
import { Logo } from '../components/Logo';
import type { Agent } from '../types/agent';

export function WelcomePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logo, isLoading: isLogoLoading } = useLogo();

  useEffect(() => {
    if (token) {
      loadAgent();
    }
  }, [token]);

  const loadAgent = async () => {
    try {
      const data = await getPublicAgent(token!);
      setAgent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = () => {
    if (token) {
      navigate(`/shared/${token}`, { replace: true });
    }
  };

  if (isLoading || isLogoLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Logo logo={logo} className="h-12 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Agent not found'}
          </h1>
          <p className="text-gray-600">
            This agent may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Logo Section */}
      <div className="w-full py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center">
            <Logo logo={logo} className="h-12" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:text-5xl">
            Meet Your AI Assistant: {agent.name}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of AI Sales Agents with our intelligent assistant
          </p>
        </div>

        {/* CTA Section - Moved above features */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to transform your sales process?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start a conversation with our AI sales assistant now and experience the future of automated lead engagement and qualification.
          </p>
          <button
            onClick={handleStartChat}
            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
          >
            Start Engaging Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Instant Response
              </h3>
            </div>
            <p className="text-gray-600">
              24/7 instant engagement with leads, ensuring no opportunity is missed and every inquiry receives immediate attention.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Smart Grading
              </h3>
            </div>
            <p className="text-gray-600">
              Automated lead qualification that intelligently assesses and prioritizes prospects based on their potential and readiness.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Scheduling
              </h3>
            </div>
            <p className="text-gray-600">
              Seamless automated meeting booking that connects qualified leads directly with your sales team at the perfect moment.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Cog className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Conversion
              </h3>
            </div>
            <p className="text-gray-600">
              Goal-driven interactions designed to move prospects through your sales pipeline efficiently and effectively.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}