import { useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";

export const Terminal = () => {
  const logs = useAppStore((state) => state.terminalLogs);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex h-full flex-col border-l border-zinc-800 bg-black text-[10px] font-mono leading-relaxed text-emerald-500/80">
      <div className="flex h-10 items-center border-b border-zinc-800 bg-zinc-900/20 px-4 text-xs font-semibold tracking-wider text-zinc-500">
        TERMINAL_OUTPUT
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
        {logs.length === 0 && (
          <span className="text-zinc-700 opacity-50">AWAITING INPUT...</span>
        )}
        {logs.map((log, i) => (
          <div key={i} className="mb-1 break-words">
            <span className="mr-2 text-zinc-700 select-none">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className="font-mono">{log}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
