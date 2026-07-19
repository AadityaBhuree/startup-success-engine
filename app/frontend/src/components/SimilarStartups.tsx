"use client";

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
      <div className="glass-panel rounded-2xl p-6 h-full flex flex-col items-center justify-center min-h-[200px]">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-gray-400 text-sm mt-4">Finding comparable startups...</p>
      </div>
    );
  }

  if (!startups || startups.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden h-full">
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mb-10 pointer-events-none"></div>
      
      <h2 className="text-lg font-medium text-white mb-4">Similar Startups</h2>
      
      <div className="flex flex-col gap-3">
        {startups.map((startup, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-right-4"
            style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold border border-white/5">
                {startup.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-200">{startup.name}</span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 mb-1">Similarity</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${startup.similarity * 100}%` }}
                  />
                </div>
                <span className="text-xs text-emerald-400 font-medium">
                  {(startup.similarity * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
