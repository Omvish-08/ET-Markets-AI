import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const TICKER_DATA = [
  { symbol: "NIFTY 50", price: "22,453.30", change: "+165.20", percent: "+0.74%", isUp: true },
  { symbol: "SENSEX", price: "73,806.15", change: "+536.45", percent: "+0.73%", isUp: true },
  { symbol: "BANKNIFTY", price: "48,159.00", change: "+425.80", percent: "+0.89%", isUp: true },
  { symbol: "NIFTY MIDCAP", price: "50,230.45", change: "+620.10", percent: "+1.25%", isUp: true },
  { symbol: "INDIA VIX", price: "12.45", change: "-0.35", percent: "-2.73%", isUp: false },
  { symbol: "RELIANCE", price: "2,954.20", change: "+35.40", percent: "+1.21%", isUp: true },
  { symbol: "HDFCBANK", price: "1,520.25", change: "+18.50", percent: "+1.23%", isUp: true },
  { symbol: "INFY", price: "1,480.00", change: "-15.20", percent: "-1.02%", isUp: false },
  { symbol: "TCS", price: "3,950.00", change: "-20.50", percent: "-0.52%", isUp: false },
  { symbol: "ITC", price: "425.60", change: "+2.10", percent: "+0.50%", isUp: true },
];

export function TickerTape() {
  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800 flex items-center overflow-hidden h-10 flex-shrink-0">
      <motion.div
        animate={{ x: [0, -1920] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="flex whitespace-nowrap items-center"
      >
        {[...TICKER_DATA, ...TICKER_DATA, ...TICKER_DATA].map((item, i) => (
          <div 
            key={i} 
            onClick={() => toast.info(`Viewing details for ${item.symbol}`)}
            className="flex items-center gap-2 px-6 border-r border-zinc-800/50 cursor-pointer hover:bg-zinc-900/50 transition-colors"
          >
            <span className="text-xs font-bold text-zinc-300">{item.symbol}</span>
            <span className="text-xs text-zinc-100 font-mono">{item.price}</span>
            <span className={`text-xs font-medium flex items-center gap-0.5 ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {item.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {item.percent}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
