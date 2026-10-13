import React, { useState, useEffect } from 'react';
import { Brain, Activity, Zap, Heart, Eye } from 'lucide-react';
import { NeuralState } from '../types';

interface NeuralInterfaceProps {
  neuralState: NeuralState;
}

export const NeuralInterface: React.FC<NeuralInterfaceProps> = ({ neuralState }) => {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value > 0.8) return 'text-green-400';
    if (value > 0.6) return 'text-yellow-400';
    if (value > 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBarColor = (value: number) => {
    if (value > 0.8) return 'bg-green-400';
    if (value > 0.6) return 'bg-yellow-400';
    if (value > 0.4) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-blue-500/30">
      <div className="flex items-center mb-6">
        <Brain className={`w-8 h-8 text-blue-400 mr-3 ${pulseAnimation ? 'animate-pulse' : ''}`} />
        <h2 className="text-2xl font-bold text-white">Neural Interface</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Systems */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-300 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Core Systems
          </h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Neural Activation</span>
                <span className={getStatusColor(neuralState.activationLevel)}>
                  {(neuralState.activationLevel * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(neuralState.activationLevel)}`}
                  style={{ width: `${neuralState.activationLevel * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Processing Load</span>
                <span className={getStatusColor(1 - neuralState.processingLoad)}>
                  {(neuralState.processingLoad * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(1 - neuralState.processingLoad)}`}
                  style={{ width: `${neuralState.processingLoad * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Memory Utilization</span>
                <span className={getStatusColor(1 - neuralState.memoryUtilization)}>
                  {(neuralState.memoryUtilization * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(1 - neuralState.memoryUtilization)}`}
                  style={{ width: `${neuralState.memoryUtilization * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emotional State */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-300 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Emotional Matrix
          </h3>
          
          <div className="space-y-3">
            {Object.entries(neuralState.emotionalState).map(([emotion, value]) => (
              <div key={emotion}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 capitalize">{emotion}</span>
                  <span className={getStatusColor(value)}>
                    {(value * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getBarColor(value)}`}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Thought */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-blue-500/20">
        <div className="flex items-center mb-2">
          <Eye className="w-5 h-5 text-blue-400 mr-2" />
          <span className="text-blue-300 font-semibold">Current Neural Activity</span>
        </div>
        <p className="text-gray-300 italic">{neuralState.currentThought}</p>
      </div>

      {/* Ethical Constraints */}
      <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-green-500/20">
        <div className="flex items-center mb-2">
          <Zap className="w-5 h-5 text-green-400 mr-2" />
          <span className="text-green-300 font-semibold">Active Ethical Constraints</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {neuralState.ethicalConstraints.map((constraint, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-green-900/30 text-green-300 rounded text-sm border border-green-500/30"
            >
              {constraint.replace('_', ' ').toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};