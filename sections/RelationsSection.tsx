
import React from 'react';
import { Globe } from 'lucide-react';
import { SettlementRelation } from '../types';
import { PageNumber } from '../VillageUtils';

export const RelationsSection: React.FC<{ relations: SettlementRelation[], page: number }> = ({ relations, page }) => (
  <section className="parchment relative w-full max-w-5xl">
    <PageNumber n={page} />
    <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-3 uppercase text-black flex items-center gap-4"><Globe size={40} /> Nearby Settlement Relations</h3>
    <div className="grid grid-cols-2 gap-8">
      {relations.map((rel, idx) => (
        <div key={idx} className="p-8 bg-white/40 border-4 border-stone-800 rounded-lg shadow-lg flex flex-col break-inside-avoid h-full">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-3xl font-bold medieval-font text-black">{rel.settlementName}</h4>
            <span className={`text-xs font-black px-3 py-1 rounded border-2 uppercase ${rel.type === 'Harmful' ? 'bg-red-100 border-red-800 text-red-900' : 'bg-stone-200 border-stone-800 text-stone-900'}`}>{rel.type}</span>
          </div>
          <p className="text-xs font-black uppercase text-stone-500 mb-4 italic border-b border-stone-300 pb-1">Status: {rel.status}</p>
          <p className="text-lg italic text-black font-bold leading-relaxed">"{rel.description}"</p>
        </div>
      ))}
    </div>
  </section>
);
