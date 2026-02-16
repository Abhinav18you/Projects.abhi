import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeadDrop } from "../hooks/useDeadDrop";
import { useAppStore } from "../store/useAppStore";
import { logToTerminal } from "../utils/log";

// Radar/Pulse Animation for waiting state
const RadarPulse = () => (
    <div className="relative w-24 h-24">
        {/* Outer pulsing rings */}
        {[1, 2, 3].map((i) => (
            <motion.div
                key={i}
                className="absolute inset-0 rounded-full ring-1 ring-[#00FF41]/30"
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut",
                }}
            />
        ))}
        {/* Center dot */}
        <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.6)]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        />
    </div>
);

// Step indicator component
const StepIndicator = ({ step, currentStep, title, description }: { 
    step: number; 
    currentStep: number; 
    title: string; 
    description: string;
}) => {
    const isActive = currentStep === step;
    const isCompleted = currentStep > step;
    
    return (
        <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
            isActive ? "bg-[#00FF41]/10 ring-1 ring-[#00FF41]/30" : 
            isCompleted ? "opacity-60" : "opacity-40"
        }`}>
            <motion.div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all ${
                    isCompleted ? "bg-[#00FF41] text-black" :
                    isActive ? "bg-[#00FF41]/20 text-[#00FF41] ring-2 ring-[#00FF41]/50" : 
                    "bg-white/[0.04] text-white/50"
                }`}
                initial={isCompleted ? { scale: 0.8 } : { scale: 1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                {isCompleted ? (
                    <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        ✓
                    </motion.span>
                ) : step}
            </motion.div>
            <div>
                <h4 className={`text-sm font-medium tracking-tight ${isActive ? "text-[#00FF41]" : "text-white/50"}`}>
                    {title}
                </h4>
                <p className="text-[10px] text-white/40 mt-0.5">{description}</p>
            </div>
        </div>
    );
};

export const DeadDropView = () => {
  const { fileState } = useAppStore();
  const { initializeDeadDrop, destroy, connection, connectToDeadDrop, incomingFile } = useDeadDrop();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Determine current step
  const getCurrentStep = () => {
      if (!shareLink) return 1;
      if (!connection) return 2;
      return 3;
  };
  const currentStep = getCurrentStep();

  // Parse URL for ?peer=ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const peerParam = params.get("peer");
    if (peerParam) {
        connectToDeadDrop(peerParam);
    }
  }, [connectToDeadDrop]);

  const handleCreateLink = async () => {
    if (!fileState.result) return;
    setIsGenerating(true);
    try {
        const id = await initializeDeadDrop(fileState.result.blob, fileState.result.fileName);
        const link = `${window.location.origin}/dead-drop?peer=${id}`;
        setShareLink(link);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  const copyLink = () => {
      if (shareLink) {
          navigator.clipboard.writeText(shareLink);
          logToTerminal("LINK COPIED TO CLIPBOARD.");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  const handleDownloadIncoming = () => {
      if (!incomingFile) return;
      const url = URL.createObjectURL(incomingFile.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = incomingFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  useEffect(() => {
      return () => destroy();
  }, [destroy]);

  // View for Receiver
  const params = new URLSearchParams(window.location.search);
  if (params.get("peer")) {
      return (
        <motion.div 
            className="flex flex-col items-center justify-center h-full space-y-6 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
             <motion.div 
                 className="rounded-full bg-white/[0.02] p-4 ring-1 ring-white/10 mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                 animate={{ rotate: connection ? 0 : [0, 10, -10, 0] }}
                 transition={{ duration: 2, repeat: connection ? 0 : Infinity }}
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#00FF41]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
             </motion.div>
             <div>
                <h3 className="text-xl font-medium text-white/90 tracking-tight">SECURE RECEIVER MODE</h3>
                <p className="text-xs text-white/50 font-mono mt-1">
                    {connection ? "CONNECTED TO SENDER" : "ESTABLISHING ENCRYPTED TUNNEL..."}
                </p>
             </div>

             <AnimatePresence mode="wait">
                 {connection ? (
                     <motion.div 
                         key="connected"
                         className="flex items-center gap-2 text-[#00FF41] text-sm font-medium"
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0 }}
                         transition={{ type: "spring", stiffness: 300, damping: 30 }}
                     >
                         <motion.div 
                             className="w-2 h-2 rounded-full bg-[#00FF41]"
                             animate={{ scale: [1, 1.3, 1] }}
                             transition={{ duration: 1, repeat: Infinity }}
                         />
                         PEER CONNECTED
                     </motion.div>
                 ) : (
                     <motion.div
                         key="searching"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                     >
                         <RadarPulse />
                         <p className="text-white/50 text-xs mt-4">SEARCHING FOR SIGNAL...</p>
                     </motion.div>
                 )}
             </AnimatePresence>

             <AnimatePresence>
                 {incomingFile && (
                     <motion.div 
                         className="mt-8 p-6 rounded-xl ring-1 ring-[#00FF41]/30 bg-[#00FF41]/10"
                         initial={{ opacity: 0, scale: 0.9, y: 20 }}
                         animate={{ opacity: 1, scale: 1, y: 0 }}
                         transition={{ type: "spring", stiffness: 400, damping: 25 }}
                     >
                         <motion.div
                             initial={{ scale: 0 }}
                             animate={{ scale: 1 }}
                             transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
                             className="text-2xl mb-2"
                         >
                             🎉
                         </motion.div>
                         <p className="text-white/90 font-medium mb-2">PAYLOAD RECEIVED</p>
                         <p className="text-xs text-white/50 mb-4 font-mono">{incomingFile.name}</p>
                         <motion.button
                            onClick={handleDownloadIncoming}
                            className="rounded-md bg-[#00FF41] px-6 py-2.5 text-sm font-medium text-black hover:bg-[#00FF41]/90 transition-all shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                         >
                             DOWNLOAD FILE
                         </motion.button>
                     </motion.div>
                 )}
             </AnimatePresence>
        </motion.div>
      );
  }

  // View for Sender - No file ready
  if (!fileState.result) {
      return (
          <motion.div 
              className="flex flex-col items-center justify-center h-full text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
              <motion.div 
                  className="rounded-full bg-white/[0.02] p-4 ring-1 ring-white/10"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
              </motion.div>
              <div>
                <p className="text-white/50 text-sm font-medium">NO FILE READY FOR TRANSMISSION</p>
                <p className="text-white/30 text-xs mt-1">PROCESS A FILE IN THE INCINERATOR FIRST TO ENABLE DEAD DROP</p>
              </div>
          </motion.div>
      );
  }

  // View for Sender - 3-Step Flow
  return (
    <div className="flex flex-col h-full">
        {/* Step Indicators */}
        <div className="grid grid-cols-3 gap-2 mb-6">
            <StepIndicator 
                step={1} 
                currentStep={currentStep} 
                title="Generate" 
                description="Create a secure, one-time tunnel"
            />
            <StepIndicator 
                step={2} 
                currentStep={currentStep} 
                title="Share" 
                description="Send the link. Don't close this tab."
            />
            <StepIndicator 
                step={3} 
                currentStep={currentStep} 
                title="Transfer" 
                description="File streams directly to receiver"
            />
        </div>

        {/* File Info */}
        <motion.div 
            className="text-center mb-6 p-3 rounded-lg bg-white/[0.02] ring-1 ring-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1">Ready to transfer</p>
            <p className="text-sm text-white/90 font-medium truncate">{fileState.result.fileName}</p>
        </motion.div>

        {/* Step Content */}
        <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
                {/* Step 1: Generate Link */}
                {currentStep === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="text-center"
                    >
                        <motion.button
                            onClick={handleCreateLink}
                            disabled={isGenerating}
                            className="rounded-lg bg-[#00FF41] px-8 py-3.5 text-sm font-medium text-black hover:bg-[#00FF41]/90 transition-all shadow-[0_0_25px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.02, boxShadow: "0 0 35px rgba(0,255,65,0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        ⚙️
                                    </motion.span>
                                    Generating...
                                </span>
                            ) : (
                                "Generate Secure Link"
                            )}
                        </motion.button>
                        <p className="text-[10px] text-white/30 mt-3">Creates an encrypted P2P channel</p>
                    </motion.div>
                )}

                {/* Step 2: Share Link */}
                {currentStep === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-w-md space-y-4"
                    >
                        <div className="rounded-lg ring-1 ring-[#00FF41]/30 bg-[#00FF41]/10 p-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[10px] text-[#00FF41] font-mono uppercase tracking-widest">
                                    Secure Link Ready
                                </p>
                                <motion.span 
                                    className="h-2 w-2 rounded-full bg-[#00FF41]"
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded bg-black/50 p-2.5 text-xs text-white/70 font-mono ring-1 ring-white/10">
                                    {shareLink}
                                </code>
                                <div className="relative">
                                    <motion.button 
                                        onClick={copyLink} 
                                        className={`p-2.5 rounded transition-all ${
                                            copied 
                                                ? "bg-[#00FF41]/20 text-[#00FF41]" 
                                                : "hover:text-white/90 text-white/50 hover:bg-white/[0.04]"
                                        }`}
                                        title="Copy Link"
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    >
                                        {copied ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        )}
                                    </motion.button>
                                    
                                    {/* Copied Tooltip */}
                                    <AnimatePresence>
                                        {copied && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -5, scale: 0.9 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[#00FF41] text-black text-[10px] font-medium whitespace-nowrap"
                                            >
                                                Copied!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Waiting for connection */}
                        <motion.div 
                            className="flex flex-col items-center p-4 rounded-lg bg-white/[0.02] ring-1 ring-dashed ring-white/10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
                        >
                            <RadarPulse />
                            <p className="text-white/50 text-xs mt-4">Awaiting peer connection...</p>
                            <p className="text-white/30 text-[10px] mt-1">Keep this tab open</p>
                        </motion.div>
                    </motion.div>
                )}

                {/* Step 3: Connected & Transferring */}
                {currentStep === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="text-center space-y-4"
                    >
                        <motion.div 
                            className="w-16 h-16 mx-auto rounded-full bg-[#00FF41]/20 flex items-center justify-center"
                            animate={{ 
                                boxShadow: [
                                    "0 0 0 0 rgba(0,255,65,0.4)",
                                    "0 0 0 15px rgba(0,255,65,0)",
                                ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#00FF41]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </motion.div>
                        </motion.div>
                        <div>
                            <p className="text-[#00FF41] text-sm font-medium">Peer Connected!</p>
                            <p className="text-white/50 text-xs mt-1">Streaming file data...</p>
                        </div>
                        <motion.div 
                            className="w-full max-w-xs mx-auto h-1 bg-white/10 rounded-full overflow-hidden"
                        >
                            <motion.div
                                className="h-full bg-[#00FF41]"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3, ease: "linear" }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};
