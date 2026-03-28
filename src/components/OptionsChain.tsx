import { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { toast } from "sonner";

const STRIKE_PRICES = Array.from({ length: 21 }).map((_, i) => 22000 + (i * 50));
const CURRENT_SPOT = 22453.30;

const generateOptionData = (strike: number, type: 'CE' | 'PE') => {
  const isITM = type === 'CE' ? strike < CURRENT_SPOT : strike > CURRENT_SPOT;
  const distance = Math.abs(strike - CURRENT_SPOT);
  
  // Base premium calculation (very simplified mock)
  let basePremium = isITM ? Math.max(0, type === 'CE' ? CURRENT_SPOT - strike : strike - CURRENT_SPOT) : 0;
  let timeValue = Math.max(0, 200 - (distance * 0.2));
  let ltp = basePremium + timeValue + (Math.random() * 10);
  
  return {
    oi: Math.floor(Math.random() * 50000) + 1000,
    oiChg: (Math.random() * 20 - 10).toFixed(1),
    vol: Math.floor(Math.random() * 1000000),
    iv: (12 + Math.random() * 8).toFixed(2),
    ltp: ltp.toFixed(2),
    chg: (Math.random() * 40 - 20).toFixed(2),
    isITM
  };
};

const OPTIONS_DATA = STRIKE_PRICES.map(strike => ({
  strike,
  ce: generateOptionData(strike, 'CE'),
  pe: generateOptionData(strike, 'PE')
}));

export function OptionsChain() {
  const [asset, setAsset] = useState("NIFTY");
  const [expiry, setExpiry] = useState("28 MAR 2026");

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white font-display">Options Chain</h2>
          <p className="text-zinc-400 text-sm mt-1">Advanced derivatives data with real-time Greeks and OI analysis.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={asset}
            onChange={(e) => {
              setAsset(e.target.value);
              toast.info(`Switched to ${e.target.value} Options Chain`);
            }}
            className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
          >
            <option value="NIFTY">NIFTY 50</option>
            <option value="BANKNIFTY">BANKNIFTY</option>
            <option value="FINNIFTY">FINNIFTY</option>
            <option value="MIDCPNIFTY">MIDCPNIFTY</option>
          </select>
          
          <select 
            value={expiry}
            onChange={(e) => {
              setExpiry(e.target.value);
              toast.info(`Switched expiry to ${e.target.value}`);
            }}
            className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
          >
            <option value="28 MAR 2026">28 Mar 2026 (W)</option>
            <option value="04 APR 2026">04 Apr 2026 (W)</option>
            <option value="25 APR 2026">25 Apr 2026 (M)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        <div className="bg-gradient-to-br from-indigo-900/20 to-zinc-900/50 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-indigo-500 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="text-sm text-zinc-400 mb-1">Spot Price</div>
            <div className="text-xl font-bold text-white font-mono">{CURRENT_SPOT.toFixed(2)}</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center relative z-10 border border-indigo-500/30">
            <Activity size={20} className="text-indigo-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-900/50 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-emerald-500 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="text-sm text-zinc-400 mb-1">PCR (Put Call Ratio)</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">1.15</div>
          </div>
          <div className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 relative z-10">Bullish</div>
        </div>
        <div className="bg-gradient-to-br from-amber-900/20 to-zinc-900/50 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-amber-500 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="text-sm text-zinc-400 mb-1">Max Pain</div>
            <div className="text-xl font-bold text-amber-400 font-mono">22,400</div>
          </div>
          <div className="text-xs font-medium px-2 py-1 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20 relative z-10">Expiry Est.</div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden relative z-10 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-zinc-400 bg-zinc-900 border-b border-zinc-800 uppercase">
              <tr>
                <th colSpan={6} className="px-4 py-3 text-center border-r border-zinc-800 bg-indigo-950/20 text-indigo-300">CALLS (CE)</th>
                <th className="px-4 py-3 text-center bg-zinc-800/50 text-white">STRIKE</th>
                <th colSpan={6} className="px-4 py-3 text-center border-l border-zinc-800 bg-rose-950/20 text-rose-300">PUTS (PE)</th>
              </tr>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-2 py-2 font-medium">OI (Lakhs)</th>
                <th className="px-2 py-2 font-medium">Chng OI %</th>
                <th className="px-2 py-2 font-medium">Volume</th>
                <th className="px-2 py-2 font-medium">IV</th>
                <th className="px-2 py-2 font-medium">LTP</th>
                <th className="px-2 py-2 font-medium border-r border-zinc-800">Chng</th>
                
                <th className="px-4 py-2 font-bold text-center bg-zinc-800/50 text-white">PRICE</th>
                
                <th className="px-2 py-2 font-medium border-l border-zinc-800">Chng</th>
                <th className="px-2 py-2 font-medium">LTP</th>
                <th className="px-2 py-2 font-medium">IV</th>
                <th className="px-2 py-2 font-medium">Volume</th>
                <th className="px-2 py-2 font-medium">Chng OI %</th>
                <th className="px-2 py-2 font-medium">OI (Lakhs)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {OPTIONS_DATA.map((row, i) => (
                <motion.tr 
                  key={row.strike}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Calls */}
                  <td className={`px-2 py-2 ${row.ce.isITM ? 'bg-amber-900/10' : ''}`}>{(row.ce.oi / 10000).toFixed(2)}</td>
                  <td className={`px-2 py-2 ${parseFloat(row.ce.oiChg) > 0 ? 'text-emerald-400' : 'text-rose-400'} ${row.ce.isITM ? 'bg-amber-900/10' : ''}`}>{row.ce.oiChg}%</td>
                  <td className={`px-2 py-2 ${row.ce.isITM ? 'bg-amber-900/10' : ''}`}>{row.ce.vol.toLocaleString()}</td>
                  <td className={`px-2 py-2 ${row.ce.isITM ? 'bg-amber-900/10' : ''}`}>{row.ce.iv}</td>
                  <td className={`px-2 py-2 font-bold text-zinc-200 ${row.ce.isITM ? 'bg-amber-900/10' : ''}`}>{row.ce.ltp}</td>
                  <td className={`px-2 py-2 border-r border-zinc-800 ${parseFloat(row.ce.chg) > 0 ? 'text-emerald-400' : 'text-rose-400'} ${row.ce.isITM ? 'bg-amber-900/10' : ''}`}>{row.ce.chg}</td>
                  
                  {/* Strike */}
                  <td className="px-4 py-2 font-bold text-center bg-zinc-800/30 text-white">{row.strike}</td>
                  
                  {/* Puts */}
                  <td className={`px-2 py-2 border-l border-zinc-800 ${parseFloat(row.pe.chg) > 0 ? 'text-emerald-400' : 'text-rose-400'} ${row.pe.isITM ? 'bg-amber-900/10' : ''}`}>{row.pe.chg}</td>
                  <td className={`px-2 py-2 font-bold text-zinc-200 ${row.pe.isITM ? 'bg-amber-900/10' : ''}`}>{row.pe.ltp}</td>
                  <td className={`px-2 py-2 ${row.pe.isITM ? 'bg-amber-900/10' : ''}`}>{row.pe.iv}</td>
                  <td className={`px-2 py-2 ${row.pe.isITM ? 'bg-amber-900/10' : ''}`}>{row.pe.vol.toLocaleString()}</td>
                  <td className={`px-2 py-2 ${parseFloat(row.pe.oiChg) > 0 ? 'text-emerald-400' : 'text-rose-400'} ${row.pe.isITM ? 'bg-amber-900/10' : ''}`}>{row.pe.oiChg}%</td>
                  <td className={`px-2 py-2 ${row.pe.isITM ? 'bg-amber-900/10' : ''}`}>{(row.pe.oi / 10000).toFixed(2)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
