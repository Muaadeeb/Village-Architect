
import React from 'react';
import { Target, Swords } from 'lucide-react';
import { Quest } from '../types';

export const QuestsSection: React.FC<{ mainQuests: Quest[], sideTreks: Quest[] }> = ({ mainQuests, sideTreks }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
    <div>
      <h4 className="text-3xl font-bold medieval-font uppercase text-black mb-6 flex items-center gap-4 border-b-4 border-stone-800 pb-2">
        <Target size={32}/> Main Village Quests
      </h4>
      <div className="space-y-6">
        {mainQuests.map((q, i) => (
          <div key={i} className="dossier-card p-6 break-inside-avoid bg-white">
            <h5 className="text-xl font-bold text-black border-b border-stone-200 pb-2 mb-3">{q.title}</h5>
            <p className="text-base italic font-bold mb-4 leading-snug">"{q.description}"</p>
            <div className="text-[10px] uppercase font-black text-stone-500 tracking-[0.2em] bg-stone-100 p-2 inline-block rounded">REWARD: {q.reward}</div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <h4 className="text-3xl font-bold medieval-font uppercase text-black mb-6 flex items-center gap-4 border-b-4 border-stone-800 pb-2">
        <Swords size={32}/> Side Treks & Rumors
      </h4>
      <div className="space-y-4">
        {sideTreks.map((q, i) => (
          <div key={i} className="bg-white border-2 border-stone-200 p-5 rounded-sm break-inside-avoid hover:border-stone-400 transition-colors">
            <h5 className="font-bold text-black border-b border-stone-100 pb-1 mb-2 text-lg uppercase medieval-font">{q.title}</h5>
            <p className="text-base font-bold italic leading-tight text-stone-800">"{q.description}"</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
