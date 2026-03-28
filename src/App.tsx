import { useState, useEffect } from "react";
import { Radar, LineChart, MessageSquare, Video, LayoutDashboard, LogOut, User, Globe, ListFilter, Layers, Newspaper, ListPlus, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import { OpportunityRadar } from "./components/OpportunityRadar";
import { ChartIntelligence } from "./components/ChartIntelligence";
import { MarketChat } from "./components/MarketChat";
import { VideoEngine } from "./components/VideoEngine";
import { MarketDashboard } from "./components/MarketDashboard";
import { TickerTape } from "./components/TickerTape";
import { Login } from "./components/Login";
import { PortfolioModal } from "./components/PortfolioModal";
import { OptionsChain } from "./components/OptionsChain";
import { StockScreener } from "./components/StockScreener";
import { MarketNews } from "./components/MarketNews";
import { Watchlist } from "./components/Watchlist";
import { auth, logOut } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

type Tab = "dashboard" | "radar" | "charts" | "options" | "screener" | "chat" | "video" | "news" | "watchlist";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <MarketDashboard />;
      case "radar": return <OpportunityRadar />;
      case "charts": return <ChartIntelligence />;
      case "options": return <OptionsChain />;
      case "screener": return <StockScreener />;
      case "chat": return <MarketChat />;
      case "video": return <VideoEngine />;
      case "news": return <MarketNews />;
      case "watchlist": return <Watchlist />;
      default: return <MarketDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans overflow-hidden">
      <TickerTape />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-zinc-900/50 border-r border-zinc-800 flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-zinc-100 leading-tight font-display text-lg">ET Markets</h1>
                <p className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase">AI Intelligence</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto sidebar-scroll">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-3 mt-2">Markets</div>
            <NavItem 
              icon={<Globe size={18} />} 
              label="Market Dashboard" 
              isActive={activeTab === "dashboard"} 
              onClick={() => setActiveTab("dashboard")} 
            />
            <NavItem 
              icon={<Newspaper size={18} />} 
              label="Live News" 
              isActive={activeTab === "news"} 
              onClick={() => setActiveTab("news")} 
            />
            <NavItem 
              icon={<ListPlus size={18} />} 
              label="My Watchlist" 
              isActive={activeTab === "watchlist"} 
              onClick={() => setActiveTab("watchlist")} 
            />
            <NavItem 
              icon={<Layers size={18} />} 
              label="Options Chain" 
              isActive={activeTab === "options"} 
              onClick={() => setActiveTab("options")} 
            />
            <NavItem 
              icon={<ListFilter size={18} />} 
              label="Stock Screener" 
              isActive={activeTab === "screener"} 
              onClick={() => setActiveTab("screener")} 
            />
            
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-3 mt-6">Intelligence</div>
            <NavItem 
              icon={<Radar size={18} />} 
              label="Opportunity Radar" 
              isActive={activeTab === "radar"} 
              onClick={() => setActiveTab("radar")} 
            />
            <NavItem 
              icon={<LineChart size={18} />} 
              label="Chart Intelligence" 
              isActive={activeTab === "charts"} 
              onClick={() => setActiveTab("charts")} 
            />
            <NavItem 
              icon={<MessageSquare size={18} />} 
              label="Market ChatGPT" 
              isActive={activeTab === "chat"} 
              onClick={() => setActiveTab("chat")} 
            />
            <NavItem 
              icon={<Video size={18} />} 
              label="AI Video Engine" 
              isActive={activeTab === "video"} 
              onClick={() => setActiveTab("video")} 
            />
          </nav>

          <div className="p-4 border-t border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-zinc-400 font-mono">NSE/BSE Connected</span>
            </div>
            
            <div className="flex items-center justify-between px-2">
              <button 
                onClick={() => setIsPortfolioOpen(true)}
                className="flex items-center gap-2 overflow-hidden hover:bg-zinc-800/50 p-1.5 -ml-1.5 rounded-lg transition-colors text-left flex-1"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <User size={14} className="text-zinc-400" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-200 truncate max-w-[110px]">{user.displayName || user.email}</span>
                  <span className="text-[10px] text-indigo-400 font-medium">View Portfolio</span>
                </div>
              </button>
              <button 
                onClick={() => {
                  logOut();
                  toast.success("Logged out successfully");
                }} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-2" 
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-zinc-950/50 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-indigo-500/5 blur-[150px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-purple-500/5 blur-[150px] rounded-full mix-blend-screen" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isPortfolioOpen && (
          <PortfolioModal user={user} onClose={() => setIsPortfolioOpen(false)} />
        )}
      </AnimatePresence>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
        isActive 
          ? "text-indigo-300 bg-indigo-500/10 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]" 
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`}
    >
      {isActive && (
        <motion.div 
          layoutId="activeNavIndicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"
        />
      )}
      <span className={`relative z-10 flex items-center gap-3 ${isActive ? 'text-indigo-400' : ''}`}>
        {icon}
        {label}
      </span>
    </button>
  );
}

function TrendingUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
  );
}
