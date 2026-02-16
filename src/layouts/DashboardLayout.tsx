import { ReactNode } from "react";
import { motion, Variants } from "framer-motion";
import { Sidebar } from "../components/Sidebar";
import { Terminal } from "../components/Terminal";

// Premium spring animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const mainVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const terminalVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div 
      className="relative flex h-screen w-full overflow-hidden bg-black text-white/90 font-sans selection:bg-emerald-500/30"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Background Glow - Massive blurred radial gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
      >
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00FF41]/5 rounded-full blur-[120px]"
        />
      </div>

      {/* Left Sidebar */}
      <motion.div variants={sidebarVariants}>
        <Sidebar />
      </motion.div>

      {/* Main Content */}
      <motion.main 
        className="flex-1 overflow-y-auto pl-64 pr-80 relative z-10"
        variants={mainVariants}
      >
        <div className="mx-auto h-full w-full max-w-4xl px-6 py-4">
            {children}
        </div>
      </motion.main>

      {/* Right Terminal Panel */}
      <motion.aside 
        className="fixed right-0 top-0 h-full w-80 bg-black/80 backdrop-blur-xl ring-1 ring-white/10 z-20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
        variants={terminalVariants}
      >
        <Terminal />
      </motion.aside>
    </motion.div>
  );
};
