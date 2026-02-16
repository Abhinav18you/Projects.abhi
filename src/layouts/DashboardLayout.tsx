import { ReactNode } from "react";
import { Sidebar } from "../components/Sidebar";
import { Terminal } from "../components/Terminal";

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pl-64 pr-80 relative z-10">
        <div className="mx-auto h-full w-full max-w-4xl px-6 py-4">
            {children}
        </div>
      </main>

      {/* Right Terminal Panel */}
      <aside className="fixed right-0 top-0 h-full w-80 bg-black/95 border-l border-zinc-800/50 z-20">
        <Terminal />
      </aside>
    </div>
  );
};
