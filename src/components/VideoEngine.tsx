import { useState } from "react";
import { motion } from "motion/react";
import { Play, Clock, BarChart2, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function VideoEngine() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    toast.info("Generating custom video...");
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Video generated successfully!");
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white font-display">AI Market Video Engine</h2>
          <p className="text-zinc-400 text-sm mt-1">Auto-generated, visually rich market updates from real-time data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          onClick={() => toast.info("Playing Daily Market Wrap")}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 relative group rounded-2xl overflow-hidden border border-indigo-500/30 bg-zinc-900 aspect-video flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(79,70,229,0.1)]"
        >
          {/* Placeholder for video player */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-indigo-900/20 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop" 
            alt="Market Dashboard" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          
          <div className="relative z-20 flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-600/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(79,70,229,0.5)] group-hover:scale-110 transition-transform duration-300">
              <Play fill="currentColor" size={24} className="ml-1" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white drop-shadow-md font-display">Daily Market Wrap</h3>
            <p className="text-indigo-200 mt-2 font-medium drop-shadow-md">Nifty 50 hits new ATH | FIIs turn net buyers</p>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-md text-xs font-medium text-zinc-200 border border-white/10 flex items-center gap-1.5">
                <Clock size={12} /> 01:24
              </span>
              <span className="px-2.5 py-1 bg-indigo-500/20 backdrop-blur-md rounded-md text-xs font-medium text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles size={12} /> AI Generated
              </span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-zinc-100 font-display">Latest Generated Shorts</h3>
          
          {[
            { title: "Sector Rotation: IT vs Pharma", duration: "0:45", views: "1.2k", icon: BarChart2, color: "text-blue-400", bg: "bg-blue-400/10" },
            { title: "FII/DII Flow Visualization", duration: "0:58", views: "3.4k", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { title: "Upcoming IPO Tracker: Swiggy", duration: "1:15", views: "5.6k", icon: Play, color: "text-indigo-400", bg: "bg-indigo-400/10" }
          ].map((video, i) => (
            <motion.div 
              key={i} 
              onClick={() => toast.info(`Playing ${video.title}`)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/80 hover:border-indigo-500/30 transition-all cursor-pointer group"
            >
              <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                <div className={`absolute inset-0 flex items-center justify-center ${video.bg}`}>
                  <video.icon size={20} className={`${video.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white font-medium">
                  {video.duration}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="text-sm font-medium text-zinc-200 line-clamp-2 group-hover:text-indigo-400 transition-colors">{video.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">{video.views} views • AI Generated</p>
              </div>
            </motion.div>
          ))}

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Custom Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
