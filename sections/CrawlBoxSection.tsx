
import React from 'react';
import { Boxes, Skull, Ghost, CircleDot } from 'lucide-react';
import { PointOfInterest } from '../types';
import { PageNumber } from '../VillageUtils';

interface Props {
  poi?: PointOfInterest;
  page: number;
  onGenerate: () => void;
  loading: boolean;
}

export const CrawlBoxSection: React.FC<Props> = ({ poi, page, onGenerate, loading }) => (
  <section className="parchment relative w-full max-w-5xl">
    <PageNumber n={page} />
    <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-3 uppercase text-black flex items-center gap-5"><Boxes size={48} /> Nearby Crawl in a Box</h3>
    {!poi ? (
      <div className="h-64 flex items-center justify-center">
        <button onClick={onGenerate} className="bg-stone-800 text-amber-500 px-10 py-5 rounded-lg font-bold medieval-font text-3xl no-print">Manifest Dungeon</button>
      </div>
    ) : (
      <div className="space-y-8">
        <div className="p-8 bg-stone-900 text-amber-500 rounded-lg shadow-2xl border-4 border-stone-950">
          <div className="flex justify-between items-start mb-4">
            <div><h4 className="text-5xl font-bold medieval-font uppercase tracking-tight">{poi.title}</h4><p className="text-xs font-black uppercase text-amber-800 tracking-widest">{poi.type} • {poi.location}</p></div>
            <div className="bg-amber-500 text-stone-950 px-4 py-2 font-black uppercase text-sm rounded shadow-lg">Lvl 1-2</div>
          </div>
          <p className="text-xl italic font-bold leading-relaxed border-l-4 border-amber-500 pl-6">"{poi.background}"</p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {poi.rooms.map((room, i) => (
            <div key={i} className="p-6 bg-white/60 border-2 border-stone-800 rounded shadow-lg flex gap-8 items-start break-inside-avoid">
              <div className="text-6xl font-black medieval-font text-stone-300 shrink-0">{room.number}</div>
              <div className="flex-1">
                <h5 className="text-2xl font-bold medieval-font text-black mb-2 border-b-2 border-stone-800">{room.name}</h5>
                <p className="text-lg italic font-bold text-black mb-4">"{room.description}"</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-100 border-2 border-red-800 rounded shadow">
                    <span className="block text-[10px] font-black uppercase text-red-900 mb-1 flex items-center gap-2"><Skull size={14}/> Threat</span>
                    <p className="text-xs font-black italic">{room.threats}</p>
                  </div>
                  <div className="p-4 bg-emerald-100 border-2 border-emerald-800 rounded shadow">
                    <span className="block text-[10px] font-black uppercase text-emerald-900 mb-1 flex items-center gap-2"><CircleDot size={14}/> Treasure</span>
                    <p className="text-xs font-black italic">{room.treasure}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </section>
);
