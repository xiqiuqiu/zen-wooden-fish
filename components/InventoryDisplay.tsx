import React from 'react';
import { Inventory, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface InventoryDisplayProps {
  inventory: Inventory;
  totalClicks: number;
  language: Language;
}

const ItemBlock: React.FC<{ label: string; count: number; icon: string; color: string }> = ({ label, count, icon, color }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-stone-200 shadow-sm ${count > 0 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
    <div className={`text-3xl mb-1 ${color}`}>{icon}</div>
    <div className="text-stone-800 font-serif font-bold text-xl">{count}</div>
    <div className="text-stone-500 text-xs font-serif uppercase tracking-wider">{label}</div>
  </div>
);

export const InventoryDisplay: React.FC<InventoryDisplayProps> = ({ inventory, totalClicks, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="w-full max-w-2xl px-4 py-6">
       <div className="grid grid-cols-4 gap-4 mb-4">
          <ItemBlock 
            label={t.items.lotus} 
            count={inventory.lotus} 
            icon="🪷" 
            color="text-pink-500"
          />
          <ItemBlock 
            label={t.items.incense} 
            count={inventory.incense} 
            icon="♨️" 
            color="text-amber-700"
          />
          <ItemBlock 
            label={t.items.beads} 
            count={inventory.beads} 
            icon="📿" 
            color="text-amber-900"
          />
          <ItemBlock 
            label={t.items.merits} 
            count={inventory.merits} 
            icon="✨" 
            color="text-yellow-500"
          />
       </div>
       
       <div className="text-center">
         <p className="text-stone-400 text-sm font-serif italic">
           {t.total_accumulation}: {totalClicks.toLocaleString()}
         </p>
       </div>
    </div>
  );
};