
import React from 'react';
import { BookOpen } from 'lucide-react';
import { PageNumber } from '../VillageUtils';

interface Props {
  notes: string;
  onChange: (val: string) => void;
  page: number;
}

export const ChronicleSection: React.FC<Props> = ({ notes, onChange, page }) => (
  <section className="parchment relative w-full max-w-5xl flex flex-col">
    <PageNumber n={page} />
    <h3 className="text-6xl font-bold medieval-font border-b-4 border-stone-800 mb-10 pb-6 text-black uppercase flex items-center gap-6"><BookOpen size={64} /> Campaign Chronicle</h3>
    <div className="p-10 bg-white/40 border-8 border-double border-stone-400 rounded shadow-inner min-h-[700px] flex-1">
      <textarea 
        className="w-full h-full bg-transparent border-none italic text-4xl font-serif text-black font-black leading-loose outline-none resize-none no-print" 
        placeholder="The ink of history flows here..." 
        value={notes} 
        onChange={e => onChange(e.target.value)} 
      />
      <p className="hidden print:block text-3xl font-serif italic text-black font-black leading-relaxed whitespace-pre-wrap">{notes}</p>
    </div>
  </section>
);
