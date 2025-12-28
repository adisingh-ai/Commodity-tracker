import React, { useEffect, useState } from 'react';
import CommodityChart from './components/CommodityChart';
import ChatInterface from './components/ChatInterface';
import { parseCSV } from './utils';
import { SILVER_CSV, GOLD_CSV } from './constants';
import { DataPoint, MetalType } from './types';

const App: React.FC = () => {
  const [goldData, setGoldData] = useState<DataPoint[]>([]);
  const [silverData, setSilverData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetal, setActiveMetal] = useState<MetalType>(MetalType.GOLD);

  useEffect(() => {
    // Parse data on mount
    const processData = () => {
      try {
        const gold = parseCSV(GOLD_CSV);
        const silver = parseCSV(SILVER_CSV);
        setGoldData(gold);
        setSilverData(silver);
      } catch (error) {
        console.error("Failed to parse CSV data", error);
      } finally {
        setLoading(false);
      }
    };

    processData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-500 mb-4"></div>
          <p className="text-lg animate-pulse">Loading Historical Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-[1920px] mx-auto pb-10">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className={`transition-colors duration-500 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${activeMetal === MetalType.GOLD ? 'bg-gradient-to-br from-gold-400 to-gold-600' : 'bg-gradient-to-br from-slate-300 to-slate-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-900">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Precious Metals Analytics</h1>
            <p className="text-xs text-slate-400">1915 - 2025 Historical Data Viewer</p>
          </div>
        </div>
        
        {/* Simple stat badges */}
        <div className="hidden md:flex gap-4">
          <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase font-semibold">Gold Records</p>
            <p className="text-sm font-bold text-gold-400">{goldData.length.toLocaleString()} pts</p>
          </div>
          <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase font-semibold">Silver Records</p>
            <p className="text-sm font-bold text-silver-400">{silverData.length.toLocaleString()} pts</p>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Charts (Takes up 2/3 on large screens) */}
        <div className="lg:col-span-2 min-h-[600px] flex flex-col">
          <CommodityChart 
            goldData={goldData} 
            silverData={silverData} 
            activeMetal={activeMetal}
            onToggle={setActiveMetal}
          />
        </div>

        {/* Right Column: Chat (Takes up 1/3 on large screens) */}
        <div className="lg:col-span-1 min-h-[600px] flex flex-col sticky top-24 self-start">
          <ChatInterface activeMetal={activeMetal} />
        </div>

      </main>
    </div>
  );
};

export default App;