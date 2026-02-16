import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-white/[0.02] backdrop-blur-xl ring-1 ring-white/10 text-white/50 z-20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      {/* Logo Section */}
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-2 rounded-lg bg-[#00FF41]/10 text-[#00FF41] ring-1 ring-[#00FF41]/30 shadow-[0_0_15px_rgba(0,255,65,0.2)]"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <GhostLogo />
          </motion.div>
          <div>
            <span className="text-lg font-medium tracking-tight text-white/90 block">GHOST DROP</span>
            <span className="text-[9px] text-[#00FF41]/80 font-mono">PRIVACY SHIELD</span>
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
                "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-medium tracking-wide transition-all overflow-hidden",
                isActive 
                  ? "bg-[#00FF41]/10 text-[#00FF41] ring-1 ring-[#00FF41]/30 shadow-[inset_0_0_20px_rgba(0,255,65,0.1)]" 
                  : "hover:bg-white/[0.04] hover:text-white/90 ring-1 ring-transparent hover:ring-white/10"
              )}
            >
              {/* Background glow for active state */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#00FF41]/15 to-transparent"
                  layoutId="nav-glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <span className={cn(
                "relative z-10 transition-colors",
                isActive ? "text-[#00FF41]" : "text-white/50 group-hover:text-white/70"
              )}>
                {item.icon}
              </span>
              <span className="relative z-10">{item.name}</span>
              {isActive && (
                <motion.span 
                  className="ml-auto h-2 w-2 rounded-full bg-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.8),0_0_20px_rgba(0,255,65,0.4)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-3 rounded-lg bg-white/[0.02] ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-2 mb-2">
            <motion.div 
              className="h-2 w-2 rounded-full bg-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.8)]"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] text-[#00FF41] font-mono">SECURE MODE ACTIVE</span>
          </div>
          <p className="text-[9px] text-white/30 font-mono">All processing runs locally.</p>
          <p className="text-[9px] text-white/30 font-mono">No data leaves your browser.</p>
        </div>
        <p className="text-[10px] text-white/30 mt-4 text-center">v2.0.0-beta</p>
      </div>
    </aside>
  );
};
