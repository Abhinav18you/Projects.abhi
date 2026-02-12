import { useAppStore } from "../store/useAppStore";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";

const Toggle = ({
  label,
  active,
  onClick,
  description
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  description: string;
}) => (
  <div
    onClick={onClick}
    className={cn(
      "relative cursor-pointer select-none rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-zinc-600",
      active && "border-emerald-500/50 bg-emerald-900/10"
    )}
  >
    <div className="flex items-center justify-between">
      <h3 className={cn("text-sm font-bold tracking-wider", active ? "text-emerald-400" : "text-zinc-400")}>
        {label}
      </h3>
      <div className={cn("h-2 w-2 rounded-full", active ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-zinc-800")} />
    </div>
    <p className="mt-2 text-[10px] leading-tight text-zinc-500">{description}</p>

    {active && (
      <motion.div
        layoutId="active-glow"
        className="absolute inset-0 -z-10 rounded-lg bg-emerald-500/5 blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    )}
  </div>
);

export const ModuleToggles = () => {
  const { modules, toggleModule } = useAppStore();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Toggle
        label="GHOST MODE"
        active={modules.disinformation}
        onClick={() => toggleModule('disinformation')}
        description="Injects disinformation (Fake GPS/Model) to poison data trackers."
      />
      <Toggle
        label="DIGITAL DUST"
        active={modules.digitalDust}
        onClick={() => toggleModule('digitalDust')}
        description="Breaks hash-based tracking by altering pixel values invisibly."
      />
    </div>
  );
};
