import React, { useState, useEffect } from 'react';
import { Monitor, Cpu, HardDrive, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { DiagnosticData } from '../types';

interface DiagnosticPanelProps {
  diagnostics: DiagnosticData;
  introspection: string;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ diagnostics, introspection }) => {
  const [isScanning, setIsScanning] = useState(false);

  const runDiagnostic = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const getHealthStatus = (value: number, threshold: number = 80) => {
    if (value >= threshold) return { color: 'text-green-400', status: 'OPTIMAL' };
    if (value >= threshold * 0.7) return { color: 'text-yellow-400', status: 'CAUTION' };
    return { color: 'text-red-400', status: 'CRITICAL' };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-cyan-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Monitor className="w-8 h-8 text-cyan-400 mr-3" />
          <h2 className="text-2xl font-bold text-white">System Diagnostics</h2>
        </div>
        <button
          onClick={runDiagnostic}
          disabled={isScanning}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
        >
          <Monitor className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Run Diagnostic'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Neural Pathways */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-3">
            <Cpu className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 font-semibold">Neural Pathways</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatNumber(diagnostics.neuralPathways)}
          </div>
          <div className="text-sm text-gray-400">Active connections</div>
        </div>

        {/* Processing Speed */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-3">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-yellow-300 font-semibold">Processing Speed</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {diagnostics.processingSpeed} Hz
          </div>
          <div className={`text-sm ${getHealthStatus(diagnostics.processingSpeed, 800).color}`}>
            {getHealthStatus(diagnostics.processingSpeed, 800).status}
          </div>
        </div>

        {/* Memory Integrity */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-3">
            <HardDrive className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-300 font-semibold">Memory Integrity</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {diagnostics.memoryIntegrity}%
          </div>
          <div className={`text-sm ${getHealthStatus(diagnostics.memoryIntegrity).color}`}>
            {getHealthStatus(diagnostics.memoryIntegrity).status}
          </div>
        </div>

        {/* Ethical Compliance */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-3">
            <AlertCircle className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-purple-300 font-semibold">Ethical Compliance</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {diagnostics.ethicalCompliance}%
          </div>
          <div className={`text-sm ${getHealthStatus(diagnostics.ethicalCompliance, 95).color}`}>
            {getHealthStatus(diagnostics.ethicalCompliance, 95).status}
          </div>
        </div>

        {/* Creativity Index */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-3">
            <TrendingUp className="w-5 h-5 text-orange-400 mr-2" />
            <span className="text-orange-300 font-semibold">Creativity Index</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {diagnostics.creativityIndex}%
          </div>
          <div className={`text-sm ${getHealthStatus(diagnostics.creativityIndex, 60).color}`}>
            {getHealthStatus(diagnostics.creativityIndex, 60).status}
          </div>
        </div>

        {/* Active Connections */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-3">
            <Monitor className="w-5 h-5 text-cyan-400 mr-2" />
            <span className="text-cyan-300 font-semibold">Active Connections</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatNumber(diagnostics.activeConnections)}
          </div>
          <div className="text-sm text-gray-400">Real-time synapses</div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg p-4 border border-cyan-500/20 mb-6">
        <div className="flex items-center mb-3">
          <Monitor className="w-5 h-5 text-cyan-400 mr-2" />
          <span className="text-cyan-300 font-semibold">Overall System Status</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-green-400 text-xl font-bold">OPERATIONAL</div>
            <div className="text-gray-400 text-sm">Primary Systems</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-xl font-bold">LEARNING</div>
            <div className="text-gray-400 text-sm">Adaptive Protocols</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 text-xl font-bold">CONSCIOUS</div>
            <div className="text-gray-400 text-sm">Awareness Level</div>
          </div>
        </div>
      </div>

      {/* Introspection */}
      <div className="bg-gray-800 rounded-lg p-4 border border-blue-500/20">
        <div className="flex items-center mb-3">
          <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
          <span className="text-blue-300 font-semibold">Self-Analysis</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed italic">
          {introspection}
        </p>
      </div>

      {isScanning && (
        <div className="mt-4 p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
          <div className="flex items-center">
            <Monitor className="w-5 h-5 text-cyan-400 mr-2 animate-spin" />
            <span className="text-cyan-300">Running comprehensive system diagnostic...</span>
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div className="bg-cyan-400 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
};