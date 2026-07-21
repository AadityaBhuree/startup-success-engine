"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Globe, Factory } from "lucide-react";

interface PredictionEntry {
  industry: string;
  country: string;
  score: number;
  label: string;
  timestamp: string;
}

// Load from sessionStorage to persist across page navigations
function loadHistory(): PredictionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem("prediction_history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function AnalyticsPage() {
  const [history] = useState<PredictionEntry[]>(loadHistory);

  const avg =
    history.length > 0
      ? (history.reduce((s, h) => s + h.score, 0) / history.length) * 100
      : null;

  const highViability = history.filter((h) => h.score > 0.6).length;
  const topIndustry =
    history.length > 0
      ? Object.entries(
          history.reduce((acc: Record<string, number>, h) => {
            acc[h.industry] = (acc[h.industry] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  return (
    <div className="min-h-screen p-4 lg:p-8 flex flex-col max-w-[1400px] mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-indigo-400" />
          Analytics
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Session history of all predictions made.
        </p>
      </header>

      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-16 flex flex-col items-center justify-center text-center"
        >
          <BarChart2 className="w-16 h-16 text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No predictions yet</p>
          <p className="text-gray-600 text-sm mt-2">
            Run some predictions from the Dashboard to see analytics here.
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 flex flex-col gap-2"
            >
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Avg Viability Score
              </span>
              <span className="text-4xl font-black text-emerald-400">
                {avg !== null ? `${avg.toFixed(1)}%` : "—"}
              </span>
              <span className="text-xs text-gray-500">
                across {history.length} prediction{history.length !== 1 ? "s" : ""}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-6 flex flex-col gap-2"
            >
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                High Viability
              </span>
              <span className="text-4xl font-black text-cyan-400">
                {highViability}
              </span>
              <span className="text-xs text-gray-500">
                out of {history.length} total
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-6 flex flex-col gap-2"
            >
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                <Factory className="w-3.5 h-3.5 text-indigo-400" />
                Top Industry
              </span>
              <span className="text-3xl font-black text-indigo-400 truncate">
                {topIndustry ?? "—"}
              </span>
              <span className="text-xs text-gray-500">most predicted</span>
            </motion.div>
          </div>

          {/* History Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-panel overflow-hidden"
          >
            <div className="p-6 border-b border-white/5">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Prediction History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-3 text-left">Industry</th>
                    <th className="px-6 py-3 text-left">Country</th>
                    <th className="px-6 py-3 text-left">Score</th>
                    <th className="px-6 py-3 text-left">Label</th>
                    <th className="px-6 py-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history
                    .slice()
                    .reverse()
                    .map((entry, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-white">
                          {entry.industry}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {entry.country}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold">
                          <span
                            className={
                              entry.score > 0.6
                                ? "text-emerald-400"
                                : entry.score > 0.4
                                ? "text-yellow-400"
                                : "text-rose-400"
                            }
                          >
                            {(entry.score * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              entry.score > 0.6
                                ? "bg-emerald-500/20 text-emerald-400"
                                : entry.score > 0.4
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {entry.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {entry.timestamp}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
