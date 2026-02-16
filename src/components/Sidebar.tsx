import { Link, useLocation } from "wouter";
import { cn } from "../utils/cn";

// Navigation Icons
const IncineratorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const DeadDropIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4l2 2" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Logo/Brand Icon
const GhostLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
    <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
  </svg>
);

export const Sidebar = () => {
  const [location] = useLocation();

  const navItems = [
    { name: "INCINERATOR", path: "/", icon: <IncineratorIcon /> },
    { name: "DEAD DROP", path: "/dead-drop", icon: <DeadDropIcon /> },
    { name: "SETTINGS", path: "/settings", icon: <SettingsIcon /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-zinc-800/70 bg-black/95 text-zinc-400 backdrop-blur-md z-20">
      {/* Logo Section */}
      <div className="flex h-20 items-center border-b border-zinc-800/70 px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <GhostLogo />
          </div>
          <div>
            <span className="text-lg font-bold tracking-wider text-white block">GHOST DROP</span>
            <span className="text-[9px] text-emerald-500/80 font-mono">PRIVACY SHIELD</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4 mt-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-medium tracking-wide transition-all",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : "hover:bg-zinc-900 hover:text-zinc-100 border border-transparent"
              )}
            >
              <span className={cn(
                "transition-colors",
                isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
              )}>
                {item.icon}
              </span>
              {item.name}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] text-emerald-500 font-mono">SECURE MODE ACTIVE</span>
          </div>
          <p className="text-[9px] text-zinc-600 font-mono">All processing runs locally.<br/>No data leaves your browser.</p>
        </div>
        <p className="text-[10px] text-zinc-600 mt-4 text-center">v2.0.0-beta</p>
      </div>
    </aside>
  );
};
