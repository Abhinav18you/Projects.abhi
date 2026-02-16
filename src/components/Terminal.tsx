import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/useAppStore";

// Individual log line with typing effect
const TerminalLine = ({ log }: { log: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = 15; // milliseconds per character
    
    const typeChar = () => {
      if (currentIndex < log.length) {
        setDisplayedText(log.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutRef.current = window.setTimeout(typeChar, typingSpeed);
      } else {
        setIsComplete(true);
      }
    };
    
    // Start typing immediately
    typeChar();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [log]);

  return (
    <motion.div 
      className="mb-1 break-words"
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className="mr-2 text-zinc-700 select-none">
        {new Date().toLocaleTimeString('en-US', { hour12: false })}
      </span>
      <span className="font-mono">
        {displayedText}
        {!isComplete && (
          <motion.span 
            className="inline-block w-1.5 h-3 bg-emerald-500 ml-0.5"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </span>
    </motion.div>
  );
};

export const Terminal = () => {
  const logs = useAppStore((state) => state.terminalLogs);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [renderedLogs, setRenderedLogs] = useState<string[]>([]);

  useEffect(() => {
    // Add new logs one at a time with a delay
    if (logs.length > renderedLogs.length) {
      const newLogs = logs.slice(renderedLogs.length);
      newLogs.forEach((log, i) => {
        setTimeout(() => {
          setRenderedLogs(prev => [...prev, log]);
        }, i * 100);
      });
    }
  }, [logs, renderedLogs.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [renderedLogs]);

  return (
    <div className="flex h-full flex-col border-l border-zinc-800 bg-black text-[10px] font-mono leading-relaxed text-emerald-500/80">
      <motion.div 
        className="flex h-10 items-center border-b border-zinc-800 bg-zinc-900/20 px-4 text-xs font-semibold tracking-wider text-zinc-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="flex items-center gap-2">
          <motion.span 
            className="w-2 h-2 rounded-full bg-emerald-500"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          TERMINAL_OUTPUT
        </span>
      </motion.div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
        <AnimatePresence>
          {renderedLogs.length === 0 && (
            <motion.span 
              className="text-zinc-700 opacity-50 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                █
              </motion.span>
              AWAITING INPUT...
            </motion.span>
          )}
        </AnimatePresence>
        {renderedLogs.map((log, i) => (
          <TerminalLine key={`${i}-${log}`} log={log} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
