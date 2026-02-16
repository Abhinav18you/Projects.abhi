import { ReactNode } from "react";
import { motion, Variants } from "framer-motion";
import { Sidebar } from "../components/Sidebar";
import { Terminal } from "../components/Terminal";

// Animation variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const mainVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const terminalVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div 
      className="flex h-screen w-full overflow-hidden bg-black text-zinc-100 font-sans selection:bg-emerald-500/30"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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
        className="fixed right-0 top-0 h-full w-80 bg-black/95 border-l border-zinc-800/50 z-20"
        variants={terminalVariants}
      >
        <Terminal />
      </motion.aside>
    </motion.div>
  );
};
