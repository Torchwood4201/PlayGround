import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Cpu, Zap } from 'lucide-react';
import { UnifiedModelHub } from '../core/UnifiedModelHub';

interface ModelLoadingInterfaceProps {
  modelHub: UnifiedModelHub;
  onInitializationComplete: () => void;
}

export const ModelLoadingInterface: React.FC<ModelLoadingInterfaceProps> = ({ 
  modelHub, 
  onInitializationComplete 
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (modelHub.isReady()) {
      setIsComplete(true);
      setProgress(100);
    }
  }, [modelHub]);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setProgress(0);
    
    try {
      // Start initialization
      const initPromise = modelHub.initialize();
      
      // Monitor progress
      const progressInterval = setInterval(() => {
        const currentProgress = modelHub.getLoadingProgress();
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, 100);
      
      await initPromise;
      
      setIsComplete(true);
      setIsInitializing(false);
      onInitializationComplete();
      
    } catch (error) {
      console.error('Model initialization failed:', error);
      setIsInitializing(false);
    }
  };

  const models = [
    { name: 'Language Reasoning Core', status: progress > 16 ? 'loaded' : 'pending', size: 'built-in' },
    { name: 'Visual Perception Core', status: progress > 33 ? 'loaded' : 'pending', size: 'built-in' },
    { name: 'Creative Synthesis Core', status: progress > 50 ? 'loaded' : 'pending', size: 'built-in' },
    { name: 'Auditory Processing Core', status: progress > 66 ? 'loaded' : 'pending', size: 'built-in' },
    { name: 'Neural Optimization', status: progress > 83 ? 'loaded' : 'pending', size: 'built-in' },
    { name: 'Ethical Constraints', status: progress > 99 ? 'loaded' : 'pending', size: 'built-in' }
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-cyan-500/30">
      <div className="flex items-center mb-6">
        <Cpu className="w-8 h-8 text-cyan-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Neural Model Hub</h2>
        <div className="ml-auto">
          {isComplete ? (
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">All Systems Online</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">Initialization Required</span>
            </div>
          )}
        </div>
      </div>

      {!isComplete && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-300">
              Bring the internal cognitive cores online to enable reasoning,
              perception, synthesis, and audio processing.
            </p>
            <button
              onClick={handleInitialize}
              disabled={isInitializing}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
            >
              <Zap className={`w-4 h-4 mr-2 ${isInitializing ? 'animate-spin' : ''}`} />
              {isInitializing ? 'Initializing...' : 'Initialize Core'}
            </button>
          </div>

          {isInitializing && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-300">Overall Progress</span>
                <span className="text-cyan-400">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-cyan-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Model Status List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-4">Cognitive Cores</h3>
        {models.map((model, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                model.status === 'loaded' ? 'bg-green-400' : 'bg-gray-500'
              }`} />
              <div>
                <span className="text-white font-medium">{model.name}</span>
                <div className="text-xs text-gray-400">{model.size}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              {model.status === 'loaded' ? (
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-xs">Loaded</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-500 rounded-full mr-1" />
                  <span className="text-xs">Pending</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isComplete && (
        <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
          <div className="flex items-center mb-2">
            <Zap className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-300 font-semibold">Neural Hub Active</span>
          </div>
          <p className="text-gray-300 text-sm">
            All cognitive cores are online and calibrated. The positronic brain
            is now capable of advanced multi-modal processing including natural language reasoning,
            visual perception, creative synthesis, and audio analysis.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div className="text-center">
              <div className="text-blue-400 font-semibold">Language</div>
              <div className="text-gray-400">Reasoning</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-semibold">Vision</div>
              <div className="text-gray-400">Perception</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-semibold">Synthesis</div>
              <div className="text-gray-400">Creative</div>
            </div>
            <div className="text-center">
              <div className="text-orange-400 font-semibold">Audio</div>
              <div className="text-gray-400">Processing</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};