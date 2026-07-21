"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Sliders, Moon, Sun, Save } from "lucide-react";

export default function SettingsPage() {
  const [highThreshold, setHighThreshold] = useState(60);
  const [moderateThreshold, setModerateThreshold] = useState(40);
  const [darkMode, setDarkMode] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("settings");
    if (raw) {
      try {
        const s = JSON.parse(raw);
        setHighThreshold(s.highThreshold ?? 60);
        setModerateThreshold(s.moderateThreshold ?? 40);
        setDarkMode(s.darkMode ?? true);
      } catch {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      "settings",
      JSON.stringify({ highThreshold, moderateThreshold, darkMode })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 flex flex-col max-w-[900px] mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-400" />
          Settings
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Customize prediction thresholds and display preferences.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {/* Threshold Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-white text-lg">Viability Thresholds</h2>
          </div>
          <p className="text-gray-400 text-sm -mt-2">
            Adjust what constitutes "High Viability" vs "Moderate Risk" vs "High Risk".
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                High Viability Threshold (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={50}
                  max={90}
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(Number(e.target.value))}
                  className="flex-1 accent-emerald-400"
                />
                <span className="text-2xl font-black text-emerald-400 w-12 text-right">
                  {highThreshold}%
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Predictions above this score are labeled "High Viability"
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                Moderate Risk Threshold (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={20}
                  max={60}
                  value={moderateThreshold}
                  onChange={(e) => setModerateThreshold(Number(e.target.value))}
                  className="flex-1 accent-yellow-400"
                />
                <span className="text-2xl font-black text-yellow-400 w-12 text-right">
                  {moderateThreshold}%
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Predictions above this but below High are labeled "Moderate Risk"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Display Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-8 flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            {darkMode ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
            <h2 className="font-bold text-white text-lg">Display</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Dark Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Toggle between dark and light interface themes
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                darkMode ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold transition-all duration-300 ${
            saved
              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
              : "bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 text-white"
          }`}
        >
          <Save className="w-5 h-5" />
          {saved ? "Saved!" : "Save Settings"}
        </motion.button>
      </div>
    </div>
  );
}
