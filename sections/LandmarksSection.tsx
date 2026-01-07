
import React from 'react';
import { Landmark as LandmarkIcon, ShieldAlert } from 'lucide-react';
import { Landmark } from '../types';

export const LandmarksSection: React.FC<{ landmarks: Landmark[] }> = ({ landmarks }) => (
  <div className="space-y-8">
    <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-6 pb-2 uppercase text-black flex items-center gap-4">
        <LandmarkIcon size={40} /> Sacred Landmarks
    </h3>
    <div className="grid grid-cols-2 gap-10">
      {landmarks.map((lm, i) => (
        <div key={i} className="dossier-card p-8 flex flex-col break-inside-avoid">
          <h4 className="text-3xl font-bold medieval-font text-black mb-4 border-b border-stone-200 pb-2">{lm.name}</h4>
          <p className="text-lg italic font-bold mb-8 text-stone-900 leading-relaxed flex-1">"{lm.description}"</p>
          <div className="p-6 bg-stone-50 text-stone-950 border-2 border-stone-900 rounded-sm">
            <span className="text-[11px] font-black uppercase flex items-center gap-3 mb-2 tracking-widest text-stone-500">
                <ShieldAlert size={16} className="text-stone-800"/> Encounter Hook
            </span>
            <p className="text-base font-bold leading-tight">{lm.encounterHook}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
