import { motion } from "framer-motion";
import { DeadDropView } from "../components/DeadDropView";
import { useDeadDrop } from "../hooks/useDeadDrop";

// Animated P2P Diagram with glowing data dot
const AnimatedP2PDiagram = ({ isConnected }: { isConnected: boolean }) => {
    return (
        <div className="flex items-center gap-4 p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-md">
            {/* Sender Browser */}
            <div className="flex flex-col items-center">
                <motion.div 
                    className="p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/50"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-emerald-400">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M3 8h18" />
                        <path d="M7 6h.01" />
                        <path d="M11 6h.01" />
                    </svg>
                </motion.div>
                <span className="text-[9px] text-zinc-500 font-mono mt-2 uppercase">Your Device</span>
            </div>

            {/* Animated Tunnel Line with Data Dot */}
            <div className="relative flex items-center">
                {/* Left line */}
                <div className="w-10 h-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-500/60"></div>
                
                {/* Glowing Data Dot - animates back and forth */}
                <motion.div
                    className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8),0_0_16px_rgba(52,211,153,0.4)]"
                    animate={{
                        x: [0, 60, 0],
                        opacity: [1, 0.7, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{ left: 0 }}
                />
                
                {/* Center Lock Icon */}
                <motion.div 
                    className={`p-2.5 rounded-lg border mx-2 transition-all duration-300 ${
                        isConnected 
                            ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.4)]" 
                            : "bg-emerald-500/10 border-emerald-500/30"
                    }`}
                    animate={isConnected ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                            "0 0 10px rgba(52,211,153,0.3)",
                            "0 0 25px rgba(52,211,153,0.6)",
                            "0 0 10px rgba(52,211,153,0.3)"
                        ]
                    } : {}}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${isConnected ? "text-emerald-400" : "text-emerald-500/70"}`}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </motion.div>
                
                {/* Right line */}
                <div className="w-10 h-0.5 bg-gradient-to-r from-emerald-500/60 to-emerald-500/20"></div>
            </div>

            {/* Receiver Browser */}
            <div className="flex flex-col items-center">
                <motion.div 
                    className="p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/50"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-emerald-400">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M3 8h18" />
                        <path d="M7 6h.01" />
                        <path d="M11 6h.01" />
                    </svg>
                </motion.div>
                <span className="text-[9px] text-zinc-500 font-mono mt-2 uppercase">Receiver</span>
            </div>
        </div>
    );
};

export const DeadDrop = () => {
    const { connection } = useDeadDrop();
    const isConnected = !!connection;

    return (
        <motion.div 
            className="h-full space-y-6 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header Section - Benefit over Feature */}
            <header className="text-center space-y-3 mb-6">
                <motion.h1 
                    className="text-2xl md:text-3xl font-bold tracking-tight text-white"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    Zero-Knowledge <span className="text-emerald-400">File Transfer</span>
                </motion.h1>
                <motion.p 
                    className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    Don't trust the cloud. Send files directly from your screen to theirs. 
                    No servers in the middle. No logs. The link self-destructs after the transfer.
                </motion.p>
            </header>

            {/* Animated P2P Diagram */}
            <motion.section 
                className="flex justify-center mb-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <AnimatedP2PDiagram isConnected={isConnected} />
            </motion.section>

            {/* Main Dead Drop Card with 3-Step Flow */}
            <motion.div 
                className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-8 min-h-[350px] backdrop-blur-md shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
            >
                <DeadDropView />
            </motion.div>

            {/* Additional Info Cards */}
            <motion.section 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
            >
                {[
                    { icon: "🔒", title: "End-to-End Encrypted", desc: "WebRTC with DTLS encryption" },
                    { icon: "⚡", title: "Direct Transfer", desc: "No intermediary servers" },
                    { icon: "💨", title: "One-Time Links", desc: "Auto-expires after transfer" },
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        className="p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm text-center transition-all hover:border-emerald-500/30 hover:bg-zinc-900/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + (i * 0.1) }}
                        whileHover={{ scale: 1.02, y: -2 }}
                    >
                        <div className="text-emerald-400 text-lg font-bold mb-1" role="img">{item.icon}</div>
                        <h4 className="text-xs font-bold text-zinc-300 mb-1">{item.title}</h4>
                        <p className="text-[10px] text-zinc-500">{item.desc}</p>
                    </motion.div>
                ))}
            </motion.section>
        </motion.div>
    );
};
