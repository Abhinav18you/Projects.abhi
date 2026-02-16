import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

export const DropZone = ({ onDrop }: { onDrop: (files: File[]) => void }) => {
  const { fileState, reset } = useAppStore();
  const { status, result, error } = fileState;

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    multiple: false,
    disabled: status === "processing",
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex min-h-[400px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl ring-1 ring-dashed ring-white/10 bg-white/[0.02] backdrop-blur-xl transition-all",
        isDragActive && "ring-[#00FF41] bg-[#00FF41]/5",
        status === "processing" && "cursor-wait ring-[#00FF41]/20",
        status === "done" && "cursor-default ring-[#00FF41]/50 bg-[#00FF41]/5"
      )}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {status === "idle" && (
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
              {isDragActive ? "RELEASE TO BEGIN SANITIZATION" : "Drag & Drop image here to begin sanitization"}
            </p>
            <p className="mt-2 text-[10px] text-white/40 font-mono">
              Supported: JPG • PNG • WEBP
            </p>
            <p className="mt-1 text-[9px] text-white/30 font-mono">
              100% local • No uploads • Zero tracking
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
              PROCESSING DATA...
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
              {/* Spring bounce checkmark animation */}
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
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
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
                CLEAN
              </motion.h3>
              <motion.p 
                className="mt-1 text-[10px] text-[#00FF41]/70 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
              >
                {result.fileName} • {(result.finalSize / 1024).toFixed(1)}KB
              </motion.p>
            </div>

            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.25 }}
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
                onClick={() => {
                    reset();
                }}
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
                 <button onClick={(e) => { e.stopPropagation(); reset(); }} className="mt-4 text-xs underline cursor-pointer">TRY AGAIN</button>
             </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
