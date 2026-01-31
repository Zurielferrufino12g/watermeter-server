
import React from 'react';

const MetricCard = ({ 
  label, value, trend, trendType, icon, color, period, isHighlight 
}) => {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-900/20 border-blue-500/10',
    orange: 'text-accent bg-orange-900/20 border-accent/10',
    green: 'text-emerald-500 bg-emerald-900/20 border-emerald-500/10',
    slate: 'text-slate-400 bg-slate-800 border-white/5'
  };

  return (
    <div className={`bg-card rounded-3xl p-6 border border-border-soft hover:bg-card-hover transition-all duration-300 relative overflow-hidden group ${isHighlight ? 'bg-gradient-to-br from-[#111] to-[#1a1005] border-accent/20' : ''}`}>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`size-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <span className="material-symbols-outlined font-light fill-1">{icon}</span>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isHighlight ? 'text-accent' : 'text-slate-600'}`}>
          {label}
        </span>
      </div>
      
      <div className="relative z-10">
        <p className="text-white text-3xl font-display font-bold tracking-tight mb-2">{value}</p>
        {trend && (
          <div className="flex items-center gap-2">
            <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
              trendType === 'down' ? 'text-emerald-400 bg-emerald-500/10' : 'text-accent bg-accent/10'
            }`}>
              <span className="material-symbols-outlined text-[14px] mr-1">
                {trendType === 'down' ? 'trending_down' : trendType === 'up' ? 'trending_up' : 'trending_flat'}
              </span>
              {trend}
            </span>
            <span className="text-[11px] text-slate-600 font-medium">{period}</span>
          </div>
        )}
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <span className="material-symbols-outlined text-[100px]">{icon}</span>
      </div>
    </div>
  );
};

export default MetricCard;
