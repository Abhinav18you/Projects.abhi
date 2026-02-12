import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMetadataShredder } from './hooks/useMetadataShredder';

type SanitizeState = 'idle' | 'processing' | 'done';

type CompletedSanitization = {
  cleanBlob: Blob;
  cleanFileName: string;
  originalSize: number;
  cleanedSize: number;
};

const MIN_PROCESSING_MS = 1500;
const SHARED_IMAGE_ENDPOINT = '/shared-image';

const toCleanFileName = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf('.');

  if (dotIndex <= 0) {
    return `${fileName}_clean`;
  }

  const base = fileName.slice(0, dotIndex);
  const extension = fileName.slice(dotIndex);
  return `${base}_clean${extension}`;
};

const wait = (durationMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const triggerDownload = (blob: Blob, downloadName: string): void => {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ProcessingTerminalLog = ({ visibleLines, progress }: { visibleLines: number; progress: number }) => {
  const logLines = [
    <span key="detected">{'>'} DETECTED: iPHONE 14 PRO MAX</span>,
    <span key="gps" className="flex flex-wrap gap-2">
      <span>{'>'} GPS:</span>
      <span className="text-red-500/80 line-through">37.7749° N, 122.4194° W</span>
      <span className="text-zinc-500">[REMOVED]</span>
    </span>,
    <span key="iso">{'>'} ISO: 80</span>,
    <span key="aperture">{'>'} APERTURE: f/1.78</span>,
    <span key="scrub" className="text-neon font-semibold">{'>'} SCRUBBING EXIF DATA...</span>,
  ];

  return (
    <div className="space-y-6">
      <div className="mx-auto h-16 w-16 rounded-full border border-neon/40 p-1 shadow-[0_0_16px_rgba(0,255,65,0.25)]">
        <div className="relative grid h-full w-full place-items-center rounded-full border border-neon/70">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#00ff41 ${progress * 3.6}deg, rgba(0, 255, 65, 0.12) 0deg)`,
              WebkitMask: 'radial-gradient(circle at center, transparent 58%, black 60%)',
              mask: 'radial-gradient(circle at center, transparent 58%, black 60%)',
            }}
          />
          <svg viewBox="0 0 24 24" className="relative z-10 h-6 w-6 text-neon" fill="none" stroke="currentColor" strokeWidth="1.9">
            <rect x="5" y="11" width="14" height="10" rx="1.5" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
      </div>

      <div className="mx-auto w-full max-w-xl space-y-2 text-left text-[12px] uppercase tracking-[0.22em] text-neonSoft">
        <div className="flex items-center justify-between">
          <span>INCINERATING...</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-none bg-[#13243f]">
          <div className="h-full bg-neon transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-xl rounded-md border border-neon/20 bg-[#070d1a] p-4 text-left font-mono text-lg leading-relaxed text-zinc-300 shadow-[0_0_18px_rgba(0,255,65,0.12)]">
        <div className="space-y-1 text-sm md:text-base">
          {logLines.slice(0, visibleLines).map((line, idx) => (
            <p key={idx} className="animate-fadeInUp">
              {line}
            </p>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-zinc-500">PLEASE WAIT. THIS PROCESS HAPPENS ENTIRELY IN YOUR BROWSER.</p>
    </div>
  );
};

function App() {
  const { shredMetadata, isProcessing, error } = useMetadataShredder();
  const [sanitizeState, setSanitizeState] = useState<SanitizeState>('idle');
  const [statusMessage, setStatusMessage] = useState('DRAG IMAGE TO INCINERATE');
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [result, setResult] = useState<CompletedSanitization | null>(null);
  const [progress, setProgress] = useState(0);
  const [visibleLogLines, setVisibleLogLines] = useState(0);

  const sanitizeFile = useCallback(
    async (sourceFile: File) => {
      try {
        setShareFile(null);
        setResult(null);
        setProgress(5);
        setVisibleLogLines(0);
        setSanitizeState('processing');
        setStatusMessage('INCINERATING...');

        const processingStart = Date.now();
        const cleanBlob = await shredMetadata(sourceFile);
        const elapsedMs = Date.now() - processingStart;

        if (elapsedMs < MIN_PROCESSING_MS) {
          await wait(MIN_PROCESSING_MS - elapsedMs);
        }

        const cleanFileName = toCleanFileName(sourceFile.name);
        const cleanFile = new File([cleanBlob], cleanFileName, {
          type: sourceFile.type,
          lastModified: Date.now(),
        });

        setShareFile(cleanFile);
        setProgress(100);
        setResult({
          cleanBlob,
          cleanFileName,
          originalSize: sourceFile.size,
          cleanedSize: cleanBlob.size,
        });
        setSanitizeState('done');
        setStatusMessage('CLEAN.');
      } catch {
        setSanitizeState('idle');
        setProgress(0);
        setVisibleLogLines(0);
        setResult(null);
        setStatusMessage('UNABLE TO SANITIZE FILE. RETRY.');
      }
    },
    [shredMetadata],
  );

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const sourceFile = acceptedFiles[0];
      if (!sourceFile) {
        return;
      }

      await sanitizeFile(sourceFile);
    },
    [sanitizeFile],
  );

  useEffect(() => {
    const loadSharedTarget = async () => {
      const query = new URLSearchParams(window.location.search);
      if (!query.has('share-target')) {
        return;
      }

      try {
        const response = await fetch(SHARED_IMAGE_ENDPOINT);
        if (!response.ok) {
          setStatusMessage('NO SHARED IMAGE FOUND. TRY AGAIN.');
          return;
        }

        const sharedBlob = await response.blob();
        const headerFileName = response.headers.get('X-Shared-File-Name');
        const decodedName = headerFileName ? decodeURIComponent(headerFileName) : 'shared-image';
        const inferredType = sharedBlob.type || 'image/jpeg';
        const sharedFile = new File([sharedBlob], decodedName, { type: inferredType, lastModified: Date.now() });

        await sanitizeFile(sharedFile);
      } catch {
        setStatusMessage('SHARED IMAGE COULD NOT BE LOADED OFFLINE.');
      } finally {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    loadSharedTarget();
  }, [sanitizeFile]);

  useEffect(() => {
    if (sanitizeState !== 'processing') {
      return;
    }

    const progressTimer = window.setInterval(() => {
      setProgress((previous) => (previous >= 94 ? previous : previous + 4));
    }, 120);

    const logTimer = window.setInterval(() => {
      setVisibleLogLines((previous) => (previous >= 5 ? 5 : previous + 1));
    }, 320);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(logTimer);
    };
  }, [sanitizeState]);

  const handleDownload = useCallback(() => {
    if (!result) {
      return;
    }

    triggerDownload(result.cleanBlob, result.cleanFileName);
  }, [result]);

  const handleReset = useCallback(() => {
    setSanitizeState('idle');
    setStatusMessage('DRAG IMAGE TO INCINERATE');
    setProgress(0);
    setVisibleLogLines(0);
    setResult(null);
    setShareFile(null);
  }, []);

  const savedBytes = useMemo(() => {
    if (!result) {
      return 0;
    }

    return Math.max(0, result.originalSize - result.cleanedSize);
  }, [result]);

  const canShare = useMemo(() => {
    if (!shareFile || typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
      return false;
    }

    if (typeof navigator.canShare === 'function') {
      return navigator.canShare({ files: [shareFile] });
    }

    return true;
  }, [shareFile]);

  const handleShare = useCallback(async () => {
    if (!shareFile || !canShare) {
      return;
    }

    try {
      await navigator.share({
        files: [shareFile],
        title: 'Ghost Drop: Clean image',
        text: 'Metadata removed locally with Ghost Drop Web.',
      });
    } catch {
      // User cancellation is expected behavior for Web Share dialogs.
    }
  }, [canShare, shareFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: false,
    disabled: isProcessing,
    onDrop: handleDrop,
  });

  const zoneClasses = useMemo(
    () =>
      [
        'terminal-frame relative w-full max-w-5xl rounded-2xl border border-neon/70 bg-[#090909]/95 px-5 py-8 md:px-10 md:py-12 text-center transition duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        isDragActive && sanitizeState === 'idle' ? 'shadow-[0_0_30px_rgba(0,255,65,0.25)] border-neon' : '',
        isProcessing ? 'cursor-wait' : 'cursor-pointer',
      ]
        .filter(Boolean)
        .join(' '),
    [isDragActive, isProcessing, sanitizeState],
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 font-mono md:px-8 md:py-12">
        <header className="mb-10 text-center md:mb-14">
          <p className="mb-3 text-[11px] uppercase tracking-[0.6em] text-neonSoft/70">GHOST DROP WEB</p>
          <h1 className="text-balance text-5xl font-semibold uppercase leading-tight text-neon drop-shadow-[0_0_14px_rgba(0,255,65,0.45)] md:text-7xl">
            Ghost Drop: Incinerate
            <br />
            Your Metadata.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-zinc-400 md:text-lg">
            Drag an image below to start local-only sanitization. No uploads, no tracking, no cloud.
          </p>
        </header>

        <section className="flex flex-1 items-center justify-center pb-12">
          <div {...getRootProps({ className: zoneClasses, role: 'button', tabIndex: sanitizeState === 'idle' ? 0 : -1 })}>
            <input {...getInputProps()} />

            {sanitizeState === 'idle' ? (
              <div className="mx-auto max-w-2xl space-y-6">
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-neon/70 bg-[#050505] shadow-[0_0_16px_rgba(0,255,65,0.2)]">
                  <svg viewBox="0 0 24 24" className="h-10 w-10 text-neon" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 16V4" />
                    <path d="m7 9 5-5 5 5" />
                    <rect x="4" y="16" width="16" height="4" rx="1" />
                  </svg>
                </div>
                <p className="text-2xl font-medium uppercase tracking-[0.2em] text-neon md:text-3xl">
                  {isDragActive ? 'RELEASE FILE TO INCINERATE' : statusMessage}
                  <span className="ml-1 inline-block h-6 w-[2px] animate-pulse bg-neon align-middle" />
                </p>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">No Cloud. No Tracking. Client-Side Only.</p>
              </div>
            ) : null}

            {sanitizeState === 'processing' ? <ProcessingTerminalLog visibleLines={visibleLogLines} progress={progress} /> : null}

            {sanitizeState === 'done' && result ? (
              <div className="mx-auto max-w-xl space-y-6">
                <p className="text-6xl font-bold uppercase tracking-[0.25em] text-neon drop-shadow-[0_0_12px_rgba(0,255,65,0.4)]">CLEAN.</p>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                  SAVED {formatBytes(savedBytes)} • FINAL SIZE {formatBytes(result.cleanedSize)}
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full rounded-md border border-neon bg-neon px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-neonSoft sm:w-auto"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full rounded-md border border-neon/80 bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-neon transition hover:bg-neon/10 sm:w-auto"
                  >
                    Scan Another
                  </button>
                  {canShare ? (
                    <button
                      type="button"
                      onClick={handleShare}
                      className="w-full rounded-md border border-neonSoft/70 bg-[#050505] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-neonSoft transition hover:bg-neonSoft/10 sm:w-auto"
                    >
                      Share
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {error ? <p className="mt-4 text-sm uppercase tracking-[0.12em] text-red-400">{error}</p> : null}
          </div>
        </section>

        <footer className="border-t border-[#12243a] pt-5 text-center text-xs uppercase tracking-[0.2em] text-zinc-600">
          Open Source &amp; Client-Side. Your data never leaves this device.
        </footer>
      </main>
    </div>
  );
}

export default App;
