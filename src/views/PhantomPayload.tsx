import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useSteganography } from '../hooks/useSteganography';
import { useSteganalysis, ANOMALY_THRESHOLD } from '../hooks/useSteganalysis';
import { cn } from '../utils/cn';

type TabType = 'hide' | 'extract' | 'xray';

// Icons
const LockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const UnlockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const ScanIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-8 h-8"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export const PhantomPayload = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hide');
  const [secretText, setSecretText] = useState('');

  const stego = useSteganography();
  const steganalysis = useSteganalysis();

  const handleReset = useCallback(() => {
    stego.reset();
    steganalysis.reset();
    setSecretText('');
  }, [stego, steganalysis]);

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-white/90">PHANTOM PAYLOAD</h1>
        <p className="text-sm text-white/50">Steganography & Steganalysis</p>
      </header>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 rounded-xl bg-white/[0.02] backdrop-blur-xl ring-1 ring-white/10 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        <button
          onClick={() => { setActiveTab('hide'); handleReset(); }}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-medium transition-all',
            activeTab === 'hide'
              ? 'bg-[#00FF41]/10 text-[#00FF41] ring-1 ring-[#00FF41]/30 shadow-[0_0_20px_rgba(0,255,65,0.15)]'
              : 'text-white/50 hover:text-white/70 hover:bg-white/[0.02]'
          )}
        >
          <LockIcon />
          HIDE TEXT
        </button>
        <button
          onClick={() => { setActiveTab('extract'); handleReset(); }}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-medium transition-all',
            activeTab === 'extract'
              ? 'bg-[#00FF41]/10 text-[#00FF41] ring-1 ring-[#00FF41]/30 shadow-[0_0_20px_rgba(0,255,65,0.15)]'
              : 'text-white/50 hover:text-white/70 hover:bg-white/[0.02]'
          )}
        >
          <UnlockIcon />
          EXTRACT TEXT
        </button>
        <button
          onClick={() => { setActiveTab('xray'); handleReset(); }}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-medium transition-all',
            activeTab === 'xray'
              ? 'bg-[#00FF41]/10 text-[#00FF41] ring-1 ring-[#00FF41]/30 shadow-[0_0_20px_rgba(0,255,65,0.15)]'
              : 'text-white/50 hover:text-white/70 hover:bg-white/[0.02]'
          )}
        >
          <ScanIcon />
          X-RAY SCANNER
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'hide' && (
          <HideTab
            key="hide"
            status={stego.hideStatus}
            result={stego.hideResult}
            error={stego.error}
            secretText={secretText}
            onSecretTextChange={setSecretText}
            onProcess={stego.hideText}
            onReset={handleReset}
          />
        )}
        {activeTab === 'extract' && (
          <ExtractTab
            key="extract"
            status={stego.extractStatus}
            result={stego.extractResult}
            error={stego.error}
            onProcess={stego.extractText}
            onReset={handleReset}
          />
        )}
        {activeTab === 'xray' && (
          <XRayTab
            key="xray"
            status={steganalysis.status}
            result={steganalysis.result}
            error={steganalysis.error}
            onProcess={steganalysis.scanImage}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Hide Text Tab Component
interface HideTabProps {
  status: 'idle' | 'processing' | 'done' | 'error';
  result: ReturnType<typeof useSteganography>['hideResult'];
  error: string | null;
  secretText: string;
  onSecretTextChange: (text: string) => void;
  onProcess: (file: File, text: string) => Promise<any>;
  onReset: () => void;
}

const HideTab = ({ status, result, error, secretText, onSecretTextChange, onProcess, onReset }: HideTabProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const handleHide = useCallback(async () => {
    if (!selectedFile || !secretText.trim()) return;
    await onProcess(selectedFile, secretText);
  }, [selectedFile, secretText, onProcess]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.imageUrl;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [result]);

  const isDisabled = status === 'processing';

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    multiple: false,
    disabled: isDisabled || status === 'done',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Secret Text Input */}
      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-white/70">SECRET TEXT</label>
        <textarea
          value={secretText}
          onChange={(e) => onSecretTextChange(e.target.value)}
          placeholder="Enter secret message to hide..."
          disabled={isDisabled || status === 'done'}
          className="w-full rounded-lg bg-white/[0.02] backdrop-blur-xl ring-1 ring-white/10 px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-[#00FF41]/50 font-mono disabled:opacity-50 disabled:cursor-not-allowed resize-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          rows={3}
        />
        <p className="mt-1 text-[10px] text-white/40 font-mono">
          {secretText.length} characters • {new Blob([secretText]).size} bytes
        </p>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl ring-1 ring-dashed ring-white/10 bg-white/[0.02] backdrop-blur-xl transition-all',
          isDragActive && 'ring-[#00FF41] bg-[#00FF41]/5',
          isDisabled && 'cursor-wait ring-[#00FF41]/20',
          status === 'done' && 'cursor-default ring-[#00FF41]/50 bg-[#00FF41]/5'
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {status === 'idle' && !selectedFile && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-white/[0.02] p-4 ring-1 ring-white/10">
                  <UploadIcon className={cn('text-white/40 transition-colors', isDragActive && 'text-[#00FF41]')} />
                </div>
              </div>
              <p className="text-sm font-medium tracking-tight text-white/70">
                {isDragActive ? 'RELEASE TO BEGIN' : 'Drop image to hide text'}
              </p>
              <p className="mt-2 text-[10px] text-white/40 font-mono">
                PNG • JPG • WEBP
              </p>
              <p className="mt-1 text-[9px] text-white/30 font-mono">
                Output: PNG (Lossless)
              </p>
            </motion.div>
          )}

          {status === 'idle' && selectedFile && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#00FF41]/10 flex items-center justify-center ring-1 ring-[#00FF41]/50">
                  <LockIcon className="text-[#00FF41]" />
                </div>
                <h3 className="text-lg font-medium tracking-tight text-white/90">READY TO HIDE</h3>
                <p className="mt-1 text-[10px] text-white/50 font-mono">{selectedFile.name}</p>
                <p className="mt-1 text-[9px] text-white/40 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)}KB
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={handleHide}
                  disabled={!secretText.trim()}
                  className="rounded-md bg-[#00FF41] px-6 py-2 text-xs font-medium text-black hover:bg-[#00FF41]/90 transition-colors shadow-[0_0_20px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  INJECT PAYLOAD
                </motion.button>
                <motion.button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); onReset(); }}
                  className="rounded-md ring-1 ring-white/20 bg-white/[0.02] px-6 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.04] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  CANCEL
                </motion.button>
              </div>
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#00FF41]/20" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-[#00FF41]/50 border-t-[#00FF41] animate-spin" />
              </div>
              <p className="mt-6 text-xs font-medium tracking-widest text-[#00FF41] animate-pulse">
                INJECTING PAYLOAD...
              </p>
            </motion.div>
          )}

          {status === 'done' && result && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="z-10 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <motion.div
                  className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#00FF41]/10 flex items-center justify-center ring-1 ring-[#00FF41]/50"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
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
                <h3 className="text-2xl font-medium tracking-tight text-white/90">PAYLOAD HIDDEN</h3>
                <p className="mt-1 text-[10px] text-[#00FF41]/70 font-mono">
                  {result.bytesInjected} bytes injected • {result.filename}
                </p>
                <p className="mt-1 text-[9px] text-white/40 font-mono">
                  {(result.processedSize / 1024).toFixed(1)}KB
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={handleDownload}
                  className="rounded-md bg-[#00FF41] px-6 py-2 text-xs font-medium text-black hover:bg-[#00FF41]/90 transition-colors shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  DOWNLOAD
                </motion.button>
                <motion.button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); onReset(); }}
                  className="rounded-md ring-1 ring-white/20 bg-white/[0.02] px-6 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.04] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  NEW HIDING
                </motion.button>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              className="text-red-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-medium">ERROR</p>
              <p className="text-xs mt-1">{error}</p>
              <button onClick={() => { setSelectedFile(null); onReset(); }} className="mt-4 text-xs underline cursor-pointer">TRY AGAIN</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Extract Text Tab Component
interface ExtractTabProps {
  status: 'idle' | 'processing' | 'done' | 'error';
  result: ReturnType<typeof useSteganography>['extractResult'];
  error: string | null;
  onProcess: (file: File) => Promise<any>;
  onReset: () => void;
}

const ExtractTab = ({ status, result, error, onProcess, onReset }: ExtractTabProps) => {
  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await onProcess(acceptedFiles[0]);
    }
  }, [onProcess]);

  const isDisabled = status === 'processing';

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    multiple: false,
    disabled: isDisabled,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div
        {...getRootProps()}
        className={cn(
          'relative flex min-h-[400px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl ring-1 ring-dashed ring-white/10 bg-white/[0.02] backdrop-blur-xl transition-all',
          isDragActive && 'ring-[#00FF41] bg-[#00FF41]/5',
          isDisabled && 'cursor-wait ring-[#00FF41]/20',
          status === 'done' && 'cursor-default ring-[#00FF41]/50 bg-[#00FF41]/5'
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-white/[0.02] p-4 ring-1 ring-white/10">
                  <UploadIcon className={cn('text-white/40 transition-colors', isDragActive && 'text-[#00FF41]')} />
                </div>
              </div>
              <p className="text-sm font-medium tracking-tight text-white/70">
                {isDragActive ? 'RELEASE TO EXTRACT' : 'Drop image to extract hidden text'}
              </p>
              <p className="mt-2 text-[10px] text-white/40 font-mono">
                PNG • JPG • WEBP
              </p>
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#00FF41]/20" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-[#00FF41]/50 border-t-[#00FF41] animate-spin" />
              </div>
              <p className="mt-6 text-xs font-medium tracking-widest text-[#00FF41] animate-pulse">
                EXTRACTING PAYLOAD...
              </p>
            </motion.div>
          )}

          {status === 'done' && result && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full px-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <motion.div
                  className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#00FF41]/10 flex items-center justify-center ring-1 ring-[#00FF41]/50"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <UnlockIcon className="text-[#00FF41]" />
                </motion.div>
                <h3 className="text-2xl font-medium tracking-tight text-white/90">PAYLOAD EXTRACTED</h3>
                <p className="mt-1 text-[10px] text-[#00FF41]/70 font-mono">
                  {result.bytesExtracted} bytes extracted
                </p>
              </div>
              <div className="rounded-lg bg-black/40 ring-1 ring-white/10 p-4 mb-6 max-h-[200px] overflow-y-auto">
                <p className="text-sm text-white/90 font-mono whitespace-pre-wrap text-left break-words">
                  {result.secretText}
                </p>
              </div>
              <motion.button
                onClick={onReset}
                className="rounded-md ring-1 ring-white/20 bg-white/[0.02] px-6 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.04] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                NEW EXTRACTION
              </motion.button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              className="text-red-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-medium">ERROR</p>
              <p className="text-xs mt-1">{error}</p>
              <button onClick={onReset} className="mt-4 text-xs underline cursor-pointer">TRY AGAIN</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// X-Ray Scanner Tab Component
interface XRayTabProps {
  status: 'idle' | 'processing' | 'done' | 'error';
  result: ReturnType<typeof useSteganalysis>['result'];
  error: string | null;
  onProcess: (file: File) => Promise<any>;
  onReset: () => void;
}

const XRayTab = ({ status, result, error, onProcess, onReset }: XRayTabProps) => {
  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await onProcess(acceptedFiles[0]);
    }
  }, [onProcess]);

  const isDisabled = status === 'processing';

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    multiple: false,
    disabled: isDisabled,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div
        {...getRootProps()}
        className={cn(
          'relative flex min-h-[400px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl ring-1 ring-dashed ring-white/10 bg-white/[0.02] backdrop-blur-xl transition-all',
          isDragActive && 'ring-[#00FF41] bg-[#00FF41]/5',
          isDisabled && 'cursor-wait ring-[#00FF41]/20',
          status === 'done' && 'cursor-default ring-[#00FF41]/50 bg-[#00FF41]/5'
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-white/[0.02] p-4 ring-1 ring-white/10">
                  <UploadIcon className={cn('text-white/40 transition-colors', isDragActive && 'text-[#00FF41]')} />
                </div>
              </div>
              <p className="text-sm font-medium tracking-tight text-white/70">
                {isDragActive ? 'RELEASE TO SCAN' : 'Drop image to analyze LSB bit-plane'}
              </p>
              <p className="mt-2 text-[10px] text-white/40 font-mono">
                PNG • JPG • WEBP
              </p>
              <p className="mt-1 text-[9px] text-white/30 font-mono">
                Visualize hidden data patterns
              </p>
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#00FF41]/20" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-[#00FF41]/50 border-t-[#00FF41] animate-spin" />
              </div>
              <p className="mt-6 text-xs font-medium tracking-widest text-[#00FF41] animate-pulse">
                ANALYZING BIT-PLANE...
              </p>
            </motion.div>
          )}

          {status === 'done' && result && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full px-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <motion.div
                  className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#00FF41]/10 flex items-center justify-center ring-1 ring-[#00FF41]/50"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <ScanIcon className="text-[#00FF41]" />
                </motion.div>
                <h3 className="text-xl font-medium tracking-tight text-white/90">LSB BIT-PLANE</h3>
                
                {/* Verdict Badge */}
                {result.anomalyScore < ANOMALY_THRESHOLD ? (
                  <motion.div 
                    className="mt-4 mb-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-block px-6 py-3 rounded-lg bg-green-500/10 ring-2 ring-green-500/50">
                      <p className="text-lg font-bold tracking-tight text-green-400">
                        STATUS: CLEAN (Natural Noise)
                      </p>
                    </div>
                    <p className="mt-2 text-[11px] text-white/60 font-mono">
                      The digital dust looks random. No hidden data detected.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="mt-4 mb-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-block px-6 py-3 rounded-lg bg-red-500/10 ring-2 ring-red-500/70 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
                      <p className="text-lg font-bold tracking-tight text-red-400">
                        WARNING: ANOMALY DETECTED
                      </p>
                    </div>
                    <p className="mt-2 text-[11px] text-white/60 font-mono">
                      Unnatural mathematical patterns found. This image likely contains a hidden payload.
                    </p>
                  </motion.div>
                )}

                <p className="mt-2 text-[10px] text-white/50 font-mono">
                  {result.width}×{result.height} pixels
                </p>
                <p className="mt-1 text-[10px] text-[#00FF41]/70 font-mono">
                  Anomaly Score: {result.anomalyScore}%
                </p>
              </div>
              <div className="mb-4 rounded-lg overflow-hidden ring-1 ring-white/10 bg-black">
                <img
                  src={result.imageUrl}
                  alt="LSB Bit-plane Visualization"
                  className="w-full h-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <p className="mb-4 text-[10px] text-white/50 font-mono">
                White pixels = 1-bits • Black pixels = 0-bits
              </p>
              <motion.button
                onClick={onReset}
                className="rounded-md ring-1 ring-white/20 bg-white/[0.02] px-6 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.04] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                NEW SCAN
              </motion.button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              className="text-red-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-medium">ERROR</p>
              <p className="text-xs mt-1">{error}</p>
              <button onClick={onReset} className="mt-4 text-xs underline cursor-pointer">TRY AGAIN</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
