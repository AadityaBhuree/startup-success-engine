"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Factory, Globe, Calendar, DollarSign, Flame, Users } from "lucide-react";

export interface StartupFeatures {
  industry: string;
  country: string;
  months_active: number;
  total_funding_usd: number;
  burn_rate_proxy: number;
  co_investor_count: number;
}

interface PredictionFormProps {
  onSubmit: (features: StartupFeatures) => Promise<void>;
  loading: boolean;
}

export default function PredictionForm({ onSubmit, loading }: PredictionFormProps) {
  const [industry, setIndustry] = useState("SaaS");
  const [country, setCountry] = useState("USA");
  const [monthsActive, setMonthsActive] = useState(24);
  const [totalFunding, setTotalFunding] = useState(5000000);
  const [burnRate, setBurnRate] = useState(100000);
  const [coInvestors, setCoInvestors] = useState(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (monthsActive < 0 || totalFunding < 0) return;
    
    await onSubmit({
      industry,
      country,
      months_active: monthsActive,
      total_funding_usd: totalFunding,
      burn_rate_proxy: burnRate,
      co_investor_count: coInvestors,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.form 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit} 
      className="glass-panel p-8 flex flex-col gap-6 relative h-full group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-cyan-400" />
          Target Startup
        </h2>
        <p className="text-sm text-gray-400">Configure parameters to run predictive models.</p>
      </motion.div>
      
      <div className="grid grid-cols-2 gap-5 mt-2">
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
            <Factory className="w-3.5 h-3.5 text-gray-500" />
            Industry
          </label>
          <input 
            type="text" 
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="glass-input rounded-xl px-4 py-3 text-sm w-full font-medium"
            required 
          />
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-gray-500" />
            Country
          </label>
          <input 
            type="text" 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="glass-input rounded-xl px-4 py-3 text-sm w-full font-medium" 
            required
          />
        </motion.div>
      </div>
      
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          Months Active
        </label>
        <input 
          type="number" 
          min="0"
          value={monthsActive}
          onChange={(e) => setMonthsActive(parseInt(e.target.value) || 0)}
          className="glass-input rounded-xl px-4 py-3 text-sm w-full font-medium" 
          required
        />
      </motion.div>
      
      <div className="grid grid-cols-2 gap-5">
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2" title="Total USD capital raised to date">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              Funding
            </div>
          </label>
          <input 
            type="number" 
            min="0"
            step="100000"
            value={totalFunding}
            onChange={(e) => setTotalFunding(parseInt(e.target.value) || 0)}
            className="glass-input rounded-xl px-4 py-3 text-sm w-full font-medium" 
            required
          />
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2" title="Monthly net cash burn rate proxy">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Burn Rate
          </label>
          <input 
            type="number"
            step="10000"
            value={burnRate}
            onChange={(e) => setBurnRate(parseInt(e.target.value) || 0)}
            className="glass-input rounded-xl px-4 py-3 text-sm w-full font-medium" 
            required
          />
        </motion.div>
      </div>

      {/* Runway Calculator Widget */}
      {burnRate > 0 && (
        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Estimated Runway:</span>
          <span className={`font-mono font-bold ${
            (totalFunding / burnRate) >= 18 ? "text-emerald-400" :
            (totalFunding / burnRate) >= 12 ? "text-yellow-400" : "text-rose-400"
          }`}>
            {(totalFunding / burnRate).toFixed(1)} months
          </span>
        </motion.div>
      )}
      
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2" title="Number of participating syndicate VC co-investors">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          Co-investors
        </label>
        <input 
          type="number"
          min="0"
          value={coInvestors}
          onChange={(e) => setCoInvestors(parseInt(e.target.value) || 0)}
          className="glass-input rounded-xl px-4 py-3 text-sm w-full font-medium" 
          required
        />
      </motion.div>
      
      <motion.div variants={itemVariants} className="mt-auto pt-6">
        <motion.button 
          type="submit" 
          disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          className="w-full relative overflow-hidden group/btn bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex justify-center items-center gap-3">
              <span className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></span>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Rocket className="w-4 h-4 text-cyan-400 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              Engage Neural Network
            </span>
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
