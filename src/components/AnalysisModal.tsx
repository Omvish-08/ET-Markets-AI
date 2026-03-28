import { motion } from "motion/react";
import { X, BrainCircuit, TrendingUp, BarChart3, Activity, Target, ShieldAlert, ArrowRight } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// Mock detailed data for the analysis
const generateMockChartData = () => {
  return Array.from({ length: 20 }).map((_, i) => ({
    day: `D-${20 - i}`,
    price: 100 + Math.random() * 20 + i,
    volume: 1000 + Math.random() * 5000,
    sentiment: 50 + Math.random() * 40 + i,
  }));
};

export function AnalysisModal({ signal, onClose }: { signal: any, onClose: () => void }) {
  const chartData = generateMockChartData();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${signal.type === 'Bullish' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              <TrendingUp size={24} className={signal.type === 'Bullish' ? '' : 'rotate-180'} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-zinc-100 font-display">{signal.stock}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-700">NSE</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${signal.type === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {signal.type} Signal
                </span>
              </div>
              <p className="text-zinc-400 text-sm mt-1">{signal.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: AI Analysis */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <BrainCircuit size={64} className="text-indigo-500" />
                </div>
                <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2 mb-3">
                  <BrainCircuit size={16} />
                  AI Synthesis
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed relative z-10">
                  {signal.description} Our NLP models have analyzed the latest earnings call transcripts and detected a highly positive shift in management tone regarding forward guidance.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${signal.confidence}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-200">{signal.confidence}% Conviction</span>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-4">
                  <Target size={16} className="text-emerald-400" />
                  Actionable Levels
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                    <span className="text-sm text-zinc-400">Current Price</span>
                    <span className="text-sm font-medium text-zinc-200">₹1,245.60</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                    <span className="text-sm text-zinc-400">Target 1</span>
                    <span className="text-sm font-medium text-emerald-400">₹1,320.00</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                    <span className="text-sm text-zinc-400">Target 2</span>
                    <span className="text-sm font-medium text-emerald-500">₹1,450.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Stop Loss</span>
                    <span className="text-sm font-medium text-rose-400">₹1,180.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Charts & Data */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <BarChart3 size={16} className="text-indigo-400" />
                    Price & Volume Action (20 Days)
                  </h3>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="day" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                        itemStyle={{ color: '#818cf8' }}
                      />
                      <Bar yAxisId="right" dataKey="volume" fill="#3f3f46" opacity={0.3} radius={[2, 2, 0, 0]} />
                      <Line yAxisId="left" type="monotone" dataKey="price" stroke="#818cf8" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#818cf8' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <h4 className="text-xs font-medium text-zinc-500 mb-1">Institutional Flow</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-xl font-bold text-emerald-400">+₹450 Cr</span>
                    <span className="text-xs text-zinc-400 mb-1">last 5 days</span>
                  </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <h4 className="text-xs font-medium text-zinc-500 mb-1">Options Sentiment</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-xl font-bold text-indigo-400">0.65 PCR</span>
                    <span className="text-xs text-zinc-400 mb-1">Oversold</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            Add to Watchlist <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
