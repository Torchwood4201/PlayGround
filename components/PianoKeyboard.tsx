
import React, { useRef } from 'react';
import { NOTE_TO_KEY_MAP } from '../utils/notes';

export interface PianoKey {
    note: string;
    frequency: number;
    type: 'white' | 'black';
}

interface PianoKeyboardProps {
    notes: PianoKey[];
    activeNotes: Map<string, number>;
    onNoteOn: (note: string, frequency: number, velocity?: number) => void;
    onNoteOff: (note: string) => void;
    disabled: boolean;
    /** Pitch classes (e.g. 'C', 'F#') highlighted by the theory panel. */
    highlightNotes?: Set<string>;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ notes, activeNotes, onNoteOn, onNoteOff, disabled, highlightNotes }) => {
    
    const isPointerDownRef = useRef(false);
    const lastNotePerPointerRef = useRef<Map<number, string>>(new Map()); // Maps pointer/touch identifier to note string

    const getKeyDataFromElement = (element: Element | null): { note: string, frequency: number } | null => {
        const keyElement = element?.closest<HTMLElement>('[data-note]');
        if (keyElement?.dataset.note && keyElement?.dataset.frequency) {
            return {
                note: keyElement.dataset.note,
                frequency: parseFloat(keyElement.dataset.frequency),
            };
        }
        return null;
    }

    const handlePointerDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        isPointerDownRef.current = true;
        const keyData = getKeyDataFromElement(event.target as Element);
        if (keyData) {
            onNoteOn(keyData.note, keyData.frequency, 0.9);
            lastNotePerPointerRef.current.set(-1, keyData.note); // -1 for mouse
        }
    };

    const handlePointerUp = () => {
        if (disabled) return;
        isPointerDownRef.current = false;
        const lastNote = lastNotePerPointerRef.current.get(-1);
        if (lastNote) {
            onNoteOff(lastNote);
            lastNotePerPointerRef.current.delete(-1);
        }
    };

    const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled || !isPointerDownRef.current) return;
        const lastNote = lastNotePerPointerRef.current.get(-1);
        const keyData = getKeyDataFromElement(event.target as Element);

        if (keyData && keyData.note !== lastNote) {
            // Slide to a new note
            if (lastNote) onNoteOff(lastNote);
            onNoteOn(keyData.note, keyData.frequency, 0.9);
            lastNotePerPointerRef.current.set(-1, keyData.note);
        }
    };

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        if (disabled) return;
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const keyData = getKeyDataFromElement(document.elementFromPoint(touch.clientX, touch.clientY));
            if (keyData) {
                onNoteOn(keyData.note, keyData.frequency, 0.9);
                lastNotePerPointerRef.current.set(touch.identifier, keyData.note);
            }
        }
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (disabled) return;
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const lastNote = lastNotePerPointerRef.current.get(touch.identifier);
            if (lastNote) {
                onNoteOff(lastNote);
                lastNotePerPointerRef.current.delete(touch.identifier);
            }
        }
    };

    const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
        if (disabled) return;
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const lastNote = lastNotePerPointerRef.current.get(touch.identifier);
            const keyData = getKeyDataFromElement(document.elementFromPoint(touch.clientX, touch.clientY));
            
            if (keyData && keyData.note !== lastNote) {
                 if (lastNote) onNoteOff(lastNote);
                 onNoteOn(keyData.note, keyData.frequency, 0.9);
                 lastNotePerPointerRef.current.set(touch.identifier, keyData.note);
            }
        }
    };

    const WHITE_KEY_WIDTH_REM = 3; // Corresponds to w-12
    const BLACK_KEY_WIDTH_REM = 1.75; // Corresponds to w-7

    const whiteKeys = notes.filter(n => n.type === 'white');

    return (
        <div 
            className="relative w-full h-48 flex select-none p-2 rounded-lg glass-base neumorphic-outset overflow-x-auto" 
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onTouchMove={handleTouchMove}
        >
            <div className="relative h-full flex flex-nowrap">
                {/* White Keys */}
                {whiteKeys.map(({ note, frequency }) => {
                    const isActive = activeNotes.has(note);
                    const isHighlighted = !isActive && highlightNotes?.has(note.slice(0, -1));
                    return (
                        <div
                            key={note}
                            data-note={note}
                            data-frequency={frequency}
                            className={`
                                w-12 flex-shrink-0 border-gray-600/50 rounded-b-md cursor-pointer transition-all duration-75
                                flex flex-col items-center justify-end pb-2 relative
                                ${isActive 
                                    ? 'bg-cyan-400/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5),inset_0_0_10px_rgba(6,182,212,0.8)] transform translate-y-0.5' 
                                    : isHighlighted
                                        ? 'bg-gradient-to-b from-amber-100 to-amber-300 ring-2 ring-inset ring-amber-400 shadow-[2px_0_3px_rgba(0,0,0,0.3),_0_5px_5px_rgba(0,0,0,0.4)]'
                                        : 'bg-gradient-to-b from-gray-200 to-gray-400 shadow-[2px_0_3px_rgba(0,0,0,0.3),_0_5px_5px_rgba(0,0,0,0.4)]'
                                }
                                ${disabled ? 'bg-gray-500/50 cursor-not-allowed hover:bg-gray-500/50' : ''}
                                border-l border-b
                            `}
                        >
                            <div className="pointer-events-none text-center">
                                <span className={`text-lg font-bold transition-colors ${isActive ? 'text-white' : 'text-gray-900'}`}>{note.slice(0, -1)}</span>
                                {note.startsWith('C') && <span className={`block text-xs font-semibold ${isActive ? 'text-cyan-900' : 'text-gray-500'}`}>{note.slice(-1)}</span>}
                                {NOTE_TO_KEY_MAP[note] && <span className={`block text-xs font-semibold ${isActive ? 'text-cyan-900' : 'text-gray-500'}`}>{NOTE_TO_KEY_MAP[note]}</span>}
                            </div>
                        </div>
                    );
                })}
                
                {/* Black Keys */}
                {notes.map(({ note, frequency, type }, index) => {
                    if (type !== 'black') return null;

                    const isActive = activeNotes.has(note);
                    const precedingWhiteKeys = notes.slice(0, index).filter(n => n.type === 'white').length;
                    const leftPos = `calc(${precedingWhiteKeys * WHITE_KEY_WIDTH_REM}rem - ${BLACK_KEY_WIDTH_REM / 2}rem)`;
                    const isHighlighted = !isActive && highlightNotes?.has(note.slice(0, -1));

                    return (
                        <div
                            key={note}
                            data-note={note}
                            data-frequency={frequency}
                            style={{ left: leftPos }}
                            className={`
                                absolute top-2 h-2/3 w-7 border-black/30 rounded-b-md cursor-pointer transition-all duration-75 z-10
                                flex items-end justify-center pb-1
                                ${isActive 
                                    ? 'bg-cyan-500/90 shadow-[inset_0_0_10px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(6,182,212,0.9)] transform translate-y-0.5' 
                                    : isHighlighted
                                        ? 'bg-gradient-to-b from-amber-500 to-amber-700 ring-2 ring-amber-300 shadow-[2px_2px_2px_rgba(0,0,0,0.8),_4px_4px_5px_rgba(0,0,0,0.6)]'
                                        : 'bg-gradient-to-b from-gray-800 to-gray-900 shadow-[2px_2px_2px_rgba(0,0,0,0.8),_4px_4px_5px_rgba(0,0,0,0.6)]'
                                }
                                ${disabled ? 'bg-gray-700/50 cursor-not-allowed hover:bg-gray-700/50' : ''}
                            `}
                        >
                           {NOTE_TO_KEY_MAP[note] && <span className={`text-xs pointer-events-none font-semibold ${isActive ? 'text-white' : 'text-gray-200'}`}>{NOTE_TO_KEY_MAP[note]}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
