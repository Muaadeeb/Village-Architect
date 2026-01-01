
import React from 'react';
import { Target, Swords } from 'lucide-react';
import { Quest } from '../types';

export const QuestsSection: React.FC<{ mainQuests: Quest[], sideTreks: Quest[] }> = ({ mainQuests, sideTreks }) => (
  <div className="grid grid-cols-2 gap-10">
    <div>
      <h4 className="text-2xl font-bold medieval-font uppercase text-black mb-4 flex items-center gap-3 border-b-2 border-stone-800 pb-1"><Target size={24}/> Main Village Quests</h4>
      <div className="space-y-4">
        {mainQuests.map((q, i) => (
          <div key={i} className="p-4 bg-white/40 border border-stone-400 rounded break-inside-avoid">
            <h5 className="font-bold text-black border-b border-stone-300 pb-1 mb-2">{q.title}</h5>
            <p className="text-xs italic font-bold mb-2">"{q.description}"</p>
            <div className="text-[9px] uppercase font-black text-amber-800">Reward: {q.reward}</div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <h4 className="text-2xl font-bold medieval-font uppercase text-black mb-4 flex items-center gap-3 border-b-2 border-stone-800 pb-1"><Swords size={24}/> Side Treks & Rumors</h4>
      <div className="space-y-4">
        {sideTreks.map((q, i) => (
          <div key={i} className="p-4 bg-white/40 border border-stone-400 rounded break-inside-avoid">
            <h5 className="font-bold text-black border-b border-stone-300 pb-1 mb-2">{q.title}</h5>
            <p className="text-[11px] font-bold italic">"{q.description}"</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
