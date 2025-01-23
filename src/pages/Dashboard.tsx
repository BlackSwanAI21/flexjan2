import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Plus, Bot, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApiKeyCheck } from '../hooks/useApiKeyCheck';
import { useRecentActivity } from '../hooks/useRecentActivity';
import { ActivityItem } from '../components/dashboard/ActivityItem';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';

export function Dashboard() {
  const navigate = useNavigate();
  const { hasApiKey, isLoading, redirectToApiKeySetup } = useApiKeyCheck();
  const { activities, isLoading: isLoadingActivities, markAsRead } = useRecentActivity();

  const handleCreateAgent = () => {
    if (!isLoading && !hasApiKey) {
      redirectToApiKeySetup();
    } else {
      navigate('/create-agent');
    }
  };

  const handleActivityClick = (agentId: string, activityId: string) => {
    markAsRead(activityId);
    navigate(`/chat/${agentId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Create and manage your AI agents</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            icon={Plus}
            title="Create New Agent"
            description="Design a custom AI agent for your needs"
            onClick={handleCreateAgent}
          />
          <QuickActionCard
            icon={Bot}
            title="View Agents"
            description="Manage your existing AI agents"
            onClick={() => navigate('/agents')}
          />
          <QuickActionCard
            icon={ArrowUpRight}
            title="Import to GoHighLevel"
            description="Export your AI agents to GoHighLevel"
            onClick={() => navigate('/import-ghl')}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoadingActivities ? (
              <div className="p-6 text-center text-gray-500">Loading activities...</div>
            ) : activities.length > 0 ? (
              activities.map(activity => (
                <ActivityItem
                  key={activity.id}
                  agentName={activity.agent_name}
                  timestamp={new Date(activity.created_at).toLocaleString()}
                  onClick={() => handleActivityClick(activity.agent_id, activity.id)}
                />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No recent activity to show
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}