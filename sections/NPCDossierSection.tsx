
import React from 'react';
import { UserCircle, Scale, BookOpen, Goal, Fingerprint, Shield, Heart, Swords, Skull } from 'lucide-react';
import { DetailedNPC } from '../types';
import { PageNumber, getStandingCategory, getRelationshipStyles } from '../VillageUtils';

interface Props {
  npc: DetailedNPC;
  page: number;
}

export const NPCDossierSection: React.FC<Props> = ({ npc, page }) => {
  return (
    <section className="parchment relative w-full max-w-5xl npc-section">
      <PageNumber n={page} />
      <div className="flex flex-col gap-4">
        <div className="p-6 border-4 border-stone-800 bg-white/60 rounded-sm shadow-2xl flex flex-col md:flex-row gap-6 items-start break-inside-avoid">
          {/* IDENTITY */}
          <div className="w-full md:w-1/4 flex flex-col items-center shrink-0">
            <div className="npc-portrait-wrap relative w-full aspect-square bg-stone-900/10 mb-4 border-6 border-stone-800 overflow-hidden shadow-2xl">
              {npc.portraitUrl ? <img src={npc.portraitUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><UserCircle size={80} /></div>}
            </div>
            <h4 className="text-4xl font-bold medieval-font text-black uppercase leading-tight mb-1 text-center">{npc.name}</h4>
            <p className="text-xs font-black text-stone-600 uppercase mb-4 tracking-[0.2em]">{npc.sex} • {npc.race} • {npc.role}</p>
            <div className="flex flex-col gap-2 w-full">
              <div className={`text-[10px] font-black px-3 py-2 border-2 border-stone-800 rounded bg-white w-full flex items-center justify-center gap-2 shadow-md ${getStandingCategory(npc).color}`}>{getStandingCategory(npc).icon} {getStandingCategory(npc).label}</div>
              <div className={`text-[10px] font-black px-3 py-2 border-2 rounded w-full flex items-center justify-center gap-2 uppercase tracking-[0.2em] shadow-md ${npc.alignment === 'Lawful' ? 'bg-blue-100 border-blue-800 text-blue-900' : npc.alignment === 'Chaotic' ? 'bg-red-100 border-red-800 text-red-900' : 'bg-stone-100 border-stone-800 text-stone-900'}`}><Scale size={14}/> {npc.alignment}</div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <h5 className="text-[9px] font-black uppercase text-stone-500 mb-1 tracking-[0.4em] flex items-center gap-2"><BookOpen size={14}/> Psychological Profile</h5>
              <p className="italic text-2xl text-black font-bold leading-relaxed border-l-8 border-stone-800 pl-6 bg-white/40 p-4 rounded shadow-inner">"{npc.personality}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-stone-800 text-amber-500 rounded-lg border-2 border-stone-900 shadow-xl">
                <span className="block opacity-60 mb-1 uppercase text-[8px] tracking-[0.3em]">Motivation</span>
                <p className="text-base font-bold flex items-center gap-2"><Goal size={16}/> {npc.motivation}</p>
              </div>
              <div className="p-4 bg-stone-800 text-amber-500 rounded-lg border-2 border-stone-900 shadow-xl">
                <span className="block opacity-60 mb-1 uppercase text-[8px] tracking-[0.3em]">Characteristic</span>
                <p className="text-base font-bold flex items-center gap-2"><Fingerprint size={16}/> {npc.trait}</p>
              </div>
              
              <div className="p-4 bg-white border-2 border-stone-800 rounded shadow-2xl flex justify-around items-center">
                <div className="flex flex-col items-center">
                  <Shield size={24} className="text-stone-800 mb-1" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500">AC</span>
                    <span className="text-3xl font-black">{npc.stats.ac}</span>
                  </div>
                </div>
                <div className="w-0.5 h-10 bg-stone-200 rounded-full"></div>
                <div className="flex flex-col items-center">
                  <Heart size={24} className="text-red-700 mb-1" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500">HP</span>
                    <span className="text-3xl font-black">{npc.stats.hp}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-100 text-red-950 rounded border-2 border-red-800 shadow-2xl border-dashed">
                <span className="block opacity-70 mb-1 uppercase text-[8px] tracking-[0.3em] text-red-800">Shadow Secret</span>
                <p className="text-sm font-bold italic line-clamp-2"><Skull size={14} className="inline mr-2 text-red-900"/> {npc.secret}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL MATRIX */}
        <div className="w-full">
          <h5 className="text-xs font-black uppercase text-stone-500 mb-3 tracking-[0.4em] flex items-center gap-3 border-b-2 border-stone-300 pb-1"><Swords size={18}/> Social Matrix Connections</h5>
          <div className="grid grid-cols-5 gap-2">
            {npc.relationships.map((rel, r) => (
              <div key={r} className={`p-2 border rounded shadow-sm flex flex-col h-[85px] break-inside-avoid bg-white/80 ${getRelationshipStyles(rel.score).bg} ${getRelationshipStyles(rel.score).border}`}>
                <div className="flex justify-between items-start text-[9px] font-black text-black uppercase mb-0.5">
                  <span className="truncate w-[70%] flex items-center gap-1 font-bold leading-none">{getRelationshipStyles(rel.score).icon} {rel.targetName}</span>
                  <span className="bg-white px-1 border rounded font-black text-xs leading-none">{rel.score}</span>
                </div>
                <p className="text-[9px] italic font-bold text-stone-900 leading-tight line-clamp-3 mt-auto">"{rel.reason}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
