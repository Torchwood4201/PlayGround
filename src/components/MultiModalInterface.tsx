import React, { useState, useRef } from 'react';
import { 
  Camera, Mic, Image as ImageIcon, Type, Upload, 
  Play, Pause, Download, Zap, Brain, Sparkles 
} from 'lucide-react';
import { UnifiedModelHub, GenerationResult } from '../core/UnifiedModelHub';

interface MultiModalInterfaceProps {
  modelHub: UnifiedModelHub;
}

export const MultiModalInterface: React.FC<MultiModalInterfaceProps> = ({ modelHub }) => {
  const [activeMode, setActiveMode] = useState<'text' | 'image' | 'audio'>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [textInput, setTextInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleTextGeneration = async () => {
    if (!textInput.trim() || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const result = await modelHub.generateText(textInput, {
        maxLength: 150,
        temperature: 0.8,
        topP: 0.9
      });
      
      setResults(prev => [{
        ...result,
        text: result.text || 'No response generated'
      }, ...prev]);
      
      setTextInput('');
    } catch (error) {
      console.error('Text generation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageClassification = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || isProcessing) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        const result = await modelHub.classifyImage(imageData);
        
        setResults(prev => [result, ...prev]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image classification error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageGeneration = async () => {
    if (!imagePrompt.trim() || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const result = await modelHub.generateImage(imagePrompt, {
        steps: 25,
        guidance: 7.5
      });
      
      setResults(prev => [result, ...prev]);
      setImagePrompt('');
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAudioTranscription = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || isProcessing) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await modelHub.transcribeAudio(arrayBuffer);
      
      setResults(prev => [result, ...prev]);
    } catch (error) {
      console.error('Audio transcription error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'text': return Type;
      case 'image': return ImageIcon;
      case 'audio': return Mic;
      default: return Type;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'text': return 'text-blue-400 border-blue-500/30 bg-blue-900/20';
      case 'image': return 'text-green-400 border-green-500/30 bg-green-900/20';
      case 'audio': return 'text-purple-400 border-purple-500/30 bg-purple-900/20';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-900/20';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-indigo-500/30">
      <div className="flex items-center mb-6">
        <Brain className="w-8 h-8 text-indigo-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Multi-Modal AI Interface</h2>
        <div className="ml-auto flex items-center">
          <Sparkles className="w-5 h-5 text-yellow-400 mr-2 animate-spin" />
          <span className="text-indigo-400 text-sm">Neural Processing Active</span>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex space-x-2 mb-6">
        {['text', 'image', 'audio'].map((mode) => {
          const IconComponent = getModeIcon(mode);
          const isActive = activeMode === mode;
          
          return (
            <button
              key={mode}
              onClick={() => setActiveMode(mode as any)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
                isActive 
                  ? getModeColor(mode)
                  : 'text-gray-400 border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              <span className="capitalize">{mode}</span>
            </button>
          );
        })}
      </div>

      {/* Input Interface */}
      <div className="mb-6">
        {activeMode === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text Generation Prompt
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your prompt for the positronic brain to process..."
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500"
                rows={3}
                disabled={isProcessing}
              />
            </div>
            <button
              onClick={handleTextGeneration}
              disabled={!textInput.trim() || isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
            >
              <Zap className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Processing...' : 'Generate Response'}
            </button>
          </div>
        )}

        {activeMode === 'image' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image Classification
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageClassification}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image to Classify
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image Generation
                </label>
                <div className="flex space-x-2">
                  <input
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe image to generate..."
                    className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={handleImageGeneration}
                    disabled={!imagePrompt.trim() || isProcessing}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMode === 'audio' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Audio Transcription
            </label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioTranscription}
              className="hidden"
            />
            <button
              onClick={() => audioInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio File
            </button>
          </div>
        )}
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-indigo-400 mr-2 animate-pulse" />
            <span className="text-indigo-300">Neural networks processing...</span>
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div className="bg-indigo-400 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      )}

      {/* Results Display */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No results yet. Try generating some content!</p>
          </div>
        ) : (
          results.map((result, index) => (
            <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              {result.text && (
                <div>
                  <div className="flex items-center mb-2">
                    <Type className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-blue-300 font-semibold">Generated Text</span>
                  </div>
                  <p className="text-gray-300 mb-2">{result.text}</p>
                </div>
              )}
              
              {result.classification && (
                <div>
                  <div className="flex items-center mb-2">
                    <Camera className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-green-300 font-semibold">Image Classification</span>
                  </div>
                  <p className="text-gray-300 mb-2">
                    <span className="font-semibold">{result.classification.label}</span>
                    <span className="text-green-400 ml-2">
                      ({(result.classification.confidence * 100).toFixed(1)}% confidence)
                    </span>
                  </p>
                </div>
              )}
              
              {result.image && (
                <div>
                  <div className="flex items-center mb-2">
                    <ImageIcon className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-green-300 font-semibold">Generated Image</span>
                  </div>
                  <img 
                    src={result.image} 
                    alt="Generated" 
                    className="w-full max-w-md rounded-lg border border-gray-600"
                  />
                </div>
              )}
              
              {result.transcription && (
                <div>
                  <div className="flex items-center mb-2">
                    <Mic className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="text-purple-300 font-semibold">Audio Transcription</span>
                  </div>
                  <p className="text-gray-300 mb-2">{result.transcription}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                <span>Processing time: {result.processingTime}ms</span>
                {result.tokensUsed && (
                  <span>Tokens used: {result.tokensUsed}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};