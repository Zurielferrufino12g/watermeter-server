
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AnalysisView = () => {
  const [activeTab, setActiveTab] = useState('diario');
  const [selectedDay, setSelectedDay] = useState(14);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const weeklyCompareData = [
    { week: 'Semana 1', value: 850 },
    { week: 'Semana 2', value: 920 },
    { week: 'Semana 3', value: 780 },
    { week: 'Semana 4', value: 810 },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight">
            Análisis de Consumo <span className="text-primary">2026</span>
          </h2>
          <p className="text-slate-400 mt-2">Profundiza en tus datos diarios, semanales o mensuales.</p>
        </div>
        <div className="bg-surface p-1 rounded-xl border border-border-soft flex items-center shadow-lg">
          {['diario', 'semanal', 'mensual'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === tab ? 'bg-primary text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        <div className="lg:col-span-8">
          {activeTab === 'diario' || activeTab === 'mensual' ? (
            <div className="bg-card rounded-[2.5rem] p-8 border border-border-soft shadow-2xl relative overflow-hidden h-full">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <button className="size-10 rounded-xl bg-surface border border-white/5 text-slate-400 hover:text-white transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <h2 className="text-2xl font-bold text-white font-display">Octubre <span className="text-accent ml-2">2026</span></h2>
                  <button className="size-10 rounded-xl bg-surface border border-white/5 text-slate-400 hover:text-white transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-500"></span> Bajo</div>
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-accent"></span> Alto</div>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-6">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.2em] py-3 text-slate-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-4">
                {[29, 30].map(d => (
                  <div key={`prev-${d}`} className="aspect-square flex items-center justify-center text-slate-800 text-sm font-medium opacity-20">
                    {d}
                  </div>
                ))}
                {days.map(d => {
                  const isHigh = d % 7 === 0 || d === 12 || d === 18;
                  const isMed = d % 5 === 0;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`group aspect-square relative flex flex-col items-center justify-center rounded-2xl border transition-all transform hover:scale-105 ${
                        selectedDay === d 
                        ? 'bg-primary text-white border-primary shadow-2xl shadow-blue-500/40 z-10' 
                        : 'bg-surface/50 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className={`text-sm font-bold ${selectedDay === d ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{d}</span>
                      <div className="absolute bottom-2 flex gap-1">
                        {isHigh && <div className={`size-1 rounded-full ${selectedDay === d ? 'bg-white' : 'bg-accent'}`}></div>}
                        {isMed && <div className={`size-1 rounded-full ${selectedDay === d ? 'bg-white/50' : 'bg-emerald-500'}`}></div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-[2.5rem] p-8 border border-border-soft shadow-2xl h-full flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-bold text-white font-display">Comparativa por Semanas</h3>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-lg uppercase tracking-[0.2em]">Octubre 2026</span>
              </div>
              <div className="flex-1 min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCompareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px'}} />
                    <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={60}>
                      {weeklyCompareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#FF6B00' : '#2563EB'} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-card rounded-[2.5rem] border border-border-soft overflow-hidden shadow-2xl h-full flex flex-col">
            <div className="p-8 border-b border-border-soft flex items-center justify-between bg-gradient-to-br from-card to-black/50">
              <div>
                <h3 className="text-2xl font-bold text-white font-display">
                  {activeTab === 'semanal' ? 'Reporte Semanal' : `Día ${selectedDay}`}
                </h3>
                <p className="text-accent text-[10px] uppercase tracking-[0.2em] font-black mt-1">Octubre 2026</p>
              </div>
              <div className="size-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <span className="material-symbols-outlined text-2xl font-light">history_toggle_off</span>
              </div>
            </div>
            
            <div className="p-8 space-y-8 flex-1 flex flex-col">
              <div className="flex items-end justify-between gap-1.5 h-24 mb-2">
                {[30, 45, 20, 10, 80, 65, 40, 95, 25, 15, 10, 5].map((h, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-all duration-700 ${h > 70 ? 'bg-accent shadow-[0_0_15px_rgba(255,107,0,0.3)]' : 'bg-slate-800'}`}
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>

              <div className="text-center py-4">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Total del periodo</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-black text-white tracking-tighter">
                    {activeTab === 'semanal' ? '840' : '150'}
                  </span>
                  <span className="text-2xl font-bold text-primary">Litros</span>
                </div>
              </div>

              <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-white/5">
                Exportar Reporte <span className="material-symbols-outlined text-lg">download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
