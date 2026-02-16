import { useAppStore } from "../store/useAppStore";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

// Icons for module cards
const GhostIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
    <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
  </svg>
);

const DustIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    <path d="M13 13l6 6" />
  </svg>
);

const Toggle = ({
  label,
  subtitle,
  active,
  onClick,
  description,
  icon
}: {
  label: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
  description: string;
  icon: React.ReactNode;
}) => (
  <motion.div
    onClick={onClick}
    className={cn(
      "relative cursor-pointer select-none rounded-xl border bg-zinc-900/50 p-5 backdrop-blur-md overflow-hidden",
      active 
        ? "border-emerald-500/60 bg-emerald-900/20" 
        : "border-zinc-800/70"
    )}
    whileHover={{ 
      scale: 1.02,
      y: -2,
      borderColor: active ? "rgba(52, 211, 153, 0.6)" : "rgba(52, 211, 153, 0.3)",
      boxShadow: active 
        ? "0 0 30px rgba(52, 211, 153, 0.25), 0 0 60px rgba(52, 211, 153, 0.1)"
        : "0 0 20px rgba(52, 211, 153, 0.1), 0 0 40px rgba(52, 211, 153, 0.05)"
    }}
    transition={{ type: "spring", stiffness: 400, damping: 15 }}
  >
    <div className="flex items-start gap-4">
      {/* Icon */}
      <motion.div 
        className={cn(
          "p-2.5 rounded-lg ring-1 flex-shrink-0 transition-colors",
          active 
            ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/40" 
            : "bg-zinc-800/50 text-zinc-500 ring-zinc-700/50"
        )}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {icon}
      </motion.div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className={cn("text-sm font-bold tracking-wide", active ? "text-emerald-400" : "text-zinc-300")}>
              {label}
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">{subtitle}</span>
          </div>
          
          {/* Toggle Switch */}
          <motion.div 
            className={cn(
              "relative w-12 h-6 rounded-full cursor-pointer flex-shrink-0",
              active 
                ? "bg-emerald-500" 
                : "bg-zinc-700"
            )}
            animate={{
              boxShadow: active ? "0 0 15px rgba(52, 211, 153, 0.5)" : "none"
            }}
          >
            <motion.div 
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ left: active ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
            <span className={cn(
              "absolute text-[8px] font-bold top-1/2 -translate-y-1/2 transition-all",
              active ? "left-1.5 text-emerald-900" : "right-1 text-zinc-400"
            )}>
              {active ? "ON" : "OFF"}
            </span>
          </motion.div>
        </div>
        
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">{description}</p>
      </div>
    </div>

    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-0 -z-10 bg-emerald-500/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </AnimatePresence>
  </motion.div>
);

export const ModuleToggles = () => {
  const { modules, toggleModule } = useAppStore();

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Toggle
        label="GHOST MODE"
        subtitle="Location Spoofing"
        active={modules.disinformation}
        onClick={() => toggleModule('disinformation')}
        description="Don't just hide your location—lie about it. Injects fake GPS data (e.g., Null Island) to poison data broker profiles."
        icon={<GhostIcon />}
      />
      <Toggle
        label="DIGITAL DUST"
        subtitle="Anti-Fingerprinting"
        active={modules.digitalDust}
        onClick={() => toggleModule('digitalDust')}
        description="Makes your image invisible to reverse-image search engines by invisibly altering pixel data to change its unique file hash."
        icon={<DustIcon />}
      />
    </div>
  );
};
