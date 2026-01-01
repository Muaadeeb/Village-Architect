
import React from 'react';
import { CalendarDays } from 'lucide-react';
import { Festival } from '../types';
import { PageNumber, getSeasonIcon } from '../VillageUtils';

export const FestivalsSection: React.FC<{ festivals: Festival[], page: number }> = ({ festivals, page }) => (
  <section className="parchment relative w-full max-w-5xl">
    <PageNumber n={page} />
    <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-3 uppercase text-black flex items-center gap-4"><CalendarDays size={40} /> Cycle of Tradition: Local Festivals</h3>
    <div className="grid grid-cols-2 gap-6">
      {festivals.map((fest, idx) => (
        <div key={idx} className="p-6 bg-white/40 border-2 border-stone-400 rounded-sm relative break-inside-avoid">
          <div className="flex justify-between items-center mb-3 border-b border-stone-300 pb-1">
            <span className="font-bold text-black uppercase medieval-font text-2xl">{fest.name}</span>
            {getSeasonIcon(fest.season)}
          </div>
          <p className="text-xs font-black text-stone-600 uppercase mb-3">{fest.timing} of {fest.season}</p>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-amber-950 uppercase tracking-widest mb-0.5">Ancient Lore</p>
              <p className="text-base italic font-bold text-stone-950 leading-snug">"{fest.lore}"</p>
            </div>
            <div className="bg-stone-100 p-3 border border-stone-300 rounded">
              <p className="text-[9px] font-black text-stone-500 uppercase">Modern Ritual</p>
              <p className="text-sm font-bold text-stone-900">Practice: {fest.modernPractice}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);
