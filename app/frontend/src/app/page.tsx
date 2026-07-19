"use client";

import { useState } from "react";

export default function Home() {
  const [industry, setIndustry] = useState("SaaS");
  const [country, setCountry] = useState("USA");
  const [monthsActive, setMonthsActive] = useState(24);
  const [totalFunding, setTotalFunding] = useState(5000000);
  const [burnRate, setBurnRate] = useState(100000);
  const [coInvestors, setCoInvestors] = useState(3);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/v1/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industry,
          country,
          months_active: monthsActive,
          total_funding_usd: totalFunding,
          burn_rate_proxy: burnRate,
          co_investor_count: coInvestors,
        }),
      });
      const data = await response.json();
      setResult(data.success_probability);
    } catch (error) {
      console.error("Prediction failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-16 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          Startup Intelligence
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          AI-powered predictive engine for startup success probability and recommendations.
        </p>
      </header>

      <main className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        <form onSubmit={handlePredict} className="glass-panel rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
          <h2 className="text-xl font-semibold mb-2">Startup Profile</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Industry</label>
              <input 
                type="text" 
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="glass-input rounded-lg px-4 py-2 text-sm" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Country</label>
              <input 
                type="text" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="glass-input rounded-lg px-4 py-2 text-sm" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Months Active</label>
            <input 
              type="number" 
              value={monthsActive}
              onChange={(e) => setMonthsActive(parseInt(e.target.value))}
              className="glass-input rounded-lg px-4 py-2 text-sm" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Total Funding (USD)</label>
              <input 
                type="number" 
                value={totalFunding}
                onChange={(e) => setTotalFunding(parseInt(e.target.value))}
                className="glass-input rounded-lg px-4 py-2 text-sm" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Burn Rate</label>
              <input 
                type="number" 
                value={burnRate}
                onChange={(e) => setBurnRate(parseInt(e.target.value))}
                className="glass-input rounded-lg px-4 py-2 text-sm" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Co-investors</label>
            <input 
              type="number" 
              value={coInvestors}
              onChange={(e) => setCoInvestors(parseInt(e.target.value))}
              className="glass-input rounded-lg px-4 py-2 text-sm" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Predict Success"
            )}
          </button>
        </form>

        <div className="flex flex-col gap-8">
          <div className="glass-panel rounded-2xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[240px]">
            <h2 className="text-lg font-medium text-gray-300 mb-6 w-full text-left">Prediction Result</h2>
            
            {result !== null ? (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-300 to-blue-500 mb-2">
                  {(result * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-400">Success Probability</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 h-full">
                <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p>Run prediction to see results</p>
              </div>
            )}
          </div>
          
          <div className="glass-panel rounded-2xl p-8">
             <h2 className="text-lg font-medium text-gray-300 mb-4">Insights</h2>
             <p className="text-sm text-gray-400 leading-relaxed">
               The model uses CatBoost and FAISS to predict the likelihood of this startup reaching a successful exit or next funding round, comparing its metrics against historical data.
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
