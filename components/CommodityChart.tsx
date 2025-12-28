import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
  ReferenceArea
} from 'recharts';
import { DataPoint, MetalType } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface CommodityChartProps {
  goldData: DataPoint[];
  silverData: DataPoint[];
  activeMetal: MetalType;
  onToggle: (metal: MetalType) => void;
}

const CommodityChart: React.FC<CommodityChartProps> = ({ goldData, silverData, activeMetal, onToggle }) => {
  const chartData = useMemo(() => {
    return activeMetal === MetalType.GOLD ? goldData : silverData;
  }, [activeMetal, goldData, silverData]);

  const color = activeMetal === MetalType.GOLD ? '#EAB308' : '#94A3B8'; // Tailwind yellow-500 / slate-400
  const titleColor = activeMetal === MetalType.GOLD ? 'text-gold-400' : 'text-silver-400';

  // Calculate significant trends for background highlights
  const trends = useMemo(() => {
    // Need at least 12 months of data to calculate momentum
    if (chartData.length < 12) return [];

    const result: { x1: string; x2: string; type: 'up' | 'down' }[] = [];
    let currentTrend: { type: 'up' | 'down'; start: string } | null = null;

    // Iterate starting from index 12 (1 year in)
    for (let i = 12; i < chartData.length; i++) {
      const currentVal = chartData[i].value;
      const prevYearVal = chartData[i - 12].value; // Approx 12 months ago
      const change = (currentVal - prevYearVal) / prevYearVal;

      // Thresholds: +20% for Bull run, -15% for Bear drop
      let trendType: 'up' | 'down' | null = null;
      if (change > 0.20) trendType = 'up';
      else if (change < -0.15) trendType = 'down';

      if (currentTrend) {
        // If trend type changes or stops, close the current region
        if (currentTrend.type !== trendType) {
          result.push({
            x1: currentTrend.start,
            x2: chartData[i - 1].date,
            type: currentTrend.type
          });
          currentTrend = null;
          // Start new trend if applicable
          if (trendType) {
            currentTrend = { type: trendType, start: chartData[i].date };
          }
        }
      } else {
        // Start a new trend
        if (trendType) {
          currentTrend = { type: trendType, start: chartData[i].date };
        }
      }
    }

    // Close any trailing trend
    if (currentTrend) {
      result.push({
        x1: currentTrend.start,
        x2: chartData[chartData.length - 1].date,
        type: currentTrend.type
      });
    }

    return result;
  }, [chartData]);

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700 transition-all duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className={`${titleColor} transition-colors duration-300`}>{activeMetal}</span> Price History
          <span className="text-xs font-normal text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">1915 - 2025</span>
        </h2>
        
        {/* Toggle Switch */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => onToggle(MetalType.GOLD)}
            className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
              activeMetal === MetalType.GOLD
                ? 'bg-gold-500 text-slate-900 shadow-lg scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Gold
          </button>
          <button
            onClick={() => onToggle(MetalType.SILVER)}
            className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
              activeMetal === MetalType.SILVER
                ? 'bg-silver-400 text-slate-900 shadow-lg scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Silver
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[450px] w-full p-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(str) => {
                const date = new Date(str);
                return date.getFullYear().toString();
              }}
              minTickGap={30}
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tickFormatter={(val) => `$${val}`}
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              width={60}
              axisLine={{ stroke: '#475569' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '0.5rem' }}
              labelFormatter={(label) => formatDate(label)}
              formatter={(value: number) => [formatCurrency(value), 'Price']}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              animationDuration={0}
            />
            <Legend verticalAlign="top" height={36}/>
            
            {/* Render Trend Indicators in Background */}
            {trends.map((trend, index) => (
              <ReferenceArea
                key={`trend-${index}`}
                x1={trend.x1}
                x2={trend.x2}
                fill={trend.type === 'up' ? '#22c55e' : '#ef4444'}
                fillOpacity={0.1}
                strokeOpacity={0}
              />
            ))}

            <Line 
              key={activeMetal} 
              type="monotone" 
              dataKey="value" 
              name={`${activeMetal} Price (USD)`} 
              stroke={color} 
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={false} // Disable animation for performance with large datasets
            />
            <Brush 
              dataKey="date" 
              height={30} 
              stroke="#64748b" 
              fill="#1e293b" 
              tickFormatter={(str) => new Date(str).getFullYear().toString()}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="px-4 pb-2 flex justify-between items-center text-xs text-slate-500">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500/20 border border-green-500/50 rounded-sm inline-block"></span>
            <span>Bull Trend ({'>'}20% YoY)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded-sm inline-block"></span>
            <span>Bear Trend ({'<'}15% YoY)</span>
          </div>
        </div>
        <span>Use the slider at the bottom to zoom into specific years and months.</span>
      </div>
    </div>
  );
};

export default CommodityChart;