import React, { useRef, useEffect, useState } from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
}


const QUICK_MOBILE_SYMBOLS = [
  { label: 'Tab', insert: '  ' },
  { label: '{ }', insert: '{\n  \n}' },
  { label: '( )', insert: '()' },
  { label: '[ ]', insert: '[]' },
  { label: '< >', insert: '<>' },
  { label: '" "', insert: '""' },
  { label: "' '", insert: "''" },
  { label: '` `', insert: '``' },
  { label: '=>', insert: ' => ' },
  { label: ';', insert: ';' },
  { label: '=', insert: ' = ' },
  { label: '/', insert: '/' },
  { label: 'const', insert: 'const ' },
  { label: 'function', insert: 'function ' },
  { label: 'return', insert: 'return ' },
  { label: 'console.log', insert: 'console.log();' },
];


const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });


  useEffect(() => {
    // Only auto-focus on non-touch devices to avoid unexpected mobile keyboard popup
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice && textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [language]);


  const updateCursorPos = () => {
    if (!textareaRef.current) return;
    const textBefore = textareaRef.current.value.substring(0, textareaRef.current.selectionStart);
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };


  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    updateCursorPos();
  };


  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const spaces = '  ';
      const newValue = code.substring(0, start) + spaces + code.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + spaces.length;
        updateCursorPos();
      });
    }
  };


  const insertSymbol = (textToInsert: string) => {
    if (!textareaRef.current) return;
    const target = textareaRef.current;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const newValue = code.substring(0, start) + textToInsert + code.substring(end);
    onChange(newValue);


    requestAnimationFrame(() => {
      target.focus();
      const newPos = start + textToInsert.length;
      target.setSelectionRange(newPos, newPos);
      updateCursorPos();
    });
  };


  const lineCount = Math.max(1, code.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);


  return (
    <div className="w-full h-full font-mono text-sm bg-[#0c0c0e] flex flex-col overflow-hidden">
      {/* Mobile Code Assistant Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[#121214] border-b border-[#27272a] overflow-x-auto shrink-0 select-none scrollbar-thin">
        <span className="text-[10px] text-amber-500/80 font-bold px-1 uppercase tracking-wider shrink-0 hidden sm:inline">
          Quick Insert:
        </span>
        {QUICK_MOBILE_SYMBOLS.map((sym, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => insertSymbol(sym.insert)}
            className="px-2 py-1 bg-[#1c1c22] hover:bg-amber-500/20 hover:text-amber-300 text-zinc-300 border border-[#2e2e38] rounded text-xs font-mono shrink-0 transition-colors active:scale-95 active:bg-amber-500/30"
          >
            {sym.label}
          </button>
        ))}
      </div>


      <div className="flex-1 w-full h-full flex overflow-hidden min-h-0 relative">
        {/* Line Numbers Sidebar */}
        <div 
          ref={lineNumbersRef}
          className="w-10 sm:w-14 bg-[#09090b] border-r border-[#27272a] select-none overflow-hidden shrink-0 font-mono text-[11px] sm:text-[13px] h-full pointer-events-none"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          <div className="pt-4 pb-32 pr-2 sm:pr-3 text-right text-zinc-500">
            {lineNumbers.map((num) => {
              const isCurrent = num === cursorPos.line;
              return (
                <div 
                  key={num} 
                  className={`h-6 leading-6 text-[10px] sm:text-xs transition-colors ${
                    isCurrent ? 'text-amber-400 font-bold bg-amber-500/15 -mr-2 sm:-mr-3 pr-2 sm:pr-3 rounded-l' : 'opacity-60'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>


        {/* Textarea Code Container */}
        <div className="flex-1 h-full min-w-0 bg-[#0c0c0e] relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCursorPos}
            onClick={updateCursorPos}
            onScroll={handleScroll}
            className="w-full h-full pt-4 pb-32 px-3 sm:px-4 bg-transparent text-zinc-200 resize-none outline-none font-mono text-xs sm:text-[13px] leading-6 placeholder-zinc-700 whitespace-pre overflow-auto block"
            style={{ 
              fontFamily: 'JetBrains Mono, monospace', 
              tabSize: 2,
            }}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            placeholder="// Start coding..."
          />
        </div>
      </div>


      {/* Editor Footer Status Bar */}
      <div className="h-7 bg-[#09090b] border-t border-[#27272a] px-3 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 font-mono select-none shrink-0 z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            {language.toUpperCase()}
          </span>
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-zinc-500">
          <span>{lineCount} lines</span>
          <span className="hidden sm:inline">{code.length} chars</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};


export default CodeEditor;
