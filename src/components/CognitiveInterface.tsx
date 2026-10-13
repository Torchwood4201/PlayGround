import React, { useState, useEffect } from 'react';
import { 
  Brain, Play, Pause, RotateCcw, Target, Zap, 
  Activity, Shield, Database, TrendingUp, AlertCircle,
  CheckCircle, Clock, Cpu
} from 'lucide-react';
import { CognitiveOS } from '../core/controller';
import type { Task } from '../core/workingMemory';

interface CognitiveInterfaceProps {
  cognitiveOS: CognitiveOS;
}

export const CognitiveInterface: React.FC<CognitiveInterfaceProps> = ({ cognitiveOS }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [systemStats, setSystemStats] = useState(cognitiveOS.getSystemStats());
  const [currentGoal, setCurrentGoal] = useState(cognitiveOS.getCurrentGoal());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [introspection, setIntrospection] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [cycleResults, setCycleResults] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      setSystemStats(cognitiveOS.getSystemStats());
      setTasks(cognitiveOS.getTasks());
      setHistory(cognitiveOS.getHistory().slice(-10)); // Last 10 entries
      
      try {
        const intro = await cognitiveOS.introspect();
        setIntrospection(intro);
      } catch (error) {
        console.error('Introspection error:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cognitiveOS]);

  const handleStart = async () => {
    setIsRunning(true);
    setCycleResults([]);
    
    // Run continuous cycles
    const runContinuous = async () => {
      while (isRunning) {
        try {
          const result = await cognitiveOS.runCycle();
          setCycleResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
          
          // Small delay between cycles
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error('Cycle error:', error);
          break;
        }
      }
    };
    
    runContinuous();
  };

  const handleStop = () => {
    setIsRunning(false);
    cognitiveOS.stop();
  };

  const handleSetGoal = () => {
    if (newGoal.trim()) {
      cognitiveOS.setGoal(newGoal);
      setCurrentGoal(newGoal);
      setNewGoal('');
    }
  };

  const handleRunSingleCycle = async () => {
    try {
      const result = await cognitiveOS.runCycle();
      setCycleResults(prev => [result, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Single cycle error:', error);
    }
  };

  const getHealthColor = (health: number) => {
    if (health > 0.8) return 'text-green-400';
    if (health > 0.6) return 'text-yellow-400';
    if (health > 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthBarColor = (health: number) => {
    if (health > 0.8) return 'bg-green-400';
    if (health > 0.6) return 'bg-yellow-400';
    if (health > 0.4) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-indigo-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="w-8 h-8 text-indigo-400 mr-3" />
          <h2 className="text-2xl font-bold text-white">Cognitive Operating System</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${isRunning ? 'text-green-400' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm">{isRunning ? 'ACTIVE' : 'IDLE'}</span>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-2">
            <Activity className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-300 font-semibold">System Health</span>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {(systemStats.health * 100).toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getHealthBarColor(systemStats.health)}`}
              style={{ width: `${systemStats.health * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 font-semibold">Active Tasks</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {systemStats.activeTasks}
          </div>
          <div className="text-sm text-gray-400">Pending execution</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-2">
            <Cpu className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-purple-300 font-semibold">Cycles</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {systemStats.cycleCount}
          </div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-2">
            <Shield className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-300 font-semibold">Ethics</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {(systemStats.ethicalCompliance * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Compliance</div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Control</h3>
          <div className="flex space-x-2 mb-4">
            <button
              onClick={isRunning ? handleStop : handleStart}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </button>
            
            <button
              onClick={handleRunSingleCycle}
              disabled={isRunning}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4 mr-2" />
              Single Cycle
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Set New Goal
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter new cognitive goal..."
                className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSetGoal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Current Goal</h3>
          <p className="text-gray-300 text-sm mb-4 italic">
            "{currentGoal}"
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Last Action:</span>
              <span className={systemStats.lastActionSuccess ? 'text-green-400' : 'text-red-400'}>
                {systemStats.lastActionSuccess ? 'SUCCESS' : 'FAILED'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Memory Usage:</span>
              <span className="text-blue-400">{(systemStats.memoryUsage * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks and Recent Cycles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Active Tasks
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No active tasks</p>
            ) : (
              tasks.slice(0, 5).map((task, index) => (
                <div key={task.id} className="p-3 bg-gray-700 rounded border border-gray-600">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.status === 'active' ? 'bg-green-900 text-green-300' :
                      task.status === 'completed' ? 'bg-blue-900 text-blue-300' :
                      task.status === 'failed' ? 'bg-red-900 text-red-300' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {task.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      Priority: {task.priority}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{task.goal}</p>
                  {task.context && (
                    <p className="text-gray-500 text-xs mt-1">{task.context}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Recent Cycles
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cycleResults.length === 0 ? (
              <p className="text-gray-500 text-sm">No cycles completed yet</p>
            ) : (
              cycleResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-700 rounded border border-gray-600">
                  <div className="flex items-center justify-between mb-1">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-xs text-gray-400">
                      {result.details?.cycleTime}ms
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{result.summary}</p>
                  {result.details?.action && (
                    <p className="text-gray-500 text-xs mt-1">
                      Action: {result.details.action}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Introspection */}
      <div className="bg-gray-800 rounded-lg p-4 border border-indigo-500/20">
        <div className="flex items-center mb-3">
          <Brain className="w-5 h-5 text-indigo-400 mr-2" />
          <span className="text-indigo-300 font-semibold">System Introspection</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed italic">
          {introspection || 'Initializing cognitive self-analysis...'}
        </p>
      </div>

      {/* Recent History */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Recent Activity History
        </h3>
        <div className="space-y-1 max-h-32 overflow-y-auto text-xs font-mono">
          {history.length === 0 ? (
            <p className="text-gray-500">No activity recorded yet</p>
          ) : (
            history.slice().reverse().map((entry, index) => (
              <div key={index} className="text-gray-400 py-1 border-b border-gray-700 last:border-b-0">
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};