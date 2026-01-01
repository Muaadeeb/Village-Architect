
import React from 'react';

export const MoraleSection: React.FC<{ morale: string }> = ({ morale }) => (
  <div className="p-8 bg-stone-100 border-4 border-stone-800 rounded-lg flex flex-col items-center shadow-xl break-inside-avoid">
    <h4 className="text-xs font-black uppercase text-stone-500 mb-1 tracking-widest">Town Morale</h4>
    <div className="text-6xl font-black medieval-font uppercase text-black">{morale}</div>
  </div>
);
