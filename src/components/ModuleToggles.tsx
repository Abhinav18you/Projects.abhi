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
      "relative cursor-pointer select-none rounded-xl bg-white/[0.02] p-5 backdrop-blur-xl overflow-hidden ring-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
      active 
        ? "ring-[#00FF41]/60 bg-[#00FF41]/10" 
        : "ring-white/10"
    )}
    whileHover={{ 
      scale: 1.02,
      y: -2,
    }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
  >
    <div className="flex items-start gap-4">
      {/* Icon */}
      <motion.div 
        className={cn(
          "p-2.5 rounded-lg ring-1 flex-shrink-0 transition-colors",
          active 
            ? "bg-[#00FF41]/20 text-[#00FF41] ring-[#00FF41]/40" 
            : "bg-white/[0.04] text-white/50 ring-white/10"
        )}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {icon}
      </motion.div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className={cn("text-sm font-medium tracking-tight", active ? "text-[#00FF41]" : "text-white/70")}>
              {label}
            </h3>
            <span className="text-[10px] text-white/40 font-mono">{subtitle}</span>
          </div>
          
          {/* Toggle Switch */}
          <motion.div 
            className={cn(
              "relative w-12 h-6 rounded-full cursor-pointer flex-shrink-0",
              active 
                ? "bg-[#00FF41]" 
                : "bg-white/10"
            )}
            animate={{
              boxShadow: active ? "0 0 15px rgba(0, 255, 65, 0.5)" : "none"
            }}
          >
            <motion.div 
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ left: active ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
            <span className={cn(
              "absolute text-[8px] font-medium top-1/2 -translate-y-1/2 transition-all",
              active ? "left-1.5 text-black" : "right-1 text-white/40"
            )}>
              {active ? "ON" : "OFF"}
            </span>
          </motion.div>
        </div>
        
        <p className="mt-2 text-xs leading-relaxed text-white/50">{description}</p>
      </div>
    </div>

    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-0 -z-10 bg-[#00FF41]/5"
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
