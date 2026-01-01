
import React from 'react';
import { ShoppingBag, ShieldAlert, CircleDot } from 'lucide-react';
import { Business } from '../types';
import { PageNumber } from '../VillageUtils';

export const MarketLedgerSection: React.FC<{ businesses: Business[], page: number }> = ({ businesses, page }) => (
  <section className="parchment relative w-full max-w-5xl">
    <PageNumber n={page} />
    <h3 className="text-5xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-3 uppercase text-black flex items-center gap-5"><ShoppingBag size={48} /> Marketplace Ledger</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {businesses.map((biz, b) => (
        <div key={b} className="p-6 bg-white/60 border-2 border-stone-800 rounded shadow-lg break-inside-avoid">
          <div className="flex justify-between items-end border-b-2 border-stone-800 pb-2 mb-4">
            <div><h4 className="text-3xl font-bold medieval-font text-black uppercase leading-tight">{biz.name}</h4><p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{biz.type}</p></div>
            <span className="text-[10px] font-black uppercase text-stone-700 bg-white px-3 py-1 border border-stone-800 rounded-full shadow-sm">Proprietor: {biz.owner.name}</span>
          </div>
          <div className="grid grid-cols-1 gap-y-2 mb-4">
            {biz.marketItems.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm border-b border-dashed border-stone-300">
                <div className="flex items-center gap-2 font-black">
                  <CircleDot size={10} className="text-stone-400" />
                  <span className="text-xs">{item.name}</span>
                </div>
                <span className="font-black medieval-font text-lg">{item.price}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-100/60 rounded border-l-4 border-amber-800 shadow-inner flex gap-3 items-center">
            <ShieldAlert className="text-amber-900 shrink-0" size={24} />
            <p className="text-xs italic font-bold text-amber-950 leading-tight">"{biz.rumor}"</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
