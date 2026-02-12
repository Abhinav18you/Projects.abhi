import { useEffect, useState } from "react";
import { useDeadDrop } from "../hooks/useDeadDrop";
import { useAppStore } from "../store/useAppStore";
import { logToTerminal } from "../utils/log";

export const DeadDropView = () => {
  const { fileState } = useAppStore();
  const { initializeDeadDrop, destroy, connection, connectToDeadDrop, incomingFile } = useDeadDrop();
  const [shareLink, setShareLink] = useState<string | null>(null);

  // Parse URL for ?peer=ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const peerParam = params.get("peer");
    if (peerParam) {
        connectToDeadDrop(peerParam);
    }
  }, [connectToDeadDrop]);

  const handleCreateLink = async () => {
    if (!fileState.result) return;
    try {
        const id = await initializeDeadDrop(fileState.result.blob, fileState.result.fileName);
        const link = `${window.location.origin}/dead-drop?peer=${id}`;
        setShareLink(link);
    } catch (e) {
        console.error(e);
    }
  };

  const copyLink = () => {
      if (shareLink) {
          navigator.clipboard.writeText(shareLink);
          logToTerminal("LINK COPIED TO CLIPBOARD.");
      }
  };

  const handleDownloadIncoming = () => {
      if (!incomingFile) return;
      const url = URL.createObjectURL(incomingFile.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = incomingFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  useEffect(() => {
      return () => destroy();
  }, [destroy]);

  // View for Receiver
  const params = new URLSearchParams(window.location.search);
  if (params.get("peer")) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
             <div className="rounded-full bg-zinc-900 p-4 shadow-lg ring-1 ring-zinc-800 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
             </div>
             <div>
                <h3 className="text-xl font-bold text-white">SECURE RECEIVER</h3>
                <p className="text-xs text-zinc-500 font-mono mt-1">ESTABLISHING P2P HANDSHAKE...</p>
             </div>

             {connection ? (
                 <div className="text-emerald-500 text-sm font-bold animate-pulse">CONNECTED TO PEER</div>
             ) : (
                 <div className="text-zinc-500 text-sm animate-pulse">SEARCHING FOR SIGNAL...</div>
             )}

             {incomingFile && (
                 <div className="mt-8 p-6 rounded-xl border border-emerald-500/30 bg-emerald-900/10 animate-in zoom-in-95">
                     <p className="text-white font-bold mb-2">PAYLOAD RECEIVED</p>
                     <p className="text-xs text-zinc-400 mb-4 font-mono">{incomingFile.name}</p>
                     <button
                        onClick={handleDownloadIncoming}
                        className="rounded-md bg-emerald-500 px-6 py-2 text-sm font-bold text-black hover:bg-emerald-400 transition-all"
                     >
                         DOWNLOAD FILE
                     </button>
                 </div>
             )}
        </div>
      );
  }

  // View for Sender
  if (!fileState.result) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="rounded-full bg-zinc-900/50 p-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
              </div>
              <div>
                <p className="text-zinc-500 text-sm font-medium">NO FILE READY FOR TRANSMISSION</p>
                <p className="text-zinc-600 text-xs mt-1">PROCESS A FILE IN INCINERATOR TO ENABLE DEAD DROP</p>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="text-center">
            <h3 className="text-lg font-bold text-white">SECURE P2P CHANNEL</h3>
            <p className="text-xs text-zinc-500 font-mono mt-1">
                FILE: {fileState.result.fileName}
            </p>
        </div>

        {!shareLink ? (
            <button
                onClick={handleCreateLink}
                className="rounded-md bg-emerald-500 px-8 py-3 text-sm font-bold text-black hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
                GENERATE DEAD DROP LINK
            </button>
        ) : (
            <div className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/10 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] text-emerald-500 font-mono uppercase tracking-widest">Secure Link Generated</p>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded bg-black/50 p-2 text-xs text-zinc-300 font-mono border border-zinc-800">
                            {shareLink}
                        </code>
                        <button onClick={copyLink} className="p-2 hover:text-white text-zinc-400 hover:bg-zinc-800 rounded transition-colors" title="Copy Link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-zinc-900/30 border border-dashed border-zinc-800">
                    {connection ? (
                        <div className="space-y-2">
                             <p className="text-emerald-500 text-xs font-bold animate-pulse">PEER CONNECTED</p>
                             <p className="text-zinc-500 text-[10px]">STREAMING DATA...</p>
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-xs animate-pulse">WAITING FOR PEER CONNECTION...</p>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};
