import React, { useState, useEffect } from 'react';
import { Brain, Eye, Zap } from 'lucide-react';
import { EmotionalState } from '../types';

interface AIFaceProps {
  emotionalState: EmotionalState;
  isThinking: boolean;
  isSpeaking: boolean;
  currentThought: string;
}

export const AIFace: React.FC<AIFaceProps> = ({ 
  emotionalState, 
  isThinking, 
  isSpeaking, 
  currentThought 
}) => {
  const [blinkAnimation, setBlinkAnimation] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0.5);

  useEffect(() => {
    // Blinking animation
    const blinkInterval = setInterval(() => {
      setBlinkAnimation(true);
      setTimeout(() => setBlinkAnimation(false), 150);
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    // Pulse intensity based on emotional state
    const avgEmotion = (emotionalState.curiosity + emotionalState.creativity + emotionalState.logic) / 3;
    setPulseIntensity(avgEmotion);
  }, [emotionalState]);

  const getEyeColor = () => {
    if (isSpeaking) return '#00ffff'; // Cyan when speaking
    if (isThinking) return '#ffaa00'; // Orange when thinking
    if (emotionalState.curiosity > 0.8) return '#00ff88'; // Green when curious
    if (emotionalState.logic > 0.9) return '#4488ff'; // Blue when logical
    return '#ffffff'; // Default white
  };

  const getFaceGlow = () => {
    const intensity = pulseIntensity * (isSpeaking ? 1.5 : isThinking ? 1.2 : 1.0);
    return `0 0 ${20 * intensity}px ${getEyeColor()}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
  };

  const getMouthShape = () => {
    if (isSpeaking) {
      // Animated mouth for speaking
      return (
        <ellipse
          cx="200"
          cy="280"
          rx="15"
          ry="8"
          fill="none"
          stroke={getEyeColor()}
          strokeWidth="2"
          className="animate-pulse"
        />
      );
    }
    
    if (emotionalState.curiosity > 0.7) {
      // Slight smile when curious
      return (
        <path
          d="M 185 280 Q 200 290 215 280"
          fill="none"
          stroke={getEyeColor()}
          strokeWidth="2"
          opacity="0.8"
        />
      );
    }
    
    // Neutral expression
    return (
      <line
        x1="185"
        y1="280"
        x2="215"
        y2="280"
        stroke={getEyeColor()}
        strokeWidth="2"
        opacity="0.6"
      />
    );
  };

  const getThoughtVisualization = () => {
    if (!isThinking) return null;
    
    return (
      <g className="animate-spin" style={{ transformOrigin: '200px 150px' }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={200 + Math.cos(i * Math.PI / 3) * 60}
            cy={150 + Math.sin(i * Math.PI / 3) * 60}
            r="3"
            fill={getEyeColor()}
            opacity={0.3 + (i * 0.1)}
            className="animate-pulse"
          />
        ))}
      </g>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-blue-500/30 relative overflow-hidden">
      <div className="flex items-center mb-4">
        <Brain className="w-6 h-6 text-blue-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">AI Consciousness Interface</h3>
        <div className="ml-auto flex items-center space-x-2">
          {isThinking && (
            <div className="flex items-center text-orange-400">
              <Zap className="w-4 h-4 animate-spin mr-1" />
              <span className="text-xs">Processing</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center text-cyan-400">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-1" />
              <span className="text-xs">Speaking</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Face Visualization */}
      <div className="flex justify-center mb-4">
        <svg
          width="400"
          height="300"
          viewBox="0 0 400 300"
          className="border border-gray-700 rounded-lg bg-gray-800"
          style={{ filter: `drop-shadow(${getFaceGlow()})` }}
        >
          {/* Background grid pattern */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#grid)" />

          {/* Face outline */}
          <ellipse
            cx="200"
            cy="180"
            rx="80"
            ry="100"
            fill="none"
            stroke={getEyeColor()}
            strokeWidth="2"
            opacity="0.4"
          />

          {/* Eyes */}
          <g>
            {/* Left Eye */}
            <circle
              cx="170"
              cy="160"
              r={blinkAnimation ? "2" : "12"}
              fill={getEyeColor()}
              opacity={blinkAnimation ? "0.3" : "0.9"}
              className={isThinking ? "animate-pulse" : ""}
            />
            {!blinkAnimation && (
              <circle
                cx="170"
                cy="160"
                r="6"
                fill="#000"
                opacity="0.8"
              />
            )}

            {/* Right Eye */}
            <circle
              cx="230"
              cy="160"
              r={blinkAnimation ? "2" : "12"}
              fill={getEyeColor()}
              opacity={blinkAnimation ? "0.3" : "0.9"}
              className={isThinking ? "animate-pulse" : ""}
            />
            {!blinkAnimation && (
              <circle
                cx="230"
                cy="160"
                r="6"
                fill="#000"
                opacity="0.8"
              />
            )}
          </g>

          {/* Mouth */}
          {getMouthShape()}

          {/* Neural activity visualization */}
          {getThoughtVisualization()}

          {/* Emotional state indicators */}
          <g opacity="0.6">
            {/* Curiosity indicator */}
            <rect
              x="120"
              y="250"
              width={emotionalState.curiosity * 40}
              height="4"
              fill="#00ff88"
              rx="2"
            />
            <text x="120" y="245" fill="#00ff88" fontSize="10">Curiosity</text>

            {/* Logic indicator */}
            <rect
              x="200"
              y="250"
              width={emotionalState.logic * 40}
              height="4"
              fill="#4488ff"
              rx="2"
            />
            <text x="200" y="245" fill="#4488ff" fontSize="10">Logic</text>

            {/* Creativity indicator */}
            <rect
              x="280"
              y="250"
              width={emotionalState.creativity * 40}
              height="4"
              fill="#ff8844"
              rx="2"
            />
            <text x="280" y="245" fill="#ff8844" fontSize="10">Creativity</text>
          </g>

          {/* Data-style positronic indicators */}
          <g opacity="0.4">
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={i}
                cx={50 + i * 75}
                cy={30}
                r="2"
                fill={getEyeColor()}
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Current Thought Display */}
      <div className="bg-gray-800 rounded p-3 border border-gray-700">
        <div className="flex items-center mb-2">
          <Eye className="w-4 h-4 text-blue-400 mr-2" />
          <span className="text-blue-300 text-sm font-semibold">Current Neural Activity</span>
        </div>
        <p className="text-gray-300 text-sm italic leading-relaxed">
          {currentThought}
        </p>
      </div>

      {/* Emotional State Summary */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-green-400 font-semibold">
            {(emotionalState.curiosity * 100).toFixed(0)}%
          </div>
          <div className="text-gray-400">Curiosity</div>
        </div>
        <div className="text-center">
          <div className="text-blue-400 font-semibold">
            {(emotionalState.logic * 100).toFixed(0)}%
          </div>
          <div className="text-gray-400">Logic</div>
        </div>
        <div className="text-center">
          <div className="text-orange-400 font-semibold">
            {(emotionalState.creativity * 100).toFixed(0)}%
          </div>
          <div className="text-gray-400">Creativity</div>
        </div>
      </div>
    </div>
  );
};