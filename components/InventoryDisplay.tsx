import React from 'react';
import { Inventory, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface InventoryDisplayProps {
  inventory: Inventory;
  totalClicks: number;
  language: Language;
}

const ItemBlock: React.FC<{ label: string; count: number; icon: string; color: string }> = ({ label, count, icon, color }) => (
  <div className={`
    flex flex-col items-center justify-center 
    p-4 md:p-5 
    rounded-2xl 
    bg-white/60 backdrop-blur-md 
    border border-stone-200/60 
    shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] 
    transition-all duration-300
    ${count > 0 ? 'opacity-100 scale-100' : 'opacity-60 grayscale scale-95'}
  `}>
    {/* Large Icons */}
    <div className={`text-4xl md:text-5xl mb-1 filter drop-shadow-sm transform transition-transform duration-300 hover:scale-110 ${color}`}>{icon}</div>
    
    {/* Large Counter Numbers */}
    <div className="text-stone-800 font-serif font-bold text-3xl md:text-4xl tabular-nums leading-none mb-1">
      {count}
    </div>
    
    {/* Label */}
    <div className="text-stone-500 text-xs md:text-sm font-serif uppercase tracking-widest font-semibold">
      {label}
    </div>
  </div>
);

export const InventoryDisplay: React.FC<InventoryDisplayProps> = ({ inventory, totalClicks, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="w-full max-w-4xl px-4 md:px-8 py-2 md:py-4">
       {/* 
         Mobile: grid-cols-2 (2x2 grid) for larger tap targets and visibility
         Desktop: grid-cols-4 (1 row) for elegance
       */}
       <div className="grid grid-cols-4 md:grid-cols-4 gap-3 md:gap-5 mb-4">
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
         <div className="inline-block px-4 py-1.5 bg-stone-200/40 rounded-full border border-stone-300/30 backdrop-blur-sm">
            <p className="text-stone-500 text-xs md:text-sm font-serif tracking-wide">
             {t.total_accumulation} <span className="font-bold text-stone-700 ml-1">{totalClicks.toLocaleString()}</span>
            </p>
         </div>
       </div>
    </div>
  );
};