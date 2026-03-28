import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Search, Plus, Trash2, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { StockAnalysisModal } from './StockAnalysisModal';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  addedAt: any;
}

// Mock live data for the watchlist items
const getMockPriceData = (symbol: string) => {
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const basePrice = 100 + (hash % 3000);
  const change = (hash % 10) - 5 + Math.random() * 2;
  const changePercent = (change / basePrice) * 100;
  
  return {
    price: basePrice.toFixed(2),
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    isPositive: change >= 0
  };
};

export function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analyzingStock, setAnalyzingStock] = useState<{symbol: string, name: string, price: number} | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'watchlist'),
      orderBy('addedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const watchlistData: WatchlistItem[] = [];
      snapshot.forEach((doc) => {
        watchlistData.push({ id: doc.id, ...doc.data() } as WatchlistItem);
      });
      setItems(watchlistData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching watchlist:", err);
      setError("Failed to load watchlist. Please check your permissions.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newSymbol || !newName) return;

    setIsAdding(true);
    setError(null);
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'watchlist'), {
        symbol: newSymbol.toUpperCase(),
        name: newName,
        addedAt: serverTimestamp()
      });
      toast.success(`Added ${newSymbol.toUpperCase()} to Watchlist`);
      setNewSymbol('');
      setNewName('');
    } catch (err: any) {
      console.error("Error adding item:", err);
      setError(err.message || "Failed to add item to watchlist.");
      toast.error("Failed to add item");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (id: string, symbol: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'watchlist', id));
      toast.success(`Removed ${symbol} from Watchlist`);
    } catch (err: any) {
      console.error("Error deleting item:", err);
      setError("Failed to remove item.");
      toast.error("Failed to remove item");
    }
  };

  const filteredItems = items.filter(item => 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 font-display tracking-tight">My Watchlist</h1>
          <p className="text-zinc-400 mt-1">Track your favorite stocks in real-time</p>
        </div>
        
        <div className="w-full md:w-auto flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl backdrop-blur-sm text-center p-6">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-zinc-500" size={24} />
              </div>
              <h3 className="text-lg font-medium text-zinc-200 mb-2">Your watchlist is empty</h3>
              <p className="text-zinc-400 max-w-sm">Add stocks to your watchlist to track their performance and get personalized insights.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const liveData = getMockPriceData(item.symbol);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-gradient-to-br ${liveData.isPositive ? 'from-emerald-900/10 to-zinc-900/40 border-emerald-500/10 hover:border-emerald-500/30' : 'from-rose-900/10 to-zinc-900/40 border-rose-500/10 hover:border-rose-500/30'} border rounded-2xl p-5 backdrop-blur-sm transition-colors group relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${liveData.isPositive ? 'from-emerald-500 to-emerald-700' : 'from-rose-500 to-rose-700'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none ${liveData.isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-100">{item.symbol}</h3>
                        <p className="text-sm text-zinc-400 truncate max-w-[150px]">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAnalyzingStock({ symbol: item.symbol, name: item.name, price: parseFloat(liveData.price) })}
                          className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Analyze Stock"
                        >
                          <Activity size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.symbol)}
                          className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-display font-semibold text-zinc-100">
                          ₹{liveData.price}
                        </p>
                        <div className={`flex items-center gap-1 text-sm font-medium mt-1 ${liveData.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {liveData.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          <span>{liveData.isPositive ? '+' : ''}{liveData.change} ({liveData.changePercent}%)</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm sticky top-6">
            <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" />
              Add to Watchlist
            </h2>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. RELIANCE"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Reliance Industries"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isAdding || !newSymbol || !newName}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isAdding ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Add Stock</span>
                  </>
                )}
              </button>
            </form>
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
