import { DeadDropView } from "../components/DeadDropView";

// P2P Diagram Icons
const BrowserIcon = () => (
    <div className="flex flex-col items-center">
        <div className="p-2 rounded-lg bg-zinc-800/70 border border-zinc-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-emerald-400">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 8h18" />
                <path d="M7 6h.01" />
                <path d="M11 6h.01" />
            </svg>
        </div>
        <span className="text-[9px] text-zinc-500 font-mono mt-1">BROWSER</span>
    </div>
);

const EncryptedTunnelIcon = () => (
    <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
            <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-500"></div>
            <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-400">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            </div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-500/20"></div>
        </div>
        <span className="text-[9px] text-emerald-500/70 font-mono mt-1">ENCRYPTED</span>
    </div>
);

export const DeadDrop = () => (
    <div className="h-full space-y-6 py-6">
        {/* Header Section */}
        <header className="text-center space-y-3 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Secure P2P <span className="text-emerald-400">Dead Drop</span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Send files directly to another person's browser. No servers, no clouds, no logs. 
                The transfer link expires immediately after use.
            </p>
        </header>

        {/* Visual P2P Diagram */}
        <section className="flex justify-center mb-8">
            <div className="flex items-center gap-2 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-md">
                <BrowserIcon />
                <EncryptedTunnelIcon />
                <BrowserIcon />
            </div>
        </section>

        {/* Main Dead Drop Card */}
        <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-8 min-h-[350px] backdrop-blur-md shadow-lg">
            <DeadDropView />
        </div>

        {/* Additional Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm text-center">
                <div className="text-emerald-400 text-lg font-bold mb-1" role="img" aria-label="Lock icon">🔒</div>
                <h4 className="text-xs font-bold text-zinc-300 mb-1">End-to-End Encrypted</h4>
                <p className="text-[10px] text-zinc-500">WebRTC with DTLS encryption</p>
            </div>
            <div className="p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm text-center">
                <div className="text-emerald-400 text-lg font-bold mb-1" role="img" aria-label="Lightning bolt icon">⚡</div>
                <h4 className="text-xs font-bold text-zinc-300 mb-1">Direct Transfer</h4>
                <p className="text-[10px] text-zinc-500">No intermediary servers</p>
            </div>
            <div className="p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm text-center">
                <div className="text-emerald-400 text-lg font-bold mb-1" role="img" aria-label="Wind icon">💨</div>
                <h4 className="text-xs font-bold text-zinc-300 mb-1">One-Time Links</h4>
                <p className="text-[10px] text-zinc-500">Auto-expires after transfer</p>
            </div>
        </section>
    </div>
);
