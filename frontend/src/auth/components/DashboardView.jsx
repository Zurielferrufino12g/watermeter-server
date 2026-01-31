
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import MetricCard from './MetricCard';
import { GoogleGenAI } from "@google/genai";

const annualData = [
  { month: 'Ene', value: 200 }, { month: 'Feb', value: 180 },
  { month: 'Mar', value: 220 }, { month: 'Abr', value: 250 },
  { month: 'May', value: 300 }, { month: 'Jun', value: 350 },
  { month: 'Jul', value: 420 }, { month: 'Ago', value: 450 },
  { month: 'Sep', value: 380 }, { month: 'Oct', value: 325 },
  { month: 'Nov', value: 280 }, { month: 'Dic', value: 260 },
];

const weeklyData = [
  { day: 'Lun', value: 145 }, { day: 'Mar', value: 132 },
  { day: 'Mié', value: 160 }, { day: 'Jue', value: 110 },
  { day: 'Vie', value: 155 }, { day: 'Sáb', value: 180 },
  { day: 'Dom', value: 120 },
];

const DashboardView = () => {
  const [insight, setInsight] = useState("Analizando patrones de consumo hídrico...");

  useEffect(() => {
    const getSmartInsight = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analiza estos datos de consumo de agua: ${JSON.stringify(annualData)}. 
                     Dame un consejo de 15 palabras para ahorrar agua en 2026.`,
        });
        setInsight(response.text || "Optimiza tu riego nocturno para reducir la evaporación.");
      } catch (error) {
        setInsight("Detectado patrón de ahorro eficiente. Continúa así para reducir tu factura.");
      }
    };
    getSmartInsight();
  }, []);

  return (
    <div className="animate-view">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-white tracking-tighter leading-tight">
            Dashboard <span className="text-primary italic">2026</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Gestión inteligente de recursos hídricos.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl">
          <button className="px-8 py-2.5 rounded-xl bg-accent text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
            Mensual
          </button>
          <button className="px-8 py-2.5 rounded-xl text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all">
            Anual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard label="Uso Diario" value="128 Litros" trend="-4%" trendType="down" icon="water_drop" color="blue" period="hoy" />
        <MetricCard label="Costo Estimado" value="Bs 42.50" trend="+8%" trendType="up" icon="payments" color="orange" period="esta semana" />
        <MetricCard label="Nivel de Ahorro" value="Óptimo" trend="A+" trendType="down" icon="eco" color="green" isHighlight />
        <MetricCard label="Alertas" value="Ninguna" trend="0 detectadas" trendType="down" icon="verified" color="slate" />
      </div>

      {/* AI Insight Bar */}
      <div className="mb-12 p-6 rounded-[2rem] bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/20 flex items-center gap-4">
        <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white animate-pulse">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div>
          <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Gemini AI Insight</h4>
          <p className="text-white font-medium">{insight}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-panel rounded-[3rem] p-10 flex flex-col min-h-[500px] shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="flex justify-between items-center mb-12 relative z-10">
            <h3 className="text-2xl font-bold text-white font-display tracking-tight">Análisis de Tendencias</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                 <span className="size-2 rounded-full bg-primary shadow-[0_0_10px_#2563EB]"></span> Real 2026
               </div>
            </div>
          </div>
          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={annualData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} dy={15} />
                <Tooltip 
                  cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1}}
                  contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px'}}
                  itemStyle={{color: '#fff', fontSize: '14px'}}
                />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={6} fillOpacity={1} fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 glass-panel rounded-[3rem] p-10 flex flex-col shadow-2xl relative overflow-hidden group">
          <h3 className="text-xl font-bold text-white font-display mb-10">Flujo Semanal</h3>
          <div className="flex-1 w-full mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={32}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#FF6B00' : 'rgba(255,255,255,0.08)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Eficiencia</span>
              <span className="text-sm font-bold text-white">Óptima</span>
            </div>
            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Pico</span>
              <span className="text-sm font-bold text-accent">Sábado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
