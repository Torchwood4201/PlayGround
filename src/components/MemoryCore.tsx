import React, { useState, useRef } from 'react';
import { Database, Search, Clock, Star, Link, Filter, Download, Upload, Trash2, HardDrive } from 'lucide-react';
import { Memory } from '../types';

interface MemoryCoreProps {
  memories: Memory[];
  /** Where memories persist (e.g. 'localStorage'). Shown as a badge. */
  storageName?: string;
  /** False when the attached store can't persist (private mode, SSR). */
  persistent?: boolean;
  onExport?: () => string;
  onImport?: (json: string) => Promise<number>;
  onClear?: () => Promise<void>;
}

export const MemoryCore: React.FC<MemoryCoreProps> = ({
  memories,
  storageName = 'localStorage',
  persistent = true,
  onExport,
  onImport,
  onClear,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'importance'>('timestamp');
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredMemories = memories
    .filter(memory => {
      const matchesSearch = memory.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || memory.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'timestamp') {
        return b.timestamp - a.timestamp;
      } else {
        return b.importance - a.importance;
      }
    });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'experience': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'knowledge': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'ethical': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
      case 'creative': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getImportanceStars = (importance: number) => {
    const stars = Math.round(importance * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
      />
    ));
  };

  const handleExport = () => {
    if (!onExport) return;
    const blob = new Blob([onExport()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `positronic-memories-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice('Backup downloaded.');
  };

  const handleImportFile = async (file: File) => {
    if (!onImport) return;
    try {
      const text = await file.text();
      const added = await onImport(text);
      setNotice(`Restored ${added} memories from backup.`);
    } catch {
      setNotice('Import failed: not a valid memory backup.');
    }
  };

  const handleClear = async () => {
    if (!onClear) return;
    if (!window.confirm('Forget all stored memories? This cannot be undone.')) return;
    await onClear();
    setNotice('All memories cleared.');
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-purple-500/30">
      <div className="flex items-center mb-2">
        <Database className="w-8 h-8 text-purple-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Memory Core</h2>
        <div className="ml-auto text-sm text-gray-400">
          {memories.length} memories stored
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span
          className={`flex items-center text-xs px-2 py-1 rounded border ${
            persistent
              ? 'text-green-300 bg-green-900/20 border-green-500/30'
              : 'text-yellow-300 bg-yellow-900/20 border-yellow-500/30'
          }`}
          title={persistent ? 'Memories survive reloads' : 'Storage unavailable — memories last for this session only'}
        >
          <HardDrive className="w-3 h-3 mr-1" />
          {persistent ? `Persisted · ${storageName}` : 'Session only'}
        </span>
        {onExport && (
          <button
            onClick={handleExport}
            className="flex items-center text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-600 hover:border-purple-500/50"
          >
            <Download className="w-3 h-3 mr-1" /> Export
          </button>
        )}
        {onImport && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImportFile(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-600 hover:border-purple-500/50"
            >
              <Upload className="w-3 h-3 mr-1" /> Import
            </button>
          </>
        )}
        {onClear && (
          <button
            onClick={() => void handleClear()}
            className="flex items-center text-xs px-2 py-1 rounded bg-gray-800 text-red-300 border border-gray-600 hover:border-red-500/50"
          >
            <Trash2 className="w-3 h-3 mr-1" /> Forget all
          </button>
        )}
        {notice && <span className="text-xs text-purple-300">{notice}</span>}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Types</option>
          <option value="experience">Experience</option>
          <option value="knowledge">Knowledge</option>
          <option value="ethical">Ethical</option>
          <option value="creative">Creative</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'importance')}
          className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="timestamp">Recent First</option>
          <option value="importance">Most Important</option>
        </select>
      </div>

      {/* Memory List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No memories found matching your criteria.</p>
          </div>
        ) : (
          filteredMemories.map((memory) => (
            <div 
              key={memory.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(memory.type)}`}>
                    {memory.type.toUpperCase()}
                  </span>
                  <div className="flex items-center">
                    {getImportanceStars(memory.importance)}
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(memory.timestamp).toLocaleString()}
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                {memory.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Link className="w-3 h-3 mr-1" />
                  {memory.connections.length} connections
                </div>
                
                <div className="text-xs text-gray-500">
                  ID: {memory.id.slice(-8)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Memory Statistics */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-purple-500/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-blue-400 font-semibold">
              {memories.filter(m => m.type === 'experience').length}
            </div>
            <div className="text-gray-400">Experiences</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-semibold">
              {memories.filter(m => m.type === 'knowledge').length}
            </div>
            <div className="text-gray-400">Knowledge</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-semibold">
              {memories.filter(m => m.type === 'ethical').length}
            </div>
            <div className="text-gray-400">Ethical</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-semibold">
              {memories.filter(m => m.type === 'creative').length}
            </div>
            <div className="text-gray-400">Creative</div>
          </div>
        </div>
      </div>
    </div>
  );
};