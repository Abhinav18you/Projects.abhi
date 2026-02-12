import { useCallback } from "react";
import { DropZone } from "../components/DropZone";
import { ModuleToggles } from "../components/ModuleToggles";
import { BentoGrid, BentoItem } from "../components/BentoGrid";
import { useAppStore } from "../store/useAppStore";
import { useMetadataShredder } from "../hooks/useMetadataShredder";
import { useHasher } from "../hooks/useHasher";
import { useSpoofer } from "../hooks/useSpoofer";
import { logToTerminal } from "../utils/log";

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
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-white">INCINERATOR</h1>
                <p className="text-sm text-zinc-500">Secure Metadata Sanitization & Disinformation</p>
            </header>

            <BentoGrid className="p-0">
                <BentoItem colSpan={2} className="min-h-[300px] flex items-center justify-center relative">
                    <DropZone onDrop={handleDrop} />
                </BentoItem>

                <BentoItem>
                    <div className="h-full flex flex-col justify-between">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-zinc-400">STATUS</h3>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs text-emerald-500">SYSTEM ONLINE</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-zinc-600 space-y-1 font-mono">
                            <p>SECURE ENCLAVE: ACTIVE</p>
                            <p>NETWORK: OFFLINE (LOCAL)</p>
                            <p>MEM: 512MB ALLOCATED</p>
                            <p>UPTIME: {Math.floor(performance.now() / 1000)}s</p>
                        </div>
                    </div>
                </BentoItem>

                <BentoItem colSpan={3}>
                    <h3 className="mb-4 text-xs font-bold tracking-wider text-zinc-500">ACTIVE MODULES</h3>
                    <ModuleToggles />
                </BentoItem>
            </BentoGrid>
        </div>
    );
};
