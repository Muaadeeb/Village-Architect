
import React from 'react';
import { CalendarDays } from 'lucide-react';
import { Festival } from '../types';
import { PageNumber, getSeasonIcon } from '../VillageUtils';

export const FestivalsSection: React.FC<{ festivals: Festival[], page: number }> = ({ festivals, page }) => (
  <section className="parchment relative w-full max-w-5xl">
    <PageNumber n={page} />
    <h3 className="text-5xl font-bold medieval-font border-b-4 border-stone-800 mb-10 pb-4 uppercase text-black flex items-center gap-5">
        <CalendarDays size={48} /> Cycle of Tradition: Local Festivals
    </h3>
    <div className="grid grid-cols-2 gap-8">
      {festivals.map((fest, idx) => (
        <div key={idx} className="dossier-card p-8 relative break-inside-avoid flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b-2 border-stone-200 pb-2">
            <span className="font-bold text-black uppercase medieval-font text-3xl tracking-tight">{fest.name}</span>
            {getSeasonIcon(fest.season)}
          </div>
          <p className="text-xs font-black text-stone-500 uppercase mb-6 tracking-widest">{fest.timing} OF {fest.season}</p>
          <div className="space-y-6 flex-1">
            <div>
              <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] mb-2">ANCIENT LORE</p>
              <p className="text-lg italic font-bold text-stone-950 leading-snug">"{fest.lore}"</p>
            </div>
            <div className="bg-stone-50 p-6 border-2 border-stone-200 rounded-sm">
              <p className="text-[10px] font-black text-stone-400 uppercase mb-2">MODERN RITUAL</p>
              <p className="text-base font-bold text-stone-900 leading-tight">Practice: {fest.modernPractice}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);
