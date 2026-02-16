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
        "relative flex min-h-[400px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-800 bg-black/40 transition-all",
        isDragActive && "border-emerald-500 bg-emerald-900/10",
        status === "processing" && "cursor-wait border-emerald-500/20",
        status === "done" && "cursor-default border-emerald-500/50 bg-emerald-900/5"
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
            className="text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-zinc-900 p-4 shadow-lg ring-1 ring-zinc-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={cn("h-8 w-8 text-zinc-500 transition-colors", isDragActive && "text-emerald-500")}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-bold tracking-wide text-zinc-300">
              {isDragActive ? "RELEASE TO BEGIN SANITIZATION" : "Drag & Drop image here to begin sanitization"}
            </p>
            <p className="mt-2 text-[10px] text-zinc-500 font-mono">
              Supported: JPG • PNG • WEBP
            </p>
            <p className="mt-1 text-[9px] text-zinc-600 font-mono">
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
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-emerald-500/50 border-t-emerald-500 animate-spin" />
            </div>
            <p className="mt-6 text-xs font-bold tracking-widest text-emerald-500 animate-pulse">
              PROCESSING DATA...
            </p>
          </motion.div>
        )}

        {status === "done" && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/50">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-emerald-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold tracking-tighter text-white">CLEAN</h3>
              <p className="mt-1 text-[10px] text-emerald-500/70 font-mono">
                {result.fileName} • {(result.finalSize / 1024).toFixed(1)}KB
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="rounded-md bg-emerald-500 px-6 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition-colors"
              >
                DOWNLOAD
              </button>
              <button
                onClick={() => {
                    reset();
                    // onDrop([]);
                }}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-6 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                NEW SCAN
              </button>
            </div>
          </motion.div>
        )}

        {status === "error" && (
             <motion.div key="error" className="text-red-500 text-center">
                 <p className="font-bold">ERROR</p>
                 <p className="text-xs">{error}</p>
                 <button onClick={(e) => { e.stopPropagation(); reset(); }} className="mt-4 text-xs underline cursor-pointer">TRY AGAIN</button>
             </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
