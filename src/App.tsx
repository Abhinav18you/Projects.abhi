import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMetadataShredder } from './hooks/useMetadataShredder';

type SanitizeState = 'idle' | 'processing' | 'done';

const PROCESSING_DELAY_MS = 500;
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

function App() {
  const { shredMetadata, isProcessing, error } = useMetadataShredder();
  const [sanitizeState, setSanitizeState] = useState<SanitizeState>('idle');
  const [statusMessage, setStatusMessage] = useState('Drop image here to sanitize.');
  const [shareFile, setShareFile] = useState<File | null>(null);

  const sanitizeFile = useCallback(
    async (sourceFile: File) => {
      try {
        setShareFile(null);
        setSanitizeState('processing');
        setStatusMessage('Shredding metadata...');

        const [cleanBlob] = await Promise.all([shredMetadata(sourceFile), wait(PROCESSING_DELAY_MS)]);
        const cleanFileName = toCleanFileName(sourceFile.name);
        const cleanFile = new File([cleanBlob], cleanFileName, {
          type: sourceFile.type,
          lastModified: Date.now(),
        });

        triggerDownload(cleanBlob, cleanFileName);

        setShareFile(cleanFile);
        setSanitizeState('done');
        setStatusMessage('Clean! (GPS Removed)');
      } catch {
        setSanitizeState('idle');
        setStatusMessage('Unable to sanitize file. Try another image.');
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
          setStatusMessage('No shared image was found. Try sharing again.');
          return;
        }

        const sharedBlob = await response.blob();
        const headerFileName = response.headers.get('X-Shared-File-Name');
        const decodedName = headerFileName ? decodeURIComponent(headerFileName) : 'shared-image';
        const inferredType = sharedBlob.type || 'image/jpeg';
        const sharedFile = new File([sharedBlob], decodedName, { type: inferredType, lastModified: Date.now() });

        await sanitizeFile(sharedFile);
      } catch {
        setStatusMessage('Shared image could not be loaded offline.');
      } finally {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    loadSharedTarget();
  }, [sanitizeFile]);

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
        'w-full max-w-3xl rounded-2xl border border-neon/60 bg-zinc-950/70 p-8 text-center transition duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        isDragActive ? 'animate-pulseNeon border-neon shadow-neon' : 'hover:border-neonSoft/70',
        isProcessing ? 'cursor-wait opacity-90' : 'cursor-pointer',
      ].join(' '),
    [isDragActive, isProcessing],
  );

  return (
    <div className="min-h-screen bg-abyss text-zinc-100">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 font-mono">
        <header className="mb-12 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-neonSoft">Ghost Drop Web</p>
          <h1 className="text-balance text-4xl font-semibold leading-tight text-neon md:text-5xl">
            Ghost Drop: Incinerate Your Metadata.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 md:text-base">
            Drag an image below to start local-only sanitization. No uploads, no tracking, no cloud.
          </p>
        </header>

        <section className="flex flex-1 items-center justify-center pb-12">
          <div {...getRootProps({ className: zoneClasses, role: 'button', tabIndex: 0 })}>
            <input {...getInputProps()} />
            <div className="space-y-4">
              <p className="text-xl font-medium text-neon md:text-2xl">
                {isDragActive ? 'Drop now. Burn EXIF.' : statusMessage}
              </p>

              <p className="text-sm text-zinc-400">JPG, PNG, WEBP • Client-side only</p>

              {sanitizeState === 'processing' ? (
                <div className="mx-auto mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-zinc-900">
                  <div className="h-full w-full origin-left animate-pulse bg-neon/80" />
                </div>
              ) : null}

              {sanitizeState === 'done' && canShare ? (
                <button
                  type="button"
                  onClick={handleShare}
                  className="mx-auto inline-flex items-center rounded-md border border-neon/60 px-4 py-2 text-sm text-neon transition hover:border-neon hover:bg-neon/10"
                >
                  Share
                </button>
              ) : null}

              {error ? <p className="text-sm text-red-400">{error}</p> : null}
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-900 pt-5 text-center text-xs text-zinc-500">
          Open Source &amp; Client-Side. Your data never leaves this device.
        </footer>
      </main>
    </div>
  );
}

export default App;
