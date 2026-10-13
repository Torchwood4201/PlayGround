import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeechResult: (text: string) => void;
  onSpeakText: (text: string) => void;
  isListening: boolean;
  isSpeaking: boolean;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onSpeechResult,
  onSpeakText,
  isListening,
  isSpeaking
}) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Prefer a more robotic/AI-like voice
      const preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('alex') ||
        voice.name.toLowerCase().includes('daniel') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.lang.startsWith('en')
      );
      
      setSelectedVoice(preferredVoice || voices[0] || null);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speakText = (text: string) => {
    if (!isVoiceEnabled || !selectedVoice) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = 0.8;

    // Add some personality to the voice
    utterance.onstart = () => onSpeakText(text);
    utterance.onend = () => onSpeakText('');

    speechSynthesis.speak(utterance);
  };

  // Expose speakText function to parent
  useEffect(() => {
    (window as any).positronicSpeak = speakText;
  }, [selectedVoice, speechRate, speechPitch, isVoiceEnabled]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-cyan-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Volume2 className="w-5 h-5 text-cyan-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Voice Interface</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`p-2 rounded transition-colors ${
              isVoiceEnabled 
                ? 'text-cyan-400 bg-cyan-900/20' 
                : 'text-gray-500 bg-gray-700'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4 p-3 bg-gray-700 rounded border border-gray-600">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Voice Selection
              </label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = availableVoices.find(v => v.name === e.target.value);
                  setSelectedVoice(voice || null);
                }}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
              >
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Speech Rate: {speechRate.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Pitch: {speechPitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${isListening ? 'text-red-400' : 'text-gray-400'}`}>
            {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
            <span className="text-sm ml-2">
              {isListening ? 'Listening...' : 'Voice Recognition Ready'}
            </span>
          </div>
        </div>
        
        <div className={`flex items-center ${isSpeaking ? 'text-cyan-400' : 'text-gray-400'}`}>
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
          <span className="text-sm ml-2">
            {isSpeaking ? 'Speaking...' : 'Voice Synthesis Ready'}
          </span>
        </div>
      </div>

      {isVoiceEnabled && (
        <div className="mt-3 p-2 bg-cyan-900/20 rounded border border-cyan-500/30">
          <p className="text-cyan-300 text-xs">
            Voice interface active. The positronic brain will speak responses and can listen to voice commands.
          </p>
        </div>
      )}
    </div>
  );
};