

import React from 'react';

export const PlayIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-10 w-10 text-white" 
        viewBox="0 0 20 20" 
        fill="currentColor"
    >
        <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
            clipRule="evenodd" 
        />
    </svg>
);

export const PauseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


export const StopIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-10 w-10 text-white" 
        viewBox="0 0 20 20" 
        fill="currentColor"
    >
        <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" 
            clipRule="evenodd" 
        />
    </svg>
);

// FIX: Added the missing PowerIcon component.
export const PowerIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-12 w-12 transition-colors duration-300 ${enabled ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]' : 'text-gray-600'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2v10m-7.071 2.929a8 8 0 1014.142 0"
        />
    </svg>
);
