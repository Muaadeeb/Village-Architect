
import React from 'react';
import * as VillageConstants from '../VillageConstants';

export const EncountersDaySection: React.FC = () => (
  <div className="break-inside-avoid">
    <h4 className="text-3xl font-bold medieval-font text-black uppercase mb-4 border-l-[10px] border-stone-800 pl-4">Day: Inside Walls</h4>
    <table className="w-full text-left font-serif border-2 border-stone-800 shadow-sm">
      <thead className="bg-stone-800 text-amber-500 font-black uppercase text-xs">
        <tr><th className="py-2 px-4 border-r-2 border-stone-700 w-16">d20</th><th className="py-2 px-4">Encounter Detail</th></tr>
      </thead>
      <tbody className="bg-white/80 text-sm">
        {VillageConstants.ENCOUNTERS_DAY_INSIDE.map((e, ei) => (
          <tr key={ei} className="border-b border-stone-200">
            <td className="py-1.5 px-4 text-center border-r border-stone-300 font-black">{(ei+1).toString().padStart(2, '0')}</td>
            <td className="py-1.5 px-4 font-bold italic leading-tight">"{e.text}"</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
