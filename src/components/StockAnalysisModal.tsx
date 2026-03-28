import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, TrendingUp, TrendingDown, Activity, FileText, Loader2, IndianRupee, ShoppingCart, Briefcase } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";

interface StockAnalysisModalProps {
  stock: { symbol: string; name: string; price: number };
  onClose: () => void;
}

export function StockAnalysisModal({ stock, onClose }: StockAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<"analysis" | "trade">("analysis");
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Trading State
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState<number>(1);
  const [isTrading, setIsTrading] = useState(false);
  const [currentHoldings, setCurrentHoldings] = useState<number>(0);
  const [avgPrice, setAvgPrice] = useState<number>(0);

  useEffect(() => {
    fetchAnalysis();
    fetchHoldings();
  }, [stock.symbol]);

  const fetchHoldings = async () => {
    if (!auth.currentUser) return;
    try {
      const holdingRef = doc(db, 'users', auth.currentUser.uid, 'portfolio', stock.symbol);
      const holdingSnap = await getDoc(holdingRef);
      if (holdingSnap.exists()) {
        const data = holdingSnap.data();
        setCurrentHoldings(data.shares || 0);
        setAvgPrice(data.avgPrice || 0);
      }
    } catch (error) {
      console.error("Error fetching holdings:", error);
    }
  };

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze the Indian stock ${stock.symbol} (${stock.name}) currently trading at ₹${stock.price}.
      
Please provide a comprehensive analysis formatted in Markdown with the following sections:
1. **Technical Analysis**: Discuss current trends, support/resistance levels, RSI, MACD, and moving averages.
2. **Fundamental Analysis**: Discuss valuation, growth prospects, profitability, and recent earnings/news.
3. **Macro Factors**: How do current Indian and global economic conditions affect this stock?
4. **Final Verdict**: Give an explicit decision: **BUY**, **SELL**, or **HOLD**. Provide a strong, concise rationale for this decision.

Make it professional, data-driven, and easy to read for a retail investor.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: { temperature: 0.7 }
      });
      
      setAnalysis(response.text || "Analysis unavailable.");
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysis("Failed to load AI analysis. Please try again later.");
      toast.error("Failed to generate AI analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrade = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to trade.");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }
    if (tradeType === "sell" && quantity > currentHoldings) {
      toast.error("Insufficient shares to sell.");
      return;
    }

    setIsTrading(true);
    try {
      const holdingRef = doc(db, 'users', auth.currentUser.uid, 'portfolio', stock.symbol);
      
      let newShares = currentHoldings;
      let newAvgPrice = avgPrice;

      if (tradeType === "buy") {
        const totalCost = (currentHoldings * avgPrice) + (quantity * stock.price);
        newShares = currentHoldings + quantity;
        newAvgPrice = totalCost / newShares;
      } else {
        newShares = currentHoldings - quantity;
        // Average price remains the same on sell
      }

      if (newShares > 0) {
        await setDoc(holdingRef, {
          symbol: stock.symbol,
          name: stock.name,
          shares: newShares,
          avgPrice: newAvgPrice,
          lastTradedAt: serverTimestamp()
        });
      } else {
        await deleteDoc(holdingRef);
      }

      toast.success(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${stock.symbol}`);
      fetchHoldings(); // Refresh holdings
      setQuantity(1); // Reset quantity
    } catch (error: any) {
      console.error("Trade error:", error);
      toast.error(error.message || "Failed to execute trade.");
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-zinc-100 font-display">{stock.symbol}</h2>
              <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">NSE</span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">{stock.name}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-white font-mono flex items-center justify-end gap-1">
                <IndianRupee size={20} className="text-zinc-400" />
                {stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-emerald-400 flex items-center justify-end gap-1 font-medium">
                <TrendingUp size={14} /> Live Market
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "analysis" 
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" 
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Activity size={16} /> AI Analysis
            </div>
          </button>
          <button
            onClick={() => setActiveTab("trade")}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "trade" 
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" 
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Briefcase size={16} /> Trade
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "analysis" ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                    <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                    <p>Generating comprehensive AI analysis for {stock.symbol}...</p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-indigo max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:font-semibold prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="trade"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto space-y-8 py-4"
              >
                {/* Current Position */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                    <Briefcase size={16} /> Your Position
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Shares Owned</div>
                      <div className="text-xl font-bold text-zinc-100 font-mono">{currentHoldings}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Avg. Price</div>
                      <div className="text-xl font-bold text-zinc-100 font-mono">₹{avgPrice.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Trade Form */}
                <div className="space-y-6">
                  <div className="flex p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => setTradeType("buy")}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                        tradeType === "buy" 
                          ? "bg-emerald-500/20 text-emerald-400 shadow-sm" 
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setTradeType("sell")}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                        tradeType === "sell" 
                          ? "bg-rose-500/20 text-rose-400 shadow-sm" 
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Sell
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Quantity</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                      <span className="text-zinc-400 font-medium">Estimated Total</span>
                      <span className="text-xl font-bold text-white font-mono">
                        ₹{(quantity * stock.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={handleTrade}
                      disabled={isTrading || (tradeType === "sell" && quantity > currentHoldings)}
                      className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                        tradeType === "buy"
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                          : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20"
                      }`}
                    >
                      {isTrading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          {tradeType === "buy" ? "Place Buy Order" : "Place Sell Order"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
