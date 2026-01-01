
import React from 'react';
import { Frown, Crown, Users, Heart, Swords, Minus, Sprout, Sun, Leaf, Snowflake, Star } from 'lucide-react';
import { DetailedNPC } from './types';

export const getStandingCategory = (npc: DetailedNPC) => {
  const avg = npc.relationships.reduce((a, r) => a + r.score, 0) / (npc.relationships.length || 1);
  if (avg <= 4.0) return { label: 'Pariah', color: 'text-red-950', icon: <Frown size={20} className="text-red-900" /> };
  if (avg >= 7.0) return { label: 'Pillar', color: 'text-amber-950 font-black', icon: <Crown size={20} className="text-amber-700" /> };
  return { label: 'Resident', color: 'text-stone-950', icon: <Users size={20} className="text-stone-800" /> };
};

export const getRelationshipStyles = (score: number) => {
  if (score >= 8) return { bg: 'bg-emerald-100', border: 'border-emerald-700', text: 'text-emerald-950', icon: <Heart size={10} className="text-emerald-800" /> };
  if (score <= 4) return { bg: 'bg-rose-100', border: 'border-rose-700', text: 'text-rose-950', icon: <Swords size={10} className="text-rose-800" /> };
  return { bg: 'bg-stone-100', border: 'border-stone-500', text: 'text-stone-950', icon: <Minus size={10} className="text-stone-700" /> };
};

export const getSeasonIcon = (season: string) => {
  switch(season) {
    case 'Spring': return <Sprout className="text-emerald-700" size={32} />;
    case 'Summer': return <Sun className="text-amber-700" size={32} />;
    case 'Fall': return <Leaf className="text-orange-800" size={32} />;
    case 'Winter': return <Snowflake className="text-blue-700" size={32} />;
    default: return <Star className="text-purple-700" size={32} />;
  }
};

export const PageNumber = ({ n }: { n: number }) => (
  <div className="absolute top-4 right-8 text-xs font-black uppercase tracking-[0.2em] opacity-30 medieval-font pointer-events-none no-print">
    Page {n}
  </div>
);
