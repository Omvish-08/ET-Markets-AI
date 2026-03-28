import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, PieChart, Activity, Briefcase, Loader2 } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Pie, PieChart as RechartsPieChart } from "recharts";
import { toast } from "sonner";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const portfolioHistory = Array.from({ length: 30 }).map((_, i) => ({
  date: `Day ${i + 1}`,
  value: 1500000 + (Math.random() * 200000 - 50000) + (i * 15000),
}));

const allocationData = [
  { name: "Financials", value: 35, color: "#4f46e5" },
  { name: "Technology", value: 25, color: "#0ea5e9" },
  { name: "Energy", value: 20, color: "#10b981" },
  { name: "Consumer", value: 15, color: "#f59e0b" },
  { name: "Others", value: 5, color: "#8b5cf6" },
];

interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  ltp: number;
  change: number;
}

export function PortfolioModal({ user, onClose }: { user: FirebaseUser, onClose: () => void }) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'portfolio'));
        const fetchedHoldings: Holding[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.shares > 0) {
            // Mocking LTP and Change for now as we don't have a live price API
            const hash = data.symbol.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const ltp = data.avgPrice * (1 + ((hash % 20) - 10) / 100);
            const change = ((ltp - data.avgPrice) / data.avgPrice) * 100;

            fetchedHoldings.push({
              symbol: data.symbol,
              name: data.name || data.symbol,
              shares: data.shares,
              avgPrice: data.avgPrice,
              ltp: ltp,
              change: change
            });
          }
        });
        setHoldings(fetchedHoldings);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        toast.error("Failed to load portfolio.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHoldings();
  }, [user.uid]);

  const totalValue = holdings.reduce((acc, curr) => acc + (curr.shares * curr.ltp), 0);
  const investedValue = holdings.reduce((acc, curr) => acc + (curr.shares * curr.avgPrice), 0);
  const totalPL = totalValue - investedValue;
  const totalPLPercent = investedValue > 0 ? (totalPL / investedValue) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-12 h-12 rounded-full border-2 border-indigo-500/30" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 font-display">{user.displayName || 'Investor'}'s Portfolio</h2>
              <p className="text-zinc-400 text-sm mt-1">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
              <p>Loading your portfolio...</p>
            </div>
          ) : holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Briefcase size={64} className="text-zinc-800 mb-4" />
              <h3 className="text-xl font-medium text-zinc-300 mb-2">Your portfolio is empty</h3>
              <p className="text-zinc-500 max-w-md text-center">
                Start building your portfolio by analyzing stocks and placing buy orders.
              </p>
            </div>
          ) : (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-zinc-800/30">
                <Wallet size={100} />
              </div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2 relative z-10">Current Value</h3>
              <div className="text-3xl font-bold text-white font-mono relative z-10">
                ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm relative z-10">
                <span className="text-zinc-500">Invested:</span>
                <span className="text-zinc-300 font-medium">₹{investedValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Total Returns</h3>
              <div className={`text-3xl font-bold font-mono flex items-center gap-2 ${totalPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPL >= 0 ? '+' : ''}₹{totalPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                {totalPL >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className={`px-2 py-0.5 rounded-md font-medium ${totalPLPercent >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
                </span>
                <span className="text-zinc-500">All time</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Today's P&L</h3>
              <div className="text-3xl font-bold text-emerald-400 font-mono flex items-center gap-2">
                +₹12,450.50
                <ArrowUpRight size={24} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="px-2 py-0.5 rounded-md font-medium bg-emerald-500/10 text-emerald-400">
                  +0.85%
                </span>
                <span className="text-zinc-500">Today</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
                <Activity size={18} className="text-indigo-400" />
                Portfolio Performance (30 Days)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioHistory} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val/100000).toFixed(1)}L`} domain={['dataMin - 50000', 'dataMax + 50000']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                      itemStyle={{ color: '#818cf8' }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Value']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Allocation */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
                <PieChart size={18} className="text-indigo-400" />
                Sector Allocation
              </h3>
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                      itemStyle={{ color: '#e4e4e7' }}
                      formatter={(value: number) => [`${value}%`, 'Allocation']}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-zinc-200">100%</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {allocationData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-300">{item.name}</span>
                    </div>
                    <span className="text-zinc-400 font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-400" />
                Your Holdings
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium text-right">Shares</th>
                    <th className="px-6 py-4 font-medium text-right">Avg. Price</th>
                    <th className="px-6 py-4 font-medium text-right">LTP</th>
                    <th className="px-6 py-4 font-medium text-right">Current Value</th>
                    <th className="px-6 py-4 font-medium text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {holdings.map((stock, i) => {
                    const currentValue = stock.shares * stock.ltp;
                    const pl = (stock.ltp - stock.avgPrice) * stock.shares;
                    const plPercent = ((stock.ltp - stock.avgPrice) / stock.avgPrice) * 100;
                    const isPositive = pl >= 0;

                    return (
                      <tr 
                        key={i} 
                        onClick={() => toast.info(`Viewing details for ${stock.symbol}`)}
                        className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-zinc-200">{stock.symbol}</div>
                          <div className="text-xs text-zinc-500">{stock.name}</div>
                        </td>
                        <td className="px-6 py-4 text-right text-zinc-300 font-mono">{stock.shares}</td>
                        <td className="px-6 py-4 text-right text-zinc-300 font-mono">₹{stock.avgPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-mono">
                          <div className="text-zinc-200">₹{stock.ltp.toFixed(2)}</div>
                          <div className={`text-xs ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-zinc-200 font-mono font-medium">
                          ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          <div className={`font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : ''}₹{pl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </div>
                          <div className={`text-xs ${isPositive ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                            {isPositive ? '+' : ''}{plPercent.toFixed(2)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}

        </div>
      </motion.div>
    </div>
  );
}
