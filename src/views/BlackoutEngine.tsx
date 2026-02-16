import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useBlackoutEngine, BlackoutStatus } from "../hooks/useBlackoutEngine";
import { cn } from "../utils/cn";

// Icons
const FaceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <circle cx="12" cy="8" r="5" />
    <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
  </svg>
);

interface DropZoneProps {
  onDrop: (files: File[]) => void;
  status: BlackoutStatus;
  result: ReturnType<typeof useBlackoutEngine>['result'];
  error: string | null;
  onReset: () => void;
}

const BlackoutDropZone = ({ onDrop, status, result, error, onReset }: DropZoneProps) => {
  const handleDownload = useCallback(() => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  const isDisabled = status === 'loading' || status === 'processing';

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    multiple: false,
    disabled: isDisabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex min-h-[400px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl ring-1 ring-dashed ring-white/10 bg-white/[0.02] backdrop-blur-xl transition-all",
        isDragActive && "ring-[#00FF41] bg-[#00FF41]/5",
        isDisabled && "cursor-wait ring-[#00FF41]/20",
        status === "done" && "cursor-default ring-[#00FF41]/50 bg-[#00FF41]/5"
      )}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {(status === "idle" || status === "ready") && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-white/[0.02] p-4 ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={cn("h-8 w-8 text-white/40 transition-colors", isDragActive && "text-[#00FF41]")}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium tracking-tight text-white/70">
              {isDragActive ? "RELEASE TO BEGIN FACE REDACTION" : "Drop image to detect and redact faces"}
            </p>
            <p className="mt-2 text-[10px] text-white/40 font-mono">
              Supported: JPG • PNG • WEBP
            </p>
            <p className="mt-1 text-[9px] text-white/30 font-mono">
              Local AI • No uploads • WebAssembly powered
            </p>
            {status === "ready" && (
              <p className="mt-2 text-[9px] text-[#00FF41]/70 font-mono">
                ✓ ML Model Ready
              </p>
            )}
          </motion.div>
        )}

        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#00FF41]/20" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-[#00FF41]/50 border-t-[#00FF41] animate-spin" />
            </div>
            <p className="mt-6 text-xs font-medium tracking-widest text-[#00FF41] animate-pulse">
              LOADING ML MODEL...
            </p>
          </motion.div>
        )}

        {status === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#00FF41]/20" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-[#00FF41]/50 border-t-[#00FF41] animate-spin" />
            </div>
            <p className="mt-6 text-xs font-medium tracking-widest text-[#00FF41] animate-pulse">
              SCANNING FOR FACES...
            </p>
          </motion.div>
        )}

        {status === "done" && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="z-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <motion.div 
                className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#00FF41]/10 flex items-center justify-center ring-1 ring-[#00FF41]/50"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-6 h-6 text-[#00FF41]"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </motion.svg>
              </motion.div>
              <motion.h3 
                className="text-2xl font-medium tracking-tight text-white/90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.15 }}
              >
                REDACTED
              </motion.h3>
              <motion.p 
                className="mt-1 text-[10px] text-[#00FF41]/70 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
              >
                {result.facesDetected} face(s) blurred • {result.fileName}
              </motion.p>
              <motion.p 
                className="mt-1 text-[9px] text-white/40 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.25 }}
              >
                {(result.finalSize / 1024).toFixed(1)}KB
              </motion.p>
            </div>

            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.3 }}
            >
              <motion.button
                onClick={handleDownload}
                className="rounded-md bg-[#00FF41] px-6 py-2 text-xs font-medium text-black hover:bg-[#00FF41]/90 transition-colors shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                DOWNLOAD
              </motion.button>
              <motion.button
                onClick={onReset}
                className="rounded-md ring-1 ring-white/20 bg-white/[0.02] px-6 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.04] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                NEW SCAN
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div 
            key="error" 
            className="text-red-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <p className="font-medium">ERROR</p>
            <p className="text-xs">{error}</p>
            <button onClick={(e) => { e.stopPropagation(); onReset(); }} className="mt-4 text-xs underline cursor-pointer">TRY AGAIN</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const BlackoutEngine = () => {
  const { status, result, error, processImage, initializeDetector, reset } = useBlackoutEngine();

  // Pre-initialize the ML model when component mounts
  useEffect(() => {
    initializeDetector().catch(() => {
      // Error is already handled in the hook
    });
  }, [initializeDetector]);

  const handleDrop = useCallback((files: File[]) => {
    if (files.length > 0) {
      processImage(files[0]).catch(() => {
        // Error is already handled in the hook
      });
    }
  }, [processImage]);

  return (
    <div className="space-y-8 py-6">
      {/* Hero Section */}
      <header className="text-center space-y-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white/90 leading-tight">
          <span className="block">Faces Reveal Identity.</span>
          <span className="text-[#00FF41]">Erase Them.</span>
        </h1>
        <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto leading-relaxed">
          The Blackout Engine uses local AI to detect and blur faces directly in your browser. 
          No uploads, no cloud processing—just pure client-side privacy.
        </p>
      </header>

      {/* How It Works - 3-Step Diagram */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: <FaceIcon />, step: "STEP 1", title: "Drop Image", desc: "Local WebAssembly ML model" },
            { icon: <BrainIcon />, step: "STEP 2", title: "AI Detection", desc: "MediaPipe face detection" },
            { icon: <ShieldIcon />, step: "STEP 3", title: "Auto Redact", desc: "Gaussian blur applied" },
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-white/[0.02] backdrop-blur-xl ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all hover:bg-white/[0.04] hover:ring-[#00FF41]/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="mb-4 p-3 rounded-full bg-[#00FF41]/10 text-[#00FF41] ring-1 ring-[#00FF41]/30">
                {item.icon}
              </div>
              <span className="text-[#00FF41] text-xs font-medium mb-2">{item.step}</span>
              <h3 className="text-white/90 font-medium text-sm mb-1 tracking-tight">{item.title}</h3>
              <p className="text-white/50 text-xs">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Drop Zone */}
      <motion.section 
        className="rounded-xl bg-white/[0.02] backdrop-blur-xl ring-1 ring-white/10 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
      >
        <BlackoutDropZone 
          onDrop={handleDrop} 
          status={status} 
          result={result} 
          error={error}
          onReset={reset}
        />
      </motion.section>

      {/* Info Card */}
      <motion.section 
        className="rounded-xl bg-white/[0.02] backdrop-blur-xl ring-1 ring-white/10 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.4 }}
      >
        <h3 className="mb-4 text-xs font-medium tracking-wider text-white/50 uppercase">Technical Details</h3>
        <div className="space-y-3 text-xs text-white/60">
          <div className="flex items-start gap-3">
            <span className="text-[#00FF41]">▹</span>
            <span><strong className="text-white/80">Model:</strong> MediaPipe BlazeFace Short Range (optimized for speed)</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#00FF41]">▹</span>
            <span><strong className="text-white/80">Runtime:</strong> WebAssembly with GPU acceleration when available</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#00FF41]">▹</span>
            <span><strong className="text-white/80">Privacy:</strong> Zero network uploads—all processing runs locally in your browser</span>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
