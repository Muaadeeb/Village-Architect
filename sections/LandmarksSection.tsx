
import React from 'react';
import { Landmark as LandmarkIcon, ShieldAlert } from 'lucide-react';
import { Landmark } from '../types';

export const LandmarksSection: React.FC<{ landmarks: Landmark[] }> = ({ landmarks }) => (
  <div className="space-y-6">
    <h3 className="text-3xl font-bold medieval-font border-b-4 border-stone-800 mb-4 pb-1 uppercase text-black flex items-center gap-3"><LandmarkIcon size={32} /> Sacred Landmarks</h3>
    <div className="grid grid-cols-2 gap-6">
      {landmarks.map((lm, i) => (
        <div key={i} className="p-6 bg-white/50 border-2 border-stone-800 rounded shadow-lg break-inside-avoid">
          <h4 className="text-xl font-bold medieval-font text-black mb-2">{lm.name}</h4>
          <p className="text-sm italic font-bold mb-4">"{lm.description}"</p>
          <div className="p-3 bg-red-50 text-red-900 border-l-4 border-red-800 rounded">
            <span className="text-[10px] font-black uppercase flex items-center gap-2 mb-1"><ShieldAlert size={12}/> Encounter Hook</span>
            <p className="text-xs font-bold">{lm.encounterHook}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
