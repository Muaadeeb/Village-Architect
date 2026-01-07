
import React from 'react';

export const MoraleSection: React.FC<{ morale: string }> = ({ morale }) => (
  <div className="dossier-card p-10 flex flex-col items-center justify-center break-inside-avoid">
    <h4 className="text-xs font-black uppercase text-stone-500 mb-2 tracking-[0.4em]">Town Morale</h4>
    <div className="text-7xl font-black medieval-font uppercase text-black tracking-tight">{morale}</div>
  </div>
);
