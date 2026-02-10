import { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

function App() {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: false,
  });

  const zoneClasses = useMemo(
    () =>
      [
        'w-full max-w-3xl rounded-2xl border border-neon/60 bg-zinc-950/70 p-8 text-center transition duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        isDragActive ? 'animate-pulseNeon border-neon shadow-neon' : 'hover:border-neonSoft/70',
      ].join(' '),
    [isDragActive],
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
            <div className="space-y-3">
              <p className="text-xl font-medium text-neon md:text-2xl">
                {isDragActive ? 'Drop now. Burn EXIF.' : 'Drop image here to sanitize.'}
              </p>
              <p className="text-sm text-zinc-400">JPG, PNG, WEBP • Client-side only</p>
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
