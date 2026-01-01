
import React from 'react';
import { Skull } from 'lucide-react';
import { PageNumber } from '../VillageUtils';

export const BlackSecretSection: React.FC<{ secret: string, page: number }> = ({ secret, page }) => (
  <section className="parchment relative w-full max-w-5xl bg-stone-950 flex flex-col items-center justify-center text-center">
    <PageNumber n={page} />
    <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
       <div className="grid grid-cols-10 gap-6 p-8">{Array(80).fill(0).map((_, i) => <Skull key={i} size={40} className="text-red-900" />)}</div>
    </div>
    <div className="relative z-10 p-16">
       <h3 className="text-7xl font-bold medieval-font mb-12 text-red-700 flex items-center justify-center gap-6 uppercase"><Skull size={80} /> The Black Secret</h3>
       <p className="text-6xl italic font-serif leading-tight text-red-300 font-bold drop-shadow-[0_4px_10px_rgba(0,0,0,1)]">"{secret}"</p>
    </div>
  </section>
);
