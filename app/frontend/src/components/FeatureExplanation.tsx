"use client";

import { motion } from "framer-motion";
import { GitMerge } from "lucide-react";

interface FeatureExplanationProps {
  shapValues: Record<string, number> | null;
  loading: boolean;
}

export default function FeatureExplanation({ shapValues, loading }: FeatureExplanationProps) {
  if (loading) {
    return (
      <div className="glass-panel p-6 h-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="flex gap-1 items-end h-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="w-2 bg-indigo-500 rounded-t-sm"
              animate={{ height: ["20%", "100%", "20%"] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-4 tracking-widest uppercase">Calculating SHAP Matrix...</p>
      </div>
    );
  }

  if (!shapValues) {
    return (
      <div className="glass-panel p-6 h-full flex flex-col items-center justify-center text-center text-gray-500 min-h-[300px]">
        <GitMerge className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm tracking-widest uppercase">Awaiting Neural Input</p>
      </div>
    );
  }

  const formatName = (key: string) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const maxAbsValue = Math.max(...Object.values(shapValues).map(v => Math.abs(v)), 0.1);
  const entries = Object.entries(shapValues).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="glass-panel p-6 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mt-10"></div>
      
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <GitMerge className="w-5 h-5 text-indigo-400" />
        Feature Attributions
      </h2>
      
      <motion.div 
        className="flex flex-col gap-5 flex-1 justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {entries.map(([key, value]) => {
          const isPositive = value > 0;
          const percentage = (Math.abs(value) / maxAbsValue) * 100;
          
          return (
            <motion.div key={key} variants={itemVariants} className="flex flex-col gap-2 group cursor-default">
              <div className="flex justify-between items-end text-xs">
                <span className="text-gray-300 font-semibold tracking-wider group-hover:text-white transition-colors">
                  {formatName(key)}
                </span>
                <span className={`font-mono font-bold ${isPositive ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]"}`}>
                  {isPositive ? "+" : ""}{value.toFixed(3)}
                </span>
              </div>
              
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden flex relative shadow-inner">
                {/* Center zero line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/30 z-10" />
                
                <div className="w-1/2 flex justify-end pr-1">
                  {!isPositive && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 15 }}
                      className="h-full bg-gradient-to-l from-rose-500 to-rose-400 rounded-l-full shadow-[0_0_10px_rgba(251,113,133,0.5)]"
                    />
                  )}
                </div>
                <div className="w-1/2 pl-1">
                  {isPositive && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 15 }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-r-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
