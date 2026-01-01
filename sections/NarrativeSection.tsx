
import React from 'react';
import { PageNumber } from '../VillageUtils';

export const NarrativeSection: React.FC<{ description: string }> = ({ description }) => (
  <div className="space-y-4 break-inside-avoid">
    <h3 className="text-2xl font-bold medieval-font border-b-4 border-stone-800 pb-1 uppercase text-black">Narrative Manifest</h3>
    <p className="text-2xl italic font-serif leading-relaxed text-black bg-white/40 p-10 border-l-[10px] border-stone-800 shadow-inner font-bold">
      "{description}"
    </p>
  </div>
);
