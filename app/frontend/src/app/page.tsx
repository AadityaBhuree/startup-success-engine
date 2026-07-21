"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, ShieldAlert, CheckCircle2 } from "lucide-react";
import PredictionForm, { StartupFeatures } from "@/components/PredictionForm";
import FeatureExplanation from "@/components/FeatureExplanation";
import SimilarStartups, { StartupRecommendation } from "@/components/SimilarStartups";

export default function Dashboard() {
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [shapValues, setShapValues] = useState<Record<string, number> | null>(null);
  const [similarStartups, setSimilarStartups] = useState<StartupRecommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (features: StartupFeatures) => {
    setError(null);
    setLoadingPredict(true);
    setLoadingExplain(true);
    setLoadingRecommend(true);
    
    // Clear previous
    setPrediction(null);
    setShapValues(null);
    setSimilarStartups(null);
    
    try {
      const predRes = await fetch("/api/v1/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features),
      });
      if (!predRes.ok) throw new Error("Prediction failed");
      const predData = await predRes.json();
      const prob = predData.success_probability;
      setPrediction(prob);
      setLoadingPredict(false);

      // Persist to sessionStorage for Analytics page
      try {
        const label =
          prob > 0.6
            ? "High Viability"
            : prob > 0.4
            ? "Moderate Risk"
            : "High Risk";
        const entry = {
          industry: features.industry,
          country: features.country,
          score: prob,
          label,
          timestamp: new Date().toLocaleTimeString(),
        };
        const prev = JSON.parse(
          sessionStorage.getItem("prediction_history") || "[]"
        );
        sessionStorage.setItem(
          "prediction_history",
          JSON.stringify([...prev, entry])
        );
      } catch {}

      const fetchExplain = async () => {
        try {
          const expRes = await fetch("/api/v1/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(features),
          });
          if (expRes.ok) {
            const expData = await expRes.json();
            setShapValues(expData.shap_values);
          }
        } catch (e) {
          console.error("Explanation failed", e);
        } finally {
          setLoadingExplain(false);
        }
      };

      const fetchRecommend = async () => {
        try {
          const recRes = await fetch("/api/v1/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(features),
          });
          if (recRes.ok) {
            const recData = await recRes.json();
            setSimilarStartups(recData.similar_startups);
          }
        } catch (e) {
          console.error("Recommendation failed", e);
        } finally {
          setLoadingRecommend(false);
        }
      };

      await Promise.all([fetchExplain(), fetchRecommend()]);
    } catch (err: any) {
      console.error(err);
      setError("Neural engine disconnected. Check backend server.");
      setLoadingPredict(false);
      setLoadingExplain(false);
      setLoadingRecommend(false);
    }
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = prediction !== null ? circumference - (prediction * circumference) : circumference;

  return (
    <div className="min-h-screen p-4 lg:p-8 flex flex-col max-w-[1600px] mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
              Startup Success Engine
            </h1>
            <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Neural Network Online
            </p>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-6 py-4 rounded-xl flex items-center gap-3 backdrop-blur-md"
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="font-medium tracking-wide">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 flex-1">
        {/* Left Column - Input Form */}
        <div className="lg:col-span-4 flex flex-col h-[700px]">
          <PredictionForm onSubmit={handlePredict} loading={loadingPredict} />
        </div>

        {/* Right Column - Results Dashboard */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 h-[360px]">
            {/* Probability Score */}
            <div className="lg:col-span-2 glass-panel p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              
              <h2 className="absolute top-6 left-6 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Viability Score
              </h2>
              
              {loadingPredict ? (
                <div className="flex flex-col items-center justify-center h-full pt-6">
                  <div className="w-24 h-24 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                  <p className="mt-6 text-emerald-400 font-mono text-xs uppercase tracking-widest animate-pulse">Processing...</p>
                </div>
              ) : prediction !== null ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="flex flex-col items-center justify-center h-full pt-8 relative"
                >
                  <div className="relative flex items-center justify-center">
                    <svg className="w-56 h-56 transform -rotate-90">
                      {/* Background circle */}
                      <circle cx="112" cy="112" r="90" className="stroke-white/5" strokeWidth="12" fill="none" />
                      {/* Animated progress circle */}
                      <motion.circle 
                        cx="112" cy="112" r="90" 
                        className={prediction > 0.6 ? "stroke-emerald-400" : prediction > 0.4 ? "stroke-yellow-400" : "stroke-rose-400"}
                        strokeWidth="12" 
                        fill="none" 
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ filter: `drop-shadow(0 0 12px ${prediction > 0.6 ? 'rgba(52,211,153,0.6)' : prediction > 0.4 ? 'rgba(250,204,21,0.6)' : 'rgba(251,113,133,0.6)'})` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-white tracking-tighter">
                        <NumberTicker value={prediction * 100} />%
                      </span>
                    </div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className={`mt-6 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest flex items-center gap-2
                      ${prediction > 0.6 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                        prediction > 0.4 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'}
                    `}
                  >
                    {prediction > 0.6 ? <CheckCircle2 className="w-4 h-4" /> : null}
                    {prediction > 0.6 ? 'High Viability' : prediction > 0.4 ? 'Moderate Risk' : 'High Risk'}
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 pt-6">
                  <Terminal className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-sm font-medium tracking-widest uppercase">System Idle</p>
                </div>
              )}
            </div>
            
            {/* Similar Startups */}
            <div className="lg:col-span-3 h-[360px]">
              <SimilarStartups startups={similarStartups} loading={loadingRecommend} />
            </div>
          </div>

          {/* Bottom Row - Explanations */}
          <div className="h-[316px]">
            <FeatureExplanation shapValues={shapValues} loading={loadingExplain} />
          </div>
          
        </div>
      </div>
    </div>
  );
}

// Helper component for counting up numbers
function NumberTicker({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  
  // simple requestAnimationFrame counter
  React.useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    
    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * value));
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };
    
    requestAnimationFrame(updateCount);
  }, [value]);
  
  return <>{count}</>;
}
