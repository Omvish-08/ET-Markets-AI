import { useState } from "react";
import { motion } from "motion/react";
import { Activity, TrendingUp, TrendingDown, BarChart2, PieChart, ArrowUpRight, ArrowDownRight, Users, Building2, Globe2, Newspaper, ListPlus, Check } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, Pie, PieChart as RechartsPieChart } from "recharts";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { StockAnalysisModal } from "./StockAnalysisModal";

const NIFTY_DATA = Array.from({ length: 40 }).map((_, i) => ({
  time: `10:${i < 10 ? '0'+i : i}`,
  value: 22300 + Math.random() * 200 + (i * 5),
}));

const SECTOR_DATA = [
  { name: "Nifty IT", change: 1.45, isUp: true },
  { name: "Nifty Bank", change: 0.89, isUp: true },
  { name: "Nifty Auto", change: 0.54, isUp: true },
  { name: "Nifty Pharma", change: -0.32, isUp: false },
  { name: "Nifty FMCG", change: -0.75, isUp: false },
  { name: "Nifty Metal", change: 2.15, isUp: true },
];

const TOP_GAINERS = [
  { symbol: "TATASTEEL", price: 165.40, change: 4.2 },
  { symbol: "M&M", price: 2150.00, change: 3.8 },
  { symbol: "WIPRO", price: 485.20, change: 2.9 },
  { symbol: "SBIN", price: 820.50, change: 2.5 },
];

const TOP_LOSERS = [
  { symbol: "ASIANPAINT", price: 2850.00, change: -2.4 },
  { symbol: "HINDUNILVR", price: 2240.15, change: -1.8 },
  { symbol: "TITAN", price: 3420.00, change: -1.5 },
  { symbol: "NESTLEIND", price: 2450.80, change: -1.2 },
];

const GLOBAL_CUES = [
  { name: "GIFT Nifty", value: "22,510.50", change: "+45.20", isUp: true },
  { name: "Dow Jones", value: "39,127.14", change: "+145.30", isUp: true },
  { name: "Nasdaq", value: "16,277.46", change: "-42.10", isUp: false },
  { name: "Nikkei 225", value: "39,803.09", change: "+340.50", isUp: true },
  { name: "Hang Seng", value: "16,541.42", change: "-120.30", isUp: false },
];

const LIVE_NEWS = [
  { time: "10:45 AM", text: "RBI keeps repo rate unchanged at 6.5%, stance remains 'withdrawal of accommodation'.", tag: "Economy" },
  { time: "10:30 AM", text: "TCS Q4 Results: Net profit rises 9% YoY to ₹12,434 crore, beats estimates.", tag: "Earnings" },
  { time: "10:15 AM", text: "Block Deal: 2.5 crore shares of HDFC Bank change hands at ₹1,445/share.", tag: "Markets" },
  { time: "09:50 AM", text: "Govt cuts windfall tax on crude oil to ₹3,200 per tonne.", tag: "Policy" },
];

const MOST_ACTIVE_VOL = [
  { symbol: "YESBANK", price: 24.50, vol: "14.5 Cr" },
  { symbol: "IDEA", price: 13.20, vol: "12.2 Cr" },
  { symbol: "SUZLON", price: 42.10, vol: "8.5 Cr" },
  { symbol: "ZOMATO", price: 165.50, vol: "6.2 Cr" },
];

const MOST_ACTIVE_VAL = [
  { symbol: "HDFCBANK", price: 1520.25, val: "₹2,450 Cr" },
  { symbol: "RELIANCE", price: 2954.20, val: "₹1,820 Cr" },
  { symbol: "ICICIBANK", price: 1080.50, val: "₹1,540 Cr" },
  { symbol: "INFY", price: 1480.00, val: "₹1,210 Cr" },
];

const HIGHS_52W = [
  { symbol: "TATASTEEL", price: 165.40, change: 4.2 },
  { symbol: "M&M", price: 2150.00, change: 3.8 },
  { symbol: "BHARTIARTL", price: 1240.50, change: 1.5 },
  { symbol: "SUNPHARMA", price: 1620.00, change: 0.8 },
];

const LOWS_52W = [
  { symbol: "PAYTM", price: 380.20, change: -2.4 },
  { symbol: "HINDUNILVR", price: 2240.15, change: -1.8 },
  { symbol: "UPL", price: 450.00, change: -1.5 },
  { symbol: "BANDHANBNK", price: 185.40, change: -1.2 },
];

export function MarketDashboard() {
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [analyzingStock, setAnalyzingStock] = useState<{symbol: string, name: string, price: number} | null>(null);

  const handleAddToWatchlist = async (e: React.MouseEvent, stockSymbol: string) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    
    try {
      const q = query(
        collection(db, 'users', auth.currentUser.uid, 'watchlist'),
        where('symbol', '==', stockSymbol)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'watchlist'), {
          symbol: stockSymbol,
          name: stockSymbol,
          addedAt: serverTimestamp()
        });
        toast.success(`Added ${stockSymbol} to Watchlist`);
      } else {
        toast.info(`${stockSymbol} is already in Watchlist`);
      }
      
      setAddedItems(prev => new Set(prev).add(stockSymbol));
      setTimeout(() => {
        setAddedItems(prev => {
          const next = new Set(prev);
          next.delete(stockSymbol);
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error("Error adding to watchlist:", err);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white font-display">Market Overview</h2>
          <p className="text-zinc-400 text-sm mt-1">Live snapshot of NSE & BSE performance, institutional flows, and sector rotation.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 text-zinc-300 rounded-full text-xs font-medium border border-zinc-700">
          <Activity size={14} className="text-emerald-400" />
          Market Open
        </div>
      </div>

      {/* Top Indices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "NIFTY 50", value: "22,453.30", change: "+165.20", percent: "+0.74%", isUp: true },
          { name: "SENSEX", value: "73,806.15", change: "+536.45", percent: "+0.73%", isUp: true },
          { name: "BANKNIFTY", value: "48,159.00", change: "+425.80", percent: "+0.89%", isUp: true },
          { name: "INDIA VIX", value: "12.45", change: "-0.35", percent: "-2.73%", isUp: false },
        ].map((idx, i) => (
          <motion.div 
            key={i}
            onClick={() => toast.info(`Opening detailed view for ${idx.name}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${idx.isUp ? 'from-emerald-900/20 to-zinc-900/50 border-emerald-500/20' : 'from-rose-900/20 to-zinc-900/50 border-rose-500/20'} border rounded-xl p-5 hover:bg-zinc-800/50 transition-colors relative overflow-hidden cursor-pointer`}
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${idx.isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <h3 className="text-sm font-medium text-zinc-400 mb-2 relative z-10">{idx.name}</h3>
            <div className="text-2xl font-bold text-white font-mono mb-2 relative z-10">{idx.value}</div>
            <div className={`flex items-center gap-2 text-sm font-medium relative z-10 ${idx.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {idx.isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{idx.change} ({idx.percent})</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <BarChart2 size={18} className="text-indigo-400" />
              NIFTY 50 Intraday
            </h3>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '1Y'].map((tf) => (
                <button 
                  key={tf} 
                  onClick={() => toast.info(`Switched to ${tf} timeframe`)}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${tf === '1D' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-zinc-400 hover:bg-zinc-800'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={NIFTY_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNifty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNifty)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Breadth & FII/DII */}
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <PieChart size={16} className="text-indigo-400" />
              Market Breadth (NSE)
            </h3>
            <div className="h-40 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: "Advances", value: 1452, color: "#10b981" },
                      { name: "Declines", value: 684, color: "#f43f5e" },
                      { name: "Unchanged", value: 120, color: "#52525b" }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {[
                      { name: "Advances", value: 1452, color: "#10b981" },
                      { name: "Declines", value: 684, color: "#f43f5e" },
                      { name: "Unchanged", value: 120, color: "#52525b" }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                    itemStyle={{ color: '#f4f4f5' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-zinc-400">Advances</span>
                <span className="text-emerald-400 font-medium font-mono">1,452</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-zinc-400">Declines</span>
                <span className="text-rose-400 font-medium font-mono">684</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-indigo-400" />
              Institutional Flows (Prov.)
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">FII Net</span>
                  <span className="text-emerald-400 font-medium font-mono">+₹1,245.50 Cr</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[70%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">DII Net</span>
                  <span className="text-rose-400 font-medium font-mono">-₹340.20 Cr</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[30%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Cues & Live News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <Globe2 size={16} className="text-indigo-400" />
            Global Cues
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {GLOBAL_CUES.map((cue, i) => (
              <div key={i} className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-800/50">
                <div className="text-xs text-zinc-400 mb-1">{cue.name}</div>
                <div className="flex items-end justify-between">
                  <div className="font-mono font-medium text-zinc-200">{cue.value}</div>
                  <div className={`text-xs font-medium flex items-center ${cue.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {cue.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {cue.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <Newspaper size={16} className="text-indigo-400" />
            Live Market News
          </h3>
          <div className="space-y-4">
            {LIVE_NEWS.map((news, i) => (
              <div key={i} className="flex gap-3 items-start group cursor-pointer">
                <div className="text-xs font-mono text-zinc-500 mt-0.5 whitespace-nowrap">{news.time}</div>
                <div>
                  <p className="text-sm text-zinc-300 group-hover:text-indigo-300 transition-colors line-clamp-2">{news.text}</p>
                  <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-md">
                    {news.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gainers, Losers, Sectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <ArrowUpRight size={16} className="text-emerald-400" />
            Top Gainers
          </h3>
          <div className="space-y-3">
            {TOP_GAINERS.map((stock, i) => (
              <div 
                key={i} 
                onClick={() => setAnalyzingStock({ symbol: stock.symbol, name: stock.symbol, price: stock.price })}
                className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-200 text-sm">{stock.symbol}</span>
                  <button 
                    onClick={(e) => handleAddToWatchlist(e, stock.symbol)}
                    className={`p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${
                      addedItems.has(stock.symbol) 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                    title="Add to Watchlist"
                  >
                    {addedItems.has(stock.symbol) ? <Check size={14} /> : <ListPlus size={14} />}
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-100 font-mono">₹{stock.price.toFixed(2)}</div>
                  <div className="text-xs text-emerald-400 font-medium">+{stock.change}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <ArrowDownRight size={16} className="text-rose-400" />
            Top Losers
          </h3>
          <div className="space-y-3">
            {TOP_LOSERS.map((stock, i) => (
              <div 
                key={i} 
                onClick={() => setAnalyzingStock({ symbol: stock.symbol, name: stock.symbol, price: stock.price })}
                className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-200 text-sm">{stock.symbol}</span>
                  <button 
                    onClick={(e) => handleAddToWatchlist(e, stock.symbol)}
                    className={`p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${
                      addedItems.has(stock.symbol) 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                    title="Add to Watchlist"
                  >
                    {addedItems.has(stock.symbol) ? <Check size={14} /> : <ListPlus size={14} />}
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-100 font-mono">₹{stock.price.toFixed(2)}</div>
                  <div className="text-xs text-rose-400 font-medium">{stock.change}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-indigo-400" />
            Sector Performance
          </h3>
          <div className="space-y-3">
            {SECTOR_DATA.map((sector, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">{sector.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex justify-end">
                    {sector.isUp ? (
                      <div className="h-full bg-emerald-500" style={{ width: `${Math.min(sector.change * 20, 100)}%` }} />
                    ) : (
                      <div className="h-full bg-rose-500" style={{ width: `${Math.min(Math.abs(sector.change) * 20, 100)}%` }} />
                    )}
                  </div>
                  <span className={`text-xs font-medium w-12 text-right ${sector.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {sector.isUp ? '+' : ''}{sector.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Active & 52W High/Low */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-indigo-400" />
            Most Active (Vol)
          </h3>
          <div className="space-y-3">
            {MOST_ACTIVE_VOL.map((stock, i) => (
              <div 
                key={i} 
                onClick={() => setAnalyzingStock({ symbol: stock.symbol, name: stock.symbol, price: stock.price })}
                className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-200 text-sm">{stock.symbol}</span>
                  <button 
                    onClick={(e) => handleAddToWatchlist(e, stock.symbol)}
                    className={`p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${
                      addedItems.has(stock.symbol) 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                    title="Add to Watchlist"
                  >
                    {addedItems.has(stock.symbol) ? <Check size={14} /> : <ListPlus size={14} />}
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-100 font-mono">₹{stock.price.toFixed(2)}</div>
                  <div className="text-xs text-zinc-400 font-medium">{stock.vol}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-indigo-400" />
            Most Active (Val)
          </h3>
          <div className="space-y-3">
            {MOST_ACTIVE_VAL.map((stock, i) => (
              <div 
                key={i} 
                onClick={() => setAnalyzingStock({ symbol: stock.symbol, name: stock.symbol, price: stock.price })}
                className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-200 text-sm">{stock.symbol}</span>
                  <button 
                    onClick={(e) => handleAddToWatchlist(e, stock.symbol)}
                    className={`p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${
                      addedItems.has(stock.symbol) 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                    title="Add to Watchlist"
                  >
                    {addedItems.has(stock.symbol) ? <Check size={14} /> : <ListPlus size={14} />}
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-100 font-mono">₹{stock.price.toFixed(2)}</div>
                  <div className="text-xs text-zinc-400 font-medium">{stock.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <ArrowUpRight size={16} className="text-emerald-400" />
            52-Week High
          </h3>
          <div className="space-y-3">
            {HIGHS_52W.map((stock, i) => (
              <div 
                key={i} 
                onClick={() => setAnalyzingStock({ symbol: stock.symbol, name: stock.symbol, price: stock.price })}
                className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
              >
                <span className="font-bold text-zinc-200 text-sm">{stock.symbol}</span>
                <div className="text-right">
                  <div className="text-sm text-zinc-100 font-mono">₹{stock.price.toFixed(2)}</div>
                  <div className="text-xs text-emerald-400 font-medium">+{stock.change}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <ArrowDownRight size={16} className="text-rose-400" />
            52-Week Low
          </h3>
          <div className="space-y-3">
            {LOWS_52W.map((stock, i) => (
              <div 
                key={i} 
                onClick={() => setAnalyzingStock({ symbol: stock.symbol, name: stock.symbol, price: stock.price })}
                className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
              >
                <span className="font-bold text-zinc-200 text-sm">{stock.symbol}</span>
                <div className="text-right">
                  <div className="text-sm text-zinc-100 font-mono">₹{stock.price.toFixed(2)}</div>
                  <div className="text-xs text-rose-400 font-medium">{stock.change}%</div>
                </div>
              </div>
            ))}
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
