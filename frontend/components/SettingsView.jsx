
import React from 'react';

const SettingsView = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
            Configuración <span className="text-slate-500 font-normal opacity-50">(Estilo Referencia)</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Gestiona las preferencias de visualización y cálculos de consumo para el año 2026.
          </p>
        </div>
        <div className="px-4 py-2 bg-surface rounded-xl border border-white/10 flex items-center gap-2 text-sm text-slate-300">
          <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Sistema Activo
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-3xl p-8 border border-border-soft shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-surface text-primary rounded-xl border border-white/5">
                <span className="material-symbols-outlined">translate</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white">Idioma</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇪🇸</span>
                  <span className="font-bold text-primary">Español</span>
                </div>
                <span className="material-symbols-outlined text-primary">check_circle</span>
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl bg-surface border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <span className="font-medium text-slate-500">Inglés</span>
                </div>
                <div className="size-5 rounded-full border-2 border-slate-800"></div>
              </label>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-8 border border-border-soft shadow-2xl relative overflow-hidden">
             <div className="absolute bottom-0 left-0 size-32 bg-accent/5 rounded-full blur-3xl -ml-10 -mb-10"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-surface text-accent rounded-xl border border-white/5">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white">Moneda</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-accent/10 border border-accent/30 flex flex-col items-center justify-center gap-1 cursor-pointer">
                <span className="text-2xl font-bold text-accent">Bs</span>
                <span className="text-[10px] font-bold text-accent/60 uppercase tracking-widest">Bolivianos</span>
              </div>
              <div className="p-6 rounded-2xl bg-surface border border-white/5 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-2xl font-bold text-slate-400">$</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">USD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="bg-card rounded-[2.5rem] border border-border-soft shadow-2xl flex flex-col h-full overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-accent to-primary"></div>
            
            <div className="p-10 flex-1">
              <div className="flex flex-wrap justify-between items-center gap-6 mb-10">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white">Reglas de Precios Mensuales</h2>
                  <p className="text-slate-400 mt-1">Configura la equivalencia de consumo mes a mes.</p>
                </div>
                <div className="px-5 py-2 bg-surface rounded-full text-xs font-black text-slate-400 border border-white/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-lg">calendar_month</span>
                  2026
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-12">
                {['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'].map((m) => (
                  <button
                    key={m}
                    className={`p-3 rounded-xl border font-black text-[10px] tracking-widest transition-all duration-300 ${
                      m === 'ABR' 
                        ? 'bg-accent text-white border-accent shadow-xl shadow-orange-500/30' 
                        : m === 'MAY' || m === 'JUN' || m === 'JUL'
                        ? 'bg-blue-900/30 text-primary border-blue-500/20 hover:brightness-125'
                        : 'bg-surface text-slate-500 border-white/5 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="bg-surface rounded-3xl p-10 relative overflow-hidden border border-white/5">
                <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] pointer-events-none rotate-[-15deg]">
                  <span className="material-symbols-outlined text-[350px]">water_drop</span>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="font-display font-bold text-2xl text-white flex items-center gap-4">
                      <span className="size-2.5 bg-accent rounded-full shadow-[0_0_15px_#FF6B00]"></span>
                      Regla Activa: Abril
                    </h3>
                    <div className="text-[10px] text-accent bg-accent/10 px-4 py-1.5 rounded-lg border border-accent/20 font-black uppercase tracking-widest">
                      Personalizada
                    </div>
                  </div>

                  <p className="text-slate-400 mb-12 max-w-lg leading-relaxed">
                    Define la equivalencia directa entre dinero y volumen para este mes.
                    <br/><span className="text-accent font-bold mt-2 inline-block">Nota:</span> Cada mes funciona de forma independiente.
                  </p>

                  <div className="flex flex-col md:flex-row items-end justify-between gap-10 border-t border-white/10 pt-12">
                    <div className="w-full flex-1 group">
                      <label className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mb-4 block">Monto (Bs)</label>
                      <input 
                        type="text" 
                        defaultValue="7.00" 
                        className="w-full bg-transparent border-0 border-b-2 border-slate-800 focus:ring-0 focus:border-accent text-6xl font-bold font-display text-white pb-4 transition-all"
                      />
                    </div>
                    
                    <div className="flex flex-col items-center shrink-0 mb-6">
                      <div className="size-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-xl shadow-orange-500/10">
                        <span className="material-symbols-outlined font-black text-2xl">equal</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-3">Equivale a</span>
                    </div>

                    <div className="w-full flex-1 text-right">
                      <label className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mb-4 block">Volumen</label>
                      <input 
                        type="text" 
                        defaultValue="5" 
                        className="w-full bg-transparent border-0 border-b-2 border-slate-800 focus:ring-0 focus:border-accent text-6xl font-bold font-display text-white pb-4 text-right transition-all"
                      />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4 block">LITROS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-surface/50 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <span className="text-xs text-slate-500 font-medium">Última modificación: hace 2 días</span>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl text-slate-500 font-bold hover:text-white hover:bg-white/5 transition-all">
                  Descartar
                </button>
                <button className="flex-1 sm:flex-none px-10 py-3.5 bg-accent hover:bg-orange-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                  Guardar Regla
                  <span className="material-symbols-outlined text-xl">save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
