"use client";

import { useState } from "react";
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
    
    // Clear previous results visually before fetching new ones
    setPrediction(null);
    setShapValues(null);
    setSimilarStartups(null);
    
    try {
      // 1. Predict
      const predRes = await fetch("/api/v1/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features),
      });
      if (!predRes.ok) throw new Error("Prediction failed");
      const predData = await predRes.json();
      setPrediction(predData.success_probability);
      setLoadingPredict(false);

      // 2. Explain (Run concurrently with recommend)
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

      // 3. Recommend (Run concurrently with explain)
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
      setError("An error occurred while communicating with the AI Engine.");
      setLoadingPredict(false);
      setLoadingExplain(false);
      setLoadingRecommend(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Workspace Overview</h1>
        <p className="text-gray-400">Analyze startup metrics and predict success probabilities in real-time.</p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column - Input Form */}
        <div className="lg:col-span-5 flex flex-col h-[600px]">
          <PredictionForm onSubmit={handlePredict} loading={loadingPredict} />
        </div>

        {/* Right Column - Results Dashboard */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Top Row - Score & Similar Startups */}
          <div className="grid sm:grid-cols-2 gap-8 h-full">
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[250px]">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-6 w-full text-left">
                Success Probability
              </h2>
              
              {loadingPredict ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                </div>
              ) : prediction !== null ? (
                <div className="animate-in zoom-in duration-500 flex flex-col items-center">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="60" className="stroke-white/10" strokeWidth="8" fill="none" />
                      <circle 
                        cx="64" cy="64" r="60" 
                        className="stroke-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" 
                        strokeWidth="8" fill="none" 
                        strokeDasharray="377" 
                        strokeDashoffset={377 - (377 * prediction)} 
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black text-white">{(prediction * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <p className="mt-4 text-emerald-400 font-medium bg-emerald-400/10 px-3 py-1 rounded-full text-sm">
                    {prediction > 0.7 ? 'High Potential' : prediction > 0.4 ? 'Moderate Risk' : 'High Risk'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 opacity-50">
                  <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-sm">Awaiting inputs...</p>
                </div>
              )}
            </div>
            
            <div className="h-[250px]">
              <SimilarStartups startups={similarStartups} loading={loadingRecommend} />
            </div>
          </div>

          {/* Bottom Row - Explanations */}
          <div className="h-[318px]">
            <FeatureExplanation shapValues={shapValues} loading={loadingExplain} />
          </div>
          
        </div>
      </div>
    </div>
  );
}
