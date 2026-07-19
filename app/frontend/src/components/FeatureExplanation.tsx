"use client";

interface FeatureExplanationProps {
  shapValues: Record<string, number> | null;
  loading: boolean;
}

export default function FeatureExplanation({ shapValues, loading }: FeatureExplanationProps) {
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-full flex flex-col items-center justify-center min-h-[250px]">
        <span className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></span>
        <p className="text-gray-400 text-sm">Analyzing feature impact...</p>
      </div>
    );
  }

  if (!shapValues) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center text-gray-500 min-h-[250px]">
        <svg className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">Run prediction to see feature impact</p>
      </div>
    );
  }

  // Format feature names
  const formatName = (key: string) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Find max absolute value to scale the bars
  const maxAbsValue = Math.max(...Object.values(shapValues).map(v => Math.abs(v)), 0.1);

  const entries = Object.entries(shapValues).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <h2 className="text-lg font-medium text-white mb-6">Key Drivers</h2>
      
      <div className="flex flex-col gap-4 flex-1 justify-center">
        {entries.map(([key, value]) => {
          const isPositive = value > 0;
          const percentage = (Math.abs(value) / maxAbsValue) * 100;
          
          return (
            <div key={key} className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">{formatName(key)}</span>
                <span className={isPositive ? "text-emerald-400" : "text-red-400"}>
                  {isPositive ? "+" : ""}{value.toFixed(3)}
                </span>
              </div>
              
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                <div className="w-1/2 flex justify-end">
                  {!isPositive && (
                    <div 
                      className="h-full bg-gradient-to-l from-red-500 to-orange-500 rounded-l-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                </div>
                <div className="w-[1px] bg-white/20 z-10" />
                <div className="w-1/2">
                  {isPositive && (
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-r-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
