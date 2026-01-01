
import React from 'react';
import { Wind } from 'lucide-react';

export const AtmosphereSection: React.FC<{ atmosphere: string, geography: string }> = ({ atmosphere, geography }) => (
  <div className="p-6 bg-stone-900 text-amber-500 border-4 border-stone-800 rounded shadow-xl break-inside-avoid">
    <h4 className="text-xs font-black uppercase text-amber-700 mb-3 tracking-widest flex items-center gap-2"><Wind size={14}/> Atmospheric Status</h4>
    <p className="text-sm italic font-bold mb-4">"{atmosphere}"</p>
    <div className="text-[10px] uppercase text-stone-500 border-t border-stone-700 pt-2">Geography: {geography}</div>
  </div>
);
