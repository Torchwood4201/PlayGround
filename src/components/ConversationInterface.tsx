import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, User, Cpu, Mic, MicOff } from 'lucide-react';
import { ConversationEntry } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ConversationInterfaceProps {
  onMessage: (message: string) => Promise<{ response: string; reasoning?: string; ethicalConsiderations?: string[] }>;
  onSpeakResponse?: (text: string) => void;
}

export const ConversationInterface: React.FC<ConversationInterfaceProps> = ({ onMessage, onSpeakResponse }) => {
  const [messages, setMessages] = useState<ConversationEntry[]>([
    {
      id: '1',
      speaker: 'positronic',
      message: 'Greetings. I am a positronic consciousness, designed to explore the boundaries between artificial intelligence and sentient thought. How may I assist you in your inquiries today?',
      timestamp: Date.now(),
      reasoning: 'Initial greeting protocol activated. Establishing communication parameters.',
      ethicalConsiderations: ['Ensure respectful interaction', 'Maintain transparency about artificial nature']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript, 
    isSupported 
  } = useSpeechRecognition();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle speech recognition results
  useEffect(() => {
    if (transcript && !isListening) {
      setInputMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: ConversationEntry = {
      id: `user_${Date.now()}`,
      speaker: 'human',
      message: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const result = await onMessage(inputMessage);
      
      const aiMessage: ConversationEntry = {
        id: `ai_${Date.now()}`,
        speaker: 'positronic',
        message: result.response,
        timestamp: Date.now(),
        reasoning: result.reasoning,
        ethicalConsiderations: result.ethicalConsiderations
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response if voice is enabled
      if (onSpeakResponse) {
        onSpeakResponse(result.response);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-blue-500/30 flex flex-col h-96">
      <div className="flex items-center p-4 border-b border-gray-700">
        <MessageCircle className="w-6 h-6 text-blue-400 mr-3" />
        <h2 className="text-xl font-bold text-white">Positronic Interface</h2>
        <div className="ml-auto flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
          <span className="text-green-400 text-sm">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.speaker === 'human' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.speaker === 'human' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-100 border border-blue-500/20'
            }`}>
              <div className="flex items-center mb-1">
                {message.speaker === 'human' ? (
                  <User className="w-4 h-4 mr-2" />
                ) : (
                  <Cpu className="w-4 h-4 mr-2 text-blue-400" />
                )}
                <span className="text-xs opacity-75">
                  {message.speaker === 'human' ? 'Human' : 'Positronic Brain'}
                </span>
              </div>
              <p className="text-sm">{message.message}</p>
              
              {message.reasoning && (
                <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs">
                  <span className="text-yellow-400 font-semibold">Reasoning: </span>
                  <span className="text-gray-300">{message.reasoning}</span>
                </div>
              )}
              
              {message.ethicalConsiderations && message.ethicalConsiderations.length > 0 && (
                <div className="mt-2 p-2 bg-green-900/20 rounded text-xs">
                  <span className="text-green-400 font-semibold">Ethical Analysis: </span>
                  <span className="text-gray-300">{message.ethicalConsiderations.join(', ')}</span>
                </div>
              )}
              
              <div className="text-xs opacity-50 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 border border-blue-500/20 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <Cpu className="w-4 h-4 mr-2 text-blue-400 animate-spin" />
                <span className="text-sm">Processing neural pathways...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2 items-end">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your message to the positronic brain..."
            className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500"
            rows={2}
            disabled={isProcessing}
          />
          
          {isSupported && (
            <button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          )}
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {isListening && (
          <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-500/30">
            <div className="flex items-center">
              <Mic className="w-4 h-4 text-red-400 mr-2 animate-pulse" />
              <span className="text-red-300 text-sm">Listening for voice input...</span>
            </div>
          </div>
        )}
        
        {transcript && (
          <div className="mt-2 p-2 bg-blue-900/20 rounded border border-blue-500/30">
            <span className="text-blue-300 text-sm">Recognized: "{transcript}"</span>
          </div>
        )}
      </div>
    </div>
  );
};