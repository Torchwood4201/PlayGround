import React from 'react';

export const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
  accent?: string;
}> = ({ title, children, accent = 'border-gray-700' }) => (
  <div className={`bg-gray-800 rounded-lg p-4 border ${accent}`}>
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    {children}
  </div>
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const color =
    status === 'active'
      ? 'bg-green-900 text-green-300'
      : status === 'completed'
        ? 'bg-blue-900 text-blue-300'
        : status === 'failed'
          ? 'bg-red-900 text-red-300'
          : 'bg-gray-600 text-gray-300';
  return (
    <span className={`text-xs px-2 py-1 rounded ${color}`}>{status.toUpperCase()}</span>
  );
};

export function healthColor(health: number): string {
  if (health > 0.8) return 'text-green-400';
  if (health > 0.6) return 'text-yellow-400';
  if (health > 0.4) return 'text-orange-400';
  return 'text-red-400';
}
