import React from 'react';
import { useAgents } from '../../hooks/useAgents';

interface AgentSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function AgentSelect({ value, onChange }: AgentSelectProps) {
  const { agents, isLoading } = useAgents();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select AI Agent
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        disabled={isLoading}
      >
        <option value="">Select an agent...</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
    </div>
  );
}