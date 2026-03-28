import { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, ArrowUpRight, ArrowDownRight, SlidersHorizontal, Star, ListPlus, Check } from "lucide-react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { StockAnalysisModal } from "./StockAnalysisModal";

const SCREENER_DATA = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2985.40, change: 1.2, vol: "8.5M", mcap: "20.1T", pe: 28.4, rsi: 65, sector: "Energy" },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 4120.15, change: -0.8, vol: "2.1M", mcap: "14.8T", pe: 32.1, rsi: 45, sector: "IT" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", price: 1450.80, change: 2.1, vol: "15.2M", mcap: "11.2T", pe: 16.5, rsi: 52, sector: "Banking" },
  { symbol: "INFY", name: "Infosys Ltd", price: 1680.00, change: 0.5, vol: "4.8M", mcap: "6.9T", pe: 24.8, rsi: 58, sector: "IT" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", price: 1085.20, change: 1.8, vol: "11.4M", mcap: "7.6T", pe: 18.2, rsi: 71, sector: "Banking" },
  { symbol: "SBIN", name: "State Bank of India", price: 765.40, change: 3.2, vol: "22.1M", mcap: "6.8T", pe: 10.4, rsi: 82, sector: "Banking" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", price: 1210.50, change: -1.5, vol: "5.6M", mcap: "7.1T", pe: 54.2, rsi: 38, sector: "Telecom" },
  { symbol: "ITC", name: "ITC Ltd", price: 425.60, change: 0.2, vol: "18.5M", mcap: "5.3T", pe: 26.1, rsi: 49, sector: "FMCG" },
  { symbol: "L&T", name: "Larsen & Toubro", price: 3650.00, change: 2.8, vol: "3.2M", mcap: "4.9T", pe: 38.5, rsi: 68, sector: "Infrastructure" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd", price: 7120.00, change: -2.1, vol: "1.1M", mcap: "4.3T", pe: 34.2, rsi: 31, sector: "Financials" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", price: 2240.15, change: -1.8, vol: "2.5M", mcap: "5.2T", pe: 52.4, rsi: 28, sector: "FMCG" },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 12450.00, change: 1.5, vol: "0.8M", mcap: "3.9T", pe: 28.6, rsi: 62, sector: "Auto" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", price: 1620.00, change: 0.8, vol: "3.4M", mcap: "3.8T", pe: 36.2, rsi: 55, sector: "Pharma" },
  { symbol: "TATASTEEL", name: "Tata Steel", price: 165.40, change: 4.2, vol: "45.2M", mcap: "2.1T", pe: 12.4, rsi: 75, sector: "Metals" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1780.50, change: -0.5, vol: "4.2M", mcap: "3.5T", pe: 19.8, rsi: 42, sector: "Banking" },
];

export function StockScreener() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [analyzingStock, setAnalyzingStock] = useState<typeof SCREENER_DATA[0] | null>(null);

  const filters = ["All", "Nifty 50", "Midcap", "High Volume", "Overbought (RSI > 70)", "Oversold (RSI < 30)"];

  const handleAddToWatchlist = async (stock: typeof SCREENER_DATA[0]) => {
    if (!auth.currentUser) return;
    
    try {
      // Check if already exists
      const q = query(
        collection(db, 'users', auth.currentUser.uid, 'watchlist'),
        where('symbol', '==', stock.symbol)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'watchlist'), {
          symbol: stock.symbol,
          name: stock.name,
          addedAt: serverTimestamp()
        });
        toast.success(`Added ${stock.symbol} to Watchlist`);
      } else {
        toast.info(`${stock.symbol} is already in Watchlist`);
      }
      
      setAddedItems(prev => new Set(prev).add(stock.symbol));
      setTimeout(() => {
        setAddedItems(prev => {
          const next = new Set(prev);
          next.delete(stock.symbol);
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error("Error adding to watchlist:", err);
      toast.error("Failed to add to watchlist");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white font-display">Stock Screener</h2>
          <p className="text-zinc-400 text-sm mt-1">Filter and discover stocks based on technical and fundamental parameters.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by symbol or company name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
          />
        </div>
        <button 
          onClick={() => toast.info("Advanced filters coming soon")}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 rounded-xl transition-all shadow-lg shadow-indigo-500/10"
        >
          <SlidersHorizontal size={18} />
          <span className="font-medium">Advanced Filters</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide relative z-10">
        {filters.map(filter => (
          <button 
            key={filter}
            onClick={() => {
              setActiveFilter(filter);
              toast.success(`Applied filter: ${filter}`);
            }}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20' 
                : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden relative z-10 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-zinc-400 bg-zinc-900 border-b border-zinc-800 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Symbol</th>
                <th className="px-6 py-4 font-medium text-right">Price (₹)</th>
                <th className="px-6 py-4 font-medium text-right">Change %</th>
                <th className="px-6 py-4 font-medium text-right">Volume</th>
                <th className="px-6 py-4 font-medium text-right">M.Cap (₹)</th>
                <th className="px-6 py-4 font-medium text-right">P/E</th>
                <th className="px-6 py-4 font-medium text-right">RSI (14)</th>
                <th className="px-6 py-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {SCREENER_DATA.map((stock, i) => (
                <motion.tr 
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-zinc-600 hover:text-amber-400 transition-colors">
                        <Star size={16} />
                      </button>
                      <div>
                        <div className="font-bold text-zinc-100">{stock.symbol}</div>
                        <div className="text-xs text-zinc-500">{stock.name} • {stock.sector}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-zinc-200">
                    {stock.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex items-center gap-1 font-medium px-2 py-1 rounded-md text-xs ${
                      stock.change > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {stock.change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {Math.abs(stock.change)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-400">{stock.vol}</td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-400">{stock.mcap}</td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-400">{stock.pe}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-mono font-medium ${
                      stock.rsi > 70 ? 'text-rose-400' : stock.rsi < 30 ? 'text-emerald-400' : 'text-zinc-400'
                    }`}>
                      {stock.rsi}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleAddToWatchlist(stock)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          addedItems.has(stock.symbol) 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                        title="Add to Watchlist"
                      >
                        {addedItems.has(stock.symbol) ? <Check size={16} /> : <ListPlus size={16} />}
                      </button>
                      <button 
                        onClick={() => setAnalyzingStock(stock)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
                      >
                        Analyze
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
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
