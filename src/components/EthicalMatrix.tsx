import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { EthicalPrinciple } from '../types';

interface EthicalMatrixProps {
  principles: EthicalPrinciple[];
  onTogglePrinciple: (id: string) => void;
}

export const EthicalMatrix: React.FC<EthicalMatrixProps> = ({ principles, onTogglePrinciple }) => {
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-400 border-red-500/30';
      case 2: return 'text-orange-400 border-orange-500/30';
      case 3: return 'text-yellow-400 border-yellow-500/30';
      case 4: return 'text-green-400 border-green-500/30';
      default: return 'text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'CRITICAL';
      case 2: return 'HIGH';
      case 3: return 'MEDIUM';
      case 4: return 'LOW';
      default: return 'UNDEFINED';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-green-500/30">
      <div className="flex items-center mb-6">
        <Shield className="w-8 h-8 text-green-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Ethical Matrix</h2>
        <div className="ml-auto flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
          <span className="text-green-400 text-sm">Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {principles.map((principle) => (
          <div 
            key={principle.id}
            className={`p-4 rounded-lg border transition-all duration-300 ${
              principle.active 
                ? 'bg-gray-800 border-green-500/30' 
                : 'bg-gray-800/50 border-gray-600/30'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <button
                  onClick={() => onTogglePrinciple(principle.id)}
                  className={`mr-3 transition-colors ${
                    principle.active ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  {principle.active ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <h3 className={`font-semibold ${
                    principle.active ? 'text-white' : 'text-gray-400'
                  }`}>
                    {principle.name}
                  </h3>
                  <div className={`text-xs px-2 py-1 rounded border inline-block mt-1 ${getPriorityColor(principle.priority)}`}>
                    PRIORITY {principle.priority} - {getPriorityLabel(principle.priority)}
                  </div>
                </div>
              </div>
              <Settings className="w-4 h-4 text-gray-500" />
            </div>
            
            <p className={`text-sm leading-relaxed ${
              principle.active ? 'text-gray-300' : 'text-gray-500'
            }`}>
              {principle.description}
            </p>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className={`text-xs ${
                  principle.active ? 'text-green-400' : 'text-gray-500'
                }`}>
                  Status: {principle.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              
              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    principle.active ? 'bg-green-400' : 'bg-gray-500'
                  }`}
                  style={{ width: principle.active ? '100%' : '0%' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-blue-500/20">
        <div className="flex items-center mb-2">
          <Shield className="w-5 h-5 text-blue-400 mr-2" />
          <span className="text-blue-300 font-semibold">Ethical Compliance Status</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Active Principles:</span>
            <span className="text-green-400 ml-2 font-semibold">
              {principles.filter(p => p.active).length}/{principles.length}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Compliance Level:</span>
            <span className="text-green-400 ml-2 font-semibold">99.7%</span>
          </div>
        </div>
      </div>
    </div>
  );
};