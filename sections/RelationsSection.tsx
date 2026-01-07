
import React from 'react';
import { Globe } from 'lucide-react';
import { SettlementRelation } from '../types';
import { PageNumber } from '../VillageUtils';

export const RelationsSection: React.FC<{ relations: SettlementRelation[], page: number }> = ({ relations, page }) => (
  <section className="parchment relative w-full max-w-5xl">
    <PageNumber n={page} />
    <h3 className="text-5xl font-bold medieval-font border-b-4 border-stone-800 mb-10 pb-4 uppercase text-black flex items-center gap-5">
        <Globe size={48} /> Nearby Settlement Relations
    </h3>
    <div className="grid grid-cols-2 gap-10 flex-1">
      {relations.map((rel, idx) => (
        <div key={idx} className="dossier-card p-8 flex flex-col break-inside-avoid h-full">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-3xl font-bold medieval-font text-black">{rel.settlementName}</h4>
            <span className={`text-xs font-black px-4 py-1 rounded border-2 uppercase ${rel.type === 'Harmful' ? 'bg-red-50 border-red-900 text-red-900' : rel.type === 'Good' ? 'bg-emerald-50 border-emerald-900 text-emerald-900' : 'bg-stone-100 border-stone-900 text-stone-900'}`}>{rel.type}</span>
          </div>
          <p className="text-xs font-black uppercase text-stone-500 mb-4 italic border-b border-stone-200 pb-2">STATUS: {rel.status}</p>
          <p className="text-xl italic text-black font-bold leading-relaxed flex-1">"{rel.description}"</p>
        </div>
      ))}
    </div>
  </section>
);
