import { useCallback } from "react";
import { motion } from "framer-motion";
import { DropZone } from "../components/DropZone";
import { ModuleToggles } from "../components/ModuleToggles";
import { useAppStore } from "../store/useAppStore";
import { useMetadataShredder } from "../hooks/useMetadataShredder";
import { useHasher } from "../hooks/useHasher";
import { useSpoofer } from "../hooks/useSpoofer";
import { logToTerminal } from "../utils/log";

// Icons for "How It Works" section
const DragIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
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

export const Incinerator = () => {
    const { modules, setFileState } = useAppStore();
    const { shredMetadata } = useMetadataShredder();
    const { applyDigitalDust } = useHasher();
    const { injectSpoofing } = useSpoofer();

    const processFile = useCallback(async (file: File) => {
        try {
            // Reset state
            setFileState({
                originalFile: file,
                status: 'processing',
                result: null,
                error: null
            });

            logToTerminal(`INITIATING INCINERATION SEQUENCE FOR: ${file.name.toUpperCase()}`);
            logToTerminal(`SIZE: ${(file.size / 1024).toFixed(2)} KB | TYPE: ${file.type.toUpperCase()}`);

            let currentBlob: Blob = file;

            // 1. Digital Dust (Hash Breaking)
            if (modules.digitalDust) {
                currentBlob = await applyDigitalDust(currentBlob);
            }

            // 2. Metadata Shredder (Standard)
            logToTerminal("SCRUBBING METADATA LAYERS...");
            currentBlob = await shredMetadata(currentBlob);

            // 3. Ghost Mode (Spoofing)
            if (modules.disinformation) {
                 currentBlob = await injectSpoofing(currentBlob);
            }

            // Final Result
            const finalFileName = `clean_${file.name}`;
            setFileState({
                status: 'done',
                result: {
                    blob: currentBlob,
                    fileName: finalFileName,
                    originalSize: file.size,
                    finalSize: currentBlob.size,
                    fakeMetadata: modules.disinformation ? { gps: 'AREA 51', model: 'NOKIA 3310' } : undefined
                }
            });
            logToTerminal("SEQUENCE COMPLETE. ARTIFACT SECURED.");

        } catch (error) {
            console.error(error);
            logToTerminal(`CRITICAL ERROR: ${error instanceof Error ? error.message : 'UNKNOWN'}`);
            setFileState({ status: 'error', error: 'PROCESSING FAILED' });
        }
    }, [modules, setFileState, shredMetadata, applyDigitalDust, injectSpoofing]);

    const handleDrop = useCallback((files: File[]) => {
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

    return (
        <div className="space-y-8 py-6">
            {/* Hero Section - Value Proposition */}
            <header className="text-center space-y-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white/90 leading-tight">
                    <span className="block">Your Photos Are Spying On You.</span>
                    <span className="text-[#00FF41]">Stop Them.</span>
                </h1>
                <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto leading-relaxed">
                    Ghost Drop is a client-side privacy shield. We strip hidden metadata, 
                    spoof your location, and break tracking hashes before you share.
                </p>
            </header>

            {/* How It Works - 3-Step Diagram */}
            <section className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {[
                        { icon: <DragIcon />, step: "STEP 1", title: "Drop Image", desc: "Runs locally in your browser" },
                        { icon: <ShieldIcon />, step: "STEP 2", title: "Incinerate & Spoof", desc: "Apply privacy layers" },
                        { icon: <DownloadIcon />, step: "STEP 3", title: "Share Freely", desc: "Untraceable file" },
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
                <DropZone onDrop={handleDrop} />
            </motion.section>

            {/* Module Toggles Section */}
            <motion.section 
                className="rounded-xl bg-white/[0.02] backdrop-blur-xl ring-1 ring-white/10 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.4 }}
            >
                <h3 className="mb-6 text-xs font-medium tracking-wider text-white/50 uppercase">Privacy Modules</h3>
                <ModuleToggles />
            </motion.section>
        </div>
    );
};
