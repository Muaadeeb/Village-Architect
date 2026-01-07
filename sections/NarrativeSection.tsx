
import React from 'react';

export const NarrativeSection: React.FC<{ description: string }> = ({ description }) => (
  <div className="space-y-4 break-inside-avoid">
    <h3 className="text-3xl font-bold medieval-font border-b-4 border-stone-800 pb-2 uppercase text-black">Narrative Manifest</h3>
    <div className="dossier-card p-10 relative">
      <div className="absolute top-0 left-0 w-2 h-full bg-stone-800"></div>
      <p className="text-2xl italic font-serif leading-relaxed text-black font-bold">
        "{description}"
      </p>
    </div>
  </div>
);
