
import React, { useState } from 'react';

const AlertBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="bg-[#0f172a] border border-blue-500/30 rounded-3xl p-5 md:p-6 flex items-center gap-6 min-w-[340px] max-w-md backdrop-blur-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-accent"></div>
        <div className="size-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-accent shrink-0">
          <span className="material-symbols-outlined text-2xl">verified</span>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white text-sm">Cambios Guardados</h4>
          <p className="text-xs text-slate-400 mt-1">
            La regla de <span className="text-accent font-bold">Octubre</span> ha sido actualizada con éxito.
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;
