"use client";

import { useState } from "react";

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

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
      
      <div>
        <h2 className="text-xl font-semibold mb-1">Startup Profile</h2>
        <p className="text-xs text-gray-400">Enter the startup's current metrics to predict exit probability.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 relative group">
          <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
            Industry
          </label>
          <input 
            type="text" 
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="glass-input rounded-lg px-4 py-2 text-sm w-full"
            required 
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Country</label>
          <input 
            type="text" 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="glass-input rounded-lg px-4 py-2 text-sm w-full" 
            required
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-2 group">
        <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
          Months Active
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full lowercase ml-2">from founding</span>
        </label>
        <input 
          type="number" 
          min="0"
          value={monthsActive}
          onChange={(e) => setMonthsActive(parseInt(e.target.value) || 0)}
          className="glass-input rounded-lg px-4 py-2 text-sm w-full" 
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 group">
          <label className="text-xs text-gray-400 uppercase tracking-wider flex justify-between">
            <span>Total Funding</span>
            <span className="text-emerald-400 text-[10px] bg-emerald-400/10 px-1 rounded">USD</span>
          </label>
          <input 
            type="number" 
            min="0"
            value={totalFunding}
            onChange={(e) => setTotalFunding(parseInt(e.target.value) || 0)}
            className="glass-input rounded-lg px-4 py-2 text-sm w-full" 
            required
          />
        </div>
        <div className="flex flex-col gap-2 group">
          <label className="text-xs text-gray-400 uppercase tracking-wider flex justify-between">
            <span>Burn Rate</span>
            <span className="text-red-400 text-[10px] bg-red-400/10 px-1 rounded">Monthly</span>
          </label>
          <input 
            type="number"
            value={burnRate}
            onChange={(e) => setBurnRate(parseInt(e.target.value) || 0)}
            className="glass-input rounded-lg px-4 py-2 text-sm w-full" 
            required
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Co-investors</label>
        <input 
          type="number"
          min="0"
          value={coInvestors}
          onChange={(e) => setCoInvestors(parseInt(e.target.value) || 0)}
          className="glass-input rounded-lg px-4 py-2 text-sm w-full" 
          required
        />
      </div>
      
      <div className="mt-auto pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:transform-none flex justify-center items-center shadow-lg shadow-emerald-500/20"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Run AI Engine
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
