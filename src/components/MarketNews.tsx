import { motion } from "motion/react";
import { Newspaper, TrendingUp, TrendingDown, Clock, ExternalLink, Filter } from "lucide-react";
import { toast } from "sonner";

const NEWS_CATEGORIES = ["All", "Earnings", "Economy", "Markets", "Policy", "Global", "Startups"];

const NEWS_ITEMS = [
  {
    id: 1,
    title: "TCS Q4 Results: Net profit rises 9% YoY to ₹12,434 crore, beats estimates",
    summary: "India's largest IT services firm Tata Consultancy Services (TCS) reported a 9.1% year-on-year (YoY) increase in consolidated net profit at ₹12,434 crore for the quarter ended March 2024.",
    source: "ET Markets",
    time: "10:30 AM",
    category: "Earnings",
    impact: "Positive",
    relatedStocks: ["TCS", "INFY", "WIPRO"],
  },
  {
    id: 2,
    title: "RBI keeps repo rate unchanged at 6.5%, stance remains 'withdrawal of accommodation'",
    summary: "The Reserve Bank of India's Monetary Policy Committee (MPC) decided to keep the policy repo rate unchanged at 6.5% for the seventh consecutive time, as widely expected.",
    source: "Reuters",
    time: "10:45 AM",
    category: "Economy",
    impact: "Neutral",
    relatedStocks: ["HDFCBANK", "ICICIBANK", "SBIN"],
  },
  {
    id: 3,
    title: "Block Deal: 2.5 crore shares of HDFC Bank change hands at ₹1,445/share",
    summary: "A large block deal took place in HDFC Bank where 2.5 crore shares changed hands at an average price of ₹1,445 per share. The buyers and sellers were not immediately known.",
    source: "Bloomberg",
    time: "10:15 AM",
    category: "Markets",
    impact: "Neutral",
    relatedStocks: ["HDFCBANK"],
  },
  {
    id: 4,
    title: "Govt cuts windfall tax on crude oil to ₹3,200 per tonne",
    summary: "The government has reduced the windfall tax on domestically produced crude oil to ₹3,200 per tonne from ₹4,900 per tonne, effective immediately.",
    source: "PTI",
    time: "09:50 AM",
    category: "Policy",
    impact: "Positive",
    relatedStocks: ["ONGC", "OIL", "RELIANCE"],
  },
  {
    id: 5,
    title: "US Inflation rises more than expected in March, dashing hopes of early rate cut",
    summary: "US consumer prices increased more than expected in March, casting further doubt on whether the Federal Reserve will start cutting interest rates in June.",
    source: "WSJ",
    time: "08:30 AM",
    category: "Global",
    impact: "Negative",
    relatedStocks: ["NIFTY 50", "SENSEX"],
  },
  {
    id: 6,
    title: "Swiggy files draft papers for $1.25 billion IPO",
    summary: "Food delivery giant Swiggy has filed its draft red herring prospectus (DRHP) with the Securities and Exchange Board of India (SEBI) for a $1.25 billion initial public offering.",
    source: "ET Tech",
    time: "Yesterday",
    category: "Startups",
    impact: "Positive",
    relatedStocks: ["ZOMATO", "INFOEDGE"],
  }
];

export function MarketNews() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white font-display">Live Market News</h2>
          <p className="text-zinc-400 text-sm mt-1">Real-time updates, earnings reports, and macroeconomic indicators.</p>
        </div>
        <button 
          onClick={() => toast.info("News filters coming soon")}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
        >
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {NEWS_CATEGORIES.map((category, i) => (
          <button
            key={category}
            onClick={() => toast.success(`Showing ${category} news`)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              i === 0 
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* News Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {NEWS_ITEMS.map((news, i) => (
            <motion.div
              key={news.id}
              onClick={() => toast.info(`Opening article: ${news.title}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${news.impact === 'Positive' ? 'from-emerald-900/10 to-zinc-900/50 border-emerald-500/10 hover:border-emerald-500/30' : news.impact === 'Negative' ? 'from-rose-900/10 to-zinc-900/50 border-rose-500/10 hover:border-rose-500/30' : 'from-indigo-900/10 to-zinc-900/50 border-indigo-500/10 hover:border-indigo-500/30'} border rounded-xl p-6 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl relative overflow-hidden`}
            >
              <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none ${news.impact === 'Positive' ? 'bg-emerald-500' : news.impact === 'Negative' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-md">
                    {news.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                    <Clock size={12} />
                    {news.time}
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${
                  news.impact === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' :
                  news.impact === 'Negative' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {news.impact === 'Positive' && <TrendingUp size={12} />}
                  {news.impact === 'Negative' && <TrendingDown size={12} />}
                  {news.impact} Impact
                </div>
              </div>

              <h3 className="text-lg font-semibold text-zinc-100 mb-2 group-hover:text-indigo-400 transition-colors relative z-10">
                {news.title}
              </h3>
              
              <p className="text-sm text-zinc-400 mb-4 line-clamp-2 relative z-10">
                {news.summary}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Related:</span>
                  <div className="flex gap-2">
                    {news.relatedStocks.map(stock => (
                      <span key={stock} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                        {stock}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  {news.source}
                  <ExternalLink size={12} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              Trending Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {["#TCSQ4", "#RBI", "#Inflation", "#SwiggyIPO", "#HDFCBlockDeal", "#CrudeOil", "#NiftyATH"].map(tag => (
                <span 
                  key={tag} 
                  onClick={() => toast.success(`Showing news for ${tag}`)}
                  className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg cursor-pointer transition-colors border border-zinc-700/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Newspaper size={16} className="text-indigo-400" />
              Top Sources
            </h3>
            <div className="space-y-3">
              {[
                { name: "Economic Times", count: 45 },
                { name: "Moneycontrol", count: 32 },
                { name: "Reuters", count: 28 },
                { name: "Bloomberg", count: 24 },
                { name: "Mint", count: 18 },
              ].map((source, i) => (
                <div 
                  key={i} 
                  onClick={() => toast.success(`Showing news from ${source.name}`)}
                  className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="text-sm text-zinc-300">{source.name}</span>
                  <span className="text-xs font-mono text-zinc-500">{source.count} articles</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
