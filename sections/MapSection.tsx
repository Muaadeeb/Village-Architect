
import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { PageNumber } from '../VillageUtils';

interface Props {
  mapUrl?: string;
  villageName: string;
  page: number;
  onGenerate: () => void;
}

export const MapSection: React.FC<Props> = ({ mapUrl, villageName, page, onGenerate }) => (
  <section className="parchment relative w-full max-w-5xl flex flex-col justify-center">
    <PageNumber n={page} />
    <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-6 pb-3 uppercase text-black"><MapIcon size={40} className="inline mr-4" /> Local Chart (Map)</h3>
    <p className="text-lg italic font-black text-stone-600 mb-6">Hand-drawn street map of {villageName} detailing shops and points of survival.</p>
    <div className="w-full aspect-[16/9] bg-stone-900/10 border-8 border-stone-800 rounded shadow-2xl overflow-hidden relative">
      {mapUrl ? (
        <img src={mapUrl} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <button onClick={onGenerate} className="bg-stone-800 text-amber-500 px-8 py-4 rounded-lg font-bold medieval-font text-2xl no-print">Manifest Map</button>
        </div>
      )}
    </div>
  </section>
);
