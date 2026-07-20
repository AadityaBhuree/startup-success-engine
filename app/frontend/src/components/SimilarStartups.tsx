"use client";

import { motion } from "framer-motion";
import { Users, Activity } from "lucide-react";

export interface StartupRecommendation {
  name: string;
  similarity: number;
}

interface SimilarStartupsProps {
  startups: StartupRecommendation[] | null;
  loading: boolean;
}

export default function SimilarStartups({ startups, loading }: SimilarStartupsProps) {
  if (loading) {
    return (
      <div className="glass-panel p-6 h-full flex flex-col items-center justify-center min-h-[200px]">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-cyan-400"
              animate={{ y: ["0%", "-100%", "0%"] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-4 tracking-wider">Scanning vector database...</p>
      </div>
    );
  }

  if (!startups || startups.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="glass-panel p-6 relative overflow-hidden h-full flex flex-col">
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-cyan-400" />
        Top Neighbors
      </h2>
      
      <motion.div 
        className="flex flex-col gap-3 flex-1 justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {startups.map((startup, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 transition-colors cursor-default"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-900 to-indigo-900 flex items-center justify-center text-sm font-bold border border-cyan-500/20 shadow-inner">
                {startup.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-100">{startup.name}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Matched Entity</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-bold">
                  {(startup.similarity * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${startup.similarity * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
