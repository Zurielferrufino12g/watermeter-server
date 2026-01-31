
import React from 'react';
import { AppView } from '../types';

const Header = ({ currentView, setView }) => {
  return (
    <header className="w-full h-20 px-6 lg:px-10 flex items-center justify-between border-b border-border-soft bg-black/80 backdrop-blur-md z-40 sticky top-0">
      <div className="flex lg:hidden items-center gap-3">
        <div className="size-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-sm">water_drop</span>
        </div>
        <h2 className="text-white font-bold font-display">SmartWater <span className="text-primary">2026</span></h2>
      </div>

      <nav className="hidden md:flex bg-surface rounded-full p-1 border border-border-soft">
        <button
          onClick={() => setView(AppView.DASHBOARD)}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
            currentView === AppView.DASHBOARD ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
          }`}
        >
          Tablero
        </button>
        <button
          onClick={() => setView(AppView.ANALYSIS)}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
            currentView === AppView.ANALYSIS ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
          }`}
        >
          Análisis
        </button>
        <button
          onClick={() => setView(AppView.SETTINGS)}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
            currentView === AppView.SETTINGS ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
          }`}
        >
          Ajustes
        </button>
      </nav>

      <div className="flex items-center gap-5">
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 size-2 bg-accent rounded-full border-2 border-black"></span>
        </button>
        <div className="size-9 rounded-full bg-slate-800 bg-cover bg-center ring-2 ring-white/10 cursor-pointer" 
             style={{ backgroundImage: 'url(https://picsum.photos/100/100?random=1)' }}>
        </div>
      </div>
    </header>
  );
};

export default Header;
