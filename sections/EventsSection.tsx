
import React from 'react';
import { Newspaper } from 'lucide-react';

export const EventsSection: React.FC<{ events: string[] }> = ({ events }) => (
  <div className="dossier-card p-8 break-inside-avoid">
    <h4 className="text-xs font-black uppercase text-stone-500 mb-6 tracking-[0.3em] flex items-center gap-3">
        <Newspaper size={18} className="text-stone-800"/> Current Events
    </h4>
    <ul className="space-y-4">
      {events.map((ev, i) => (
        <li key={i} className="text-lg font-bold italic border-l-4 border-stone-800 pl-4 py-1 leading-tight text-black">"{ev}"</li>
      ))}
    </ul>
  </div>
);
