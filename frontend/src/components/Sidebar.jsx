
import React from 'react';
import { AppView } from '../../types';

const Sidebar = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Tablero', icon: 'dashboard' },
    { id: AppView.ANALYSIS, label: 'Análisis', icon: 'analytics' },
    { id: AppView.SETTINGS, label: 'Ajustes', icon: 'tune' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-surface border-r border-border-soft h-full p-6 justify-between">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <span className="material-symbols-outlined font-bold">water_drop</span>
            </div>
            <h1 className="text-xl font-bold font-display text-white tracking-tight">SmartWater</h1>
          </div>
          <p className="text-primary text-[10px] font-bold pl-[52px] uppercase tracking-widest">2026 - Panel de Control</p>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                currentView === item.id
                  ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`material-symbols-outlined ${currentView === item.id ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-sm ${currentView === item.id ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border-soft flex items-center gap-3">
        <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm">JP</div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-white text-sm font-bold truncate">Juan Pérez</p>
          <p className="text-slate-500 text-xs truncate">Casa Principal</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
