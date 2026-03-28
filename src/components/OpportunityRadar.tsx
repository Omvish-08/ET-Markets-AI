import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Radar, 
  LineChart, 
  MessageSquare, 
  Video, 
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Zap,
  Filter,
  ListPlus,
  Check
} from "lucide-react";
import { AnalysisModal } from "./AnalysisModal";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";

const SIGNALS = [
  {
    id: 1,
    stock: "ZOMATO",
    type: "Bullish",
    category: "Corporate Filing",
    title: "Aggressive Q3 Margin Expansion",
    description: "Management commentary indicates a 200bps improvement in contribution margin. Institutional accumulation detected over the last 3 days.",
    confidence: 88,
    time: "10 mins ago"
  },
  {
    id: 2,
    stock: "HDFCBANK",
    type: "Bullish",
    category: "Block Deal",
    title: "FII Block Purchase at Support",
    description: "Multiple block deals totaling ₹1,200 Cr executed precisely at the 200-DMA support level. Options data shows heavy put writing at 1400 strike.",
    confidence: 92,
    time: "1 hour ago"
  },
  {
    id: 3,
    stock: "PAYTM",
    type: "Bearish",
    category: "Regulatory",
    title: "RBI Compliance Notice",
    description: "New filing indicates additional compliance requirements for payment aggregator license. Sentiment analysis of filing language is highly cautious.",
    confidence: 75,
    time: "2 hours ago"
  },
  {
    id: 4,
    stock: "TATAMOTORS",
    type: "Bullish",
    category: "Insider Trade",
    title: "Promoter Buying in Open Market",
    description: "Promoter group acquired 500,000 shares from open market. Coincides with a bullish MACD crossover on the daily timeframe.",
    confidence: 85,
    time: "3 hours ago"
  },
  {
    id: 5,
    stock: "RELIANCE",
    type: "Bullish",
    category: "Earnings Beat",
    title: "Jio ARPU Surges Past Estimates",
    description: "Telecom arm reports higher than expected Average Revenue Per User. Retail margins also show sequential improvement.",
    confidence: 94,
    time: "4 hours ago"
  },
  {
    id: 6,
    stock: "WIPRO",
    type: "Bearish",
    category: "Management Change",
    title: "Unexpected CEO Departure",
    description: "Sudden resignation of CEO cites personal reasons. Historical data shows 8% average drawdown on similar events in IT sector.",
    confidence: 81,
    time: "5 hours ago"
  },
  {
    id: 7,
    stock: "L&T",
    type: "Bullish",
    category: "Order Win",
    title: "Mega Order from Middle East",
    description: "L&T Construction secures a 'Mega' order (>₹7,000 Cr) in the Middle East. Order book visibility improves significantly for FY26.",
    confidence: 89,
    time: "6 hours ago"
  },
  {
    id: 8,
    stock: "ITC",
    type: "Bullish",
    category: "Technical Breakout",
    title: "Multi-Year Resistance Cleared",
    description: "Stock broke out of a 3-year consolidation zone with 4x average volume. RSI indicates strong momentum without being overbought.",
    confidence: 91,
    time: "7 hours ago"
  },
  {
    id: 9,
    stock: "BAJFINANCE",
    type: "Bearish",
    category: "Analyst Downgrade",
    title: "Multiple Brokerages Cut Target",
    description: "Three major foreign brokerages downgraded the stock citing margin compression and slower AUM growth in the upcoming quarters.",
    confidence: 78,
    time: "8 hours ago"
  },
  {
    id: 10,
    stock: "ADANIENT",
    type: "Bullish",
    category: "Fund Raising",
    title: "Successful QIP Closure",
    description: "Company successfully raised ₹10,000 Cr via QIP. Proceeds to be used for debt reduction and green energy capex. Positive sentiment observed.",
    confidence: 84,
    time: "9 hours ago"
  }
];

export function OpportunityRadar() {
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null);
  const [filter, setFilter] = useState("All");
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const filteredSignals = filter === "All" ? SIGNALS : SIGNALS.filter(s => s.type === filter);

  const handleAddToWatchlist = async (e: React.MouseEvent, stockSymbol: string, stockName: string) => {
    e.stopPropagation(); // Prevent opening the modal
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
          name: stockName,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white font-display">Opportunity Radar</h2>
          <p className="text-zinc-400 text-sm mt-1">AI-surfaced signals from filings, deals, and commentary.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            {["All", "Bullish", "Bearish"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === f ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Monitoring
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSignals.map((signal, idx) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedSignal(signal)}
            className={`bg-gradient-to-br ${signal.type === 'Bullish' ? 'from-emerald-900/10 to-zinc-900/50 border-emerald-500/10 hover:border-emerald-500/30' : 'from-rose-900/10 to-zinc-900/50 border-rose-500/10 hover:border-rose-500/30'} border rounded-xl p-5 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl flex flex-col relative overflow-hidden`}
          >
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none ${signal.type === 'Bullish' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${signal.type === 'Bullish' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {signal.type === 'Bullish' ? <TrendingUp size={18} /> : <TrendingUp size={18} className="rotate-180" />}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 font-display text-lg">{signal.stock}</h3>
                  <span className="text-xs text-zinc-500 font-mono">{signal.category}</span>
                </div>
              </div>
              <span className="text-xs text-zinc-500">{signal.time}</span>
            </div>
            
            <h4 className="text-sm font-medium text-zinc-200 mb-2">{signal.title}</h4>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2 flex-1">
              {signal.description}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 mt-auto">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                <span className="text-xs font-medium text-zinc-300">AI Confidence: {signal.confidence}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => handleAddToWatchlist(e, signal.stock, signal.stock)}
                  className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                    addedItems.has(signal.stock) 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                  title="Add to Watchlist"
                >
                  {addedItems.has(signal.stock) ? <Check size={16} /> : <ListPlus size={16} />}
                </button>
                <button className="text-xs font-medium text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Analysis <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedSignal && (
          <AnalysisModal 
            signal={selectedSignal} 
            onClose={() => setSelectedSignal(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
