import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";

export const BentoGrid = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-min gap-4 p-4", className)}>
      {children}
    </div>
  );
};

export const BentoItem = ({
  children,
  className,
  colSpan = 1,
  rowSpan = 1
}: {
  children?: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}) => {
    return (
        <motion.div 
            className={cn(
                "relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm transition-colors",
                colSpan === 2 && "md:col-span-2",
                colSpan === 3 && "md:col-span-3",
                rowSpan === 2 && "row-span-2",
                className
            )}
            whileHover={{ 
                scale: 1.02,
                borderColor: "rgba(52, 211, 153, 0.4)",
                boxShadow: "0 0 25px rgba(52, 211, 153, 0.15), 0 0 50px rgba(52, 211, 153, 0.05)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
            {children}
        </motion.div>
    );
}
