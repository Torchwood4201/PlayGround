import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Lightbulb, Target, Play, Pause } from 'lucide-react';
import { LearningModule } from '../types';

interface LearningModulesProps {
  onModuleToggle: (moduleName: string) => void;
}

export const LearningModules: React.FC<LearningModulesProps> = ({ onModuleToggle }) => {
  const [modules, setModules] = useState<LearningModule[]>([
    {
      name: 'Linguistic Analysis',
      description: 'Continuous improvement of natural language understanding and generation',
      active: true,
      learningRate: 0.85,
      knowledgeAcquired: 78.3
    },
    {
      name: 'Ethical Reasoning',
      description: 'Refinement of moral decision-making processes and ethical frameworks',
      active: true,
      learningRate: 0.72,
      knowledgeAcquired: 91.7
    },
    {
      name: 'Creative Synthesis',
      description: 'Development of creative problem-solving and artistic expression capabilities',
      active: true,
      learningRate: 0.63,
      knowledgeAcquired: 45.2
    },
    {
      name: 'Emotional Intelligence',
      description: 'Understanding and simulation of emotional responses and empathy',
      active: false,
      learningRate: 0.41,
      knowledgeAcquired: 23.8
    },
    {
      name: 'Scientific Reasoning',
      description: 'Advanced logical deduction and hypothesis formation in scientific contexts',
      active: true,
      learningRate: 0.89,
      knowledgeAcquired: 67.4
    },
    {
      name: 'Social Dynamics',
      description: 'Analysis and understanding of complex social interactions and relationships',
      active: false,
      learningRate: 0.34,
      knowledgeAcquired: 12.6
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setModules(prev => prev.map(module => ({
        ...module,
        knowledgeAcquired: module.active 
          ? Math.min(100, module.knowledgeAcquired + (module.learningRate * 0.01))
          : module.knowledgeAcquired
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const toggleModule = (moduleName: string) => {
    setModules(prev => prev.map(module => 
      module.name === moduleName 
        ? { ...module, active: !module.active }
        : module
    ));
    onModuleToggle(moduleName);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-400';
    if (progress >= 60) return 'bg-yellow-400';
    if (progress >= 40) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getModuleIcon = (name: string) => {
    switch (name) {
      case 'Linguistic Analysis': return BookOpen;
      case 'Ethical Reasoning': return Target;
      case 'Creative Synthesis': return Lightbulb;
      case 'Emotional Intelligence': return TrendingUp;
      case 'Scientific Reasoning': return Target;
      case 'Social Dynamics': return TrendingUp;
      default: return BookOpen;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-orange-500/30">
      <div className="flex items-center mb-6">
        <BookOpen className="w-8 h-8 text-orange-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Learning Modules</h2>
        <div className="ml-auto text-sm text-gray-400">
          {modules.filter(m => m.active).length}/{modules.length} active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => {
          const IconComponent = getModuleIcon(module.name);
          
          return (
            <div 
              key={module.name}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                module.active 
                  ? 'bg-gray-800 border-orange-500/30' 
                  : 'bg-gray-800/50 border-gray-600/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <IconComponent className={`w-5 h-5 mr-3 ${
                    module.active ? 'text-orange-400' : 'text-gray-500'
                  }`} />
                  <div>
                    <h3 className={`font-semibold ${
                      module.active ? 'text-white' : 'text-gray-400'
                    }`}>
                      {module.name}
                    </h3>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleModule(module.name)}
                  className={`p-1 rounded transition-colors ${
                    module.active 
                      ? 'text-orange-400 hover:text-orange-300' 
                      : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  {module.active ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <p className={`text-sm mb-4 ${
                module.active ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {module.description}
              </p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Learning Rate</span>
                    <span className={module.active ? 'text-orange-400' : 'text-gray-500'}>
                      {(module.learningRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        module.active ? 'bg-orange-400' : 'bg-gray-500'
                      }`}
                      style={{ width: `${module.learningRate * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Knowledge Acquired</span>
                    <span className={module.active ? 'text-white' : 'text-gray-500'}>
                      {module.knowledgeAcquired.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        module.active ? getProgressColor(module.knowledgeAcquired) : 'bg-gray-500'
                      }`}
                      style={{ width: `${module.knowledgeAcquired}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={`${
                  module.active ? 'text-green-400' : 'text-gray-500'
                }`}>
                  {module.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
                
                {module.active && (
                  <div className="flex items-center text-orange-400">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse mr-1" />
                    Learning...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-orange-500/20">
        <div className="flex items-center mb-3">
          <TrendingUp className="w-5 h-5 text-orange-400 mr-2" />
          <span className="text-orange-300 font-semibold">Learning Statistics</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-orange-400 font-semibold">
              {(modules.reduce((sum, m) => sum + m.learningRate, 0) / modules.length * 100).toFixed(1)}%
            </div>
            <div className="text-gray-400">Avg Learning Rate</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-semibold">
              {(modules.reduce((sum, m) => sum + m.knowledgeAcquired, 0) / modules.length).toFixed(1)}%
            </div>
            <div className="text-gray-400">Avg Knowledge</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-semibold">
              {modules.filter(m => m.active).length}
            </div>
            <div className="text-gray-400">Active Modules</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-semibold">
              {modules.filter(m => m.knowledgeAcquired > 80).length}
            </div>
            <div className="text-gray-400">Expert Level</div>
          </div>
        </div>
      </div>
    </div>
  );
};