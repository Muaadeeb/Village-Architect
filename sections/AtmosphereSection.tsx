
import React from 'react';
import { Wind } from 'lucide-react';

export const AtmosphereSection: React.FC<{ atmosphere: string, geography: string }> = ({ atmosphere, geography }) => (
  <div className="p-8 bg-stone-900 text-stone-300 border-4 border-stone-950 rounded shadow-xl break-inside-avoid">
    <h4 className="text-xs font-black uppercase text-stone-500 mb-4 tracking-[0.3em] flex items-center gap-3">
        <Wind size={18} className="text-stone-400"/> Atmospheric Status
    </h4>
    <p className="text-xl italic font-bold mb-6 text-white leading-relaxed">"{atmosphere}"</p>
    <div className="text-[11px] uppercase text-stone-600 font-black border-t border-stone-800 pt-4 leading-relaxed">
        <span className="text-stone-500">GEOGRAPHY:</span> {geography}
    </div>
  </div>
);
