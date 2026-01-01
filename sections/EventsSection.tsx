
import React from 'react';
import { Newspaper } from 'lucide-react';

export const EventsSection: React.FC<{ events: string[] }> = ({ events }) => (
  <div className="p-6 bg-white border-4 border-stone-800 rounded shadow-inner break-inside-avoid">
    <h4 className="text-xs font-black uppercase text-stone-500 mb-4 tracking-widest flex items-center gap-2"><Newspaper size={14}/> Current Events</h4>
    <ul className="space-y-3">
      {events.map((ev, i) => (
        <li key={i} className="text-sm font-bold italic border-l-4 border-stone-400 pl-3">"{ev}"</li>
      ))}
    </ul>
  </div>
);
