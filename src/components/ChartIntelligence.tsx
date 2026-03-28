import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  BarChart,
  Bar,
  ComposedChart
} from "recharts";
import { Activity, Crosshair, Info, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { StockAnalysisModal } from "./StockAnalysisModal";

const ASSETS = [
  { symbol: "RELIANCE", name: "Reliance Industries", pattern: "Cup & Handle", price: 2954.20, change: 1.24, target: 3150, stop: 2880, success: 76.4 },
  { symbol: "INFY", name: "Infosys Ltd.", pattern: "Head & Shoulders", price: 1480.00, change: -1.02, target: 1350, stop: 1520, success: 68.2 },
  { symbol: "TCS", name: "Tata Consultancy", pattern: "Double Bottom", price: 3950.00, change: -0.52, target: 4200, stop: 3850, success: 82.1 },
  { symbol: "ITC", name: "ITC Ltd.", pattern: "Ascending Triangle", price: 425.60, change: 0.50, target: 460, stop: 410, success: 71.5 },
  { symbol: "HDFCBANK", name: "HDFC Bank", pattern: "Bull Flag", price: 1520.25, change: 1.85, target: 1650, stop: 1480, success: 74.8 },
  { symbol: "ICICIBANK", name: "ICICI Bank", pattern: "Symmetrical Triangle", price: 1080.50, change: 0.95, target: 1150, stop: 1040, success: 69.3 },
  { symbol: "SBIN", name: "State Bank of India", pattern: "Rounding Bottom", price: 820.50, change: 2.50, target: 900, stop: 780, success: 80.5 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", pattern: "Triple Top", price: 1240.50, change: -1.15, target: 1150, stop: 1280, success: 65.4 },
];

const generateData = (basePrice: number, isBullish: boolean) => {
  const data = [];
  let price = basePrice;
  for (let i = 0; i < 60; i++) {
    const volatility = basePrice * 0.01;
    const trend = isBullish ? (i > 45 ? volatility * 2 : 0) : (i > 45 ? -volatility * 2 : 0);
    price += (Math.random() - 0.5) * volatility + trend;
    
    data.push({
      day: `Day ${i + 1}`,
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 100000) + 50000
    });
  }
  return data;
};

export function ChartIntelligence() {
  const [activeAsset, setActiveAsset] = useState(ASSETS[0]);
  const [timeframe, setTimeframe] = useState("1D");
  const [analyzingStock, setAnalyzingStock] = useState<{symbol: string, name: string, price: number} | null>(null);

  const chartData = useMemo(() => {
    return generateData(activeAsset.price, activeAsset.change > 0);
  }, [activeAsset, timeframe]);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white font-display">Chart Pattern Intelligence</h2>
          <p className="text-zinc-400 text-sm mt-1">Real-time technical pattern detection across the NSE universe.</p>
        </div>
        <button 
          onClick={() => setAnalyzingStock({ symbol: activeAsset.symbol, name: activeAsset.name, price: activeAsset.price })}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 font-medium"
        >
          <Activity size={18} />
          Analyze {activeAsset.symbol}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/10 to-zinc-900/50 border border-indigo-500/20 rounded-xl p-5 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-3xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100 text-lg font-display">{activeAsset.symbol} <span className="text-sm font-normal text-zinc-500 ml-2 font-sans">NSE</span></h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-200 font-mono font-medium">₹{activeAsset.price.toFixed(2)}</span>
                  <span className={`font-medium flex items-center ${activeAsset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeAsset.change >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {activeAsset.change >= 0 ? '+' : ''}{activeAsset.change}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium border border-indigo-500/30 flex items-center gap-1.5">
                <Crosshair size={12} />
                Pattern: {activeAsset.pattern}
              </div>
              <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {['15m', '1H', '1D', '1W'].map(tf => (
                  <button 
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf);
                      toast.info(`Switched to ${tf} timeframe`);
                    }}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${timeframe === tf ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis yAxisId="price" domain={['auto', 'auto']} stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <YAxis yAxisId="volume" orientation="right" hide domain={[0, 'dataMax * 3']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <ReferenceArea yAxisId="price" x1="Day 1" x2="Day 45" strokeOpacity={0.3} fill="#4f46e5" fillOpacity={0.05} />
                <ReferenceArea yAxisId="price" x1="Day 45" x2="Day 55" strokeOpacity={0.3} fill="#f59e0b" fillOpacity={0.05} />
                <ReferenceLine yAxisId="price" y={activeAsset.price * 0.98} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Support/Resistance', fill: '#10b981', fontSize: 12 }} />
                <Bar yAxisId="volume" dataKey="volume" fill="#3f3f46" opacity={0.3} radius={[2, 2, 0, 0]} />
                <Line yAxisId="price" type="monotone" dataKey="price" stroke="#818cf8" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#818cf8', stroke: '#18181b', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h4 className="font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <Info size={16} className="text-indigo-400" />
              Pattern Explanation
            </h4>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              A classic <strong className="text-zinc-200">{activeAsset.pattern}</strong> pattern has formed. The technical structure suggests a {activeAsset.change >= 0 ? 'bullish continuation' : 'bearish reversal'} with high probability based on historical backtesting.
            </p>
            
            <div className="space-y-3 pt-4 border-t border-zinc-800/50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Historical Success Rate</span>
                <span className="text-emerald-400 font-medium font-mono">{activeAsset.success}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Target Price</span>
                <span className="text-zinc-200 font-medium font-mono">₹{activeAsset.target}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Stop Loss</span>
                <span className="text-rose-400 font-medium font-mono">₹{activeAsset.stop}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Risk/Reward</span>
                <span className="text-indigo-400 font-medium font-mono">
                  1 : {Math.abs((activeAsset.target - activeAsset.price) / (activeAsset.price - activeAsset.stop)).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h4 className="font-medium text-zinc-200 mb-3">Other Detected Patterns</h4>
            <div className="space-y-2">
              {ASSETS.filter(a => a.symbol !== activeAsset.symbol).map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveAsset(item)}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700 text-sm transition-all flex justify-between items-center group"
                >
                  <div>
                    <div className="font-medium text-zinc-200">{item.pattern}</div>
                    <div className="text-xs text-zinc-500">{item.symbol}</div>
                  </div>
                  <ArrowRight size={14} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {analyzingStock && (
        <StockAnalysisModal 
          stock={analyzingStock} 
          onClose={() => setAnalyzingStock(null)} 
        />
      )}
    </div>
  );
}
