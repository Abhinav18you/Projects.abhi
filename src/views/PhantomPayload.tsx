import { motion } from "framer-motion";

export const PhantomPayload = () => (
  <motion.div 
    className="h-full"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <header className="mb-8">
      <h1 className="text-2xl font-medium tracking-tight text-white/90">PHANTOM PAYLOAD</h1>
      <p className="text-sm text-white/50">Encrypted file transfer</p>
    </header>
    <div className="rounded-xl ring-1 ring-white/10 bg-white/[0.02] backdrop-blur-xl p-8 text-white/50 font-mono text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      &gt; PHANTOM PAYLOAD MODULE INITIALIZING...<br/>
      &gt; ENCRYPTED P2P TRANSFER SYSTEM<br/>
      &gt; COMING SOON IN PHASE 2.
    </div>
  </motion.div>
);
