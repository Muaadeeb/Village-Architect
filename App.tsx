
import React, { useState, useRef, useEffect } from 'react';
import { generateVillageDetails } from './services/geminiService';
import { VillageData, DetailedNPC } from './types';
import { 
  Scroll, 
  RefreshCw, 
  Map as MapIcon, 
  Users, 
  Flame, 
  Waves,
  Store,
  Printer,
  ChevronRight,
  Skull,
  ArrowRight,
  UserCircle,
  EyeOff,
  MessageSquareQuote,
  BookOpen,
  Pencil,
  MapPin,
  Heart,
  Swords,
  Minus,
  Package,
  ShoppingBag
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [village, setVillage] = useState<VillageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editableNotes, setEditableNotes] = useState("");
  const parchmentRef = useRef<HTMLDivElement>(null);

  const calculateDemographics = (total: number) => {
    const humans = Math.floor(total * 0.85);
    const halflings = Math.floor(total * 0.08);
    const dwarves = Math.floor(total * 0.03);
    const elves = Math.floor(total * 0.02);
    const remaining = total - (humans + halflings + dwarves + elves);
    
    const otherRaces = ['Half-Orc', 'Goblin', 'Tiefling', 'Kobold'];
    const others = [];
    if (remaining > 0) {
      const race = otherRaces[Math.floor(Math.random() * otherRaces.length)];
      others.push({ race, count: remaining });
    }

    return { humans, halflings, dwarves, elves, others };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const pop = Math.floor(Math.random() * (300 - 200) + 200);
      const demo = calculateDemographics(pop);
      const names = ["Cinderglade", "Blackwater", "Mire's End", "Hollowshade", "Dreadmoor", "Ravenstone", "Grimford", "Thistlevale", "Ironcreek", "Sorrow's Reach", "Bleak-Water"];
      const name = names[Math.floor(Math.random() * names.length)];
      
      const data = await generateVillageDetails(name, pop, demo);
      setVillage(data);
      setEditableNotes(data.gmNotes || "");
    } catch (err) {
      setError("The shadows have obscured the path. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const chartData = village ? [
    { name: 'Humans', value: village.demographics.humans, color: '#4b5563' },
    { name: 'Halflings', value: village.demographics.halflings, color: '#059669' },
    { name: 'Dwarves', value: village.demographics.dwarves, color: '#b45309' },
    { name: 'Elves', value: village.demographics.elves, color: '#7c3aed' },
    ...village.demographics.others.map(o => ({ name: o.race, value: o.count, color: '#dc2626' }))
  ] : [];

  const getRelationshipStyles = (score: number) => {
    if (score >= 8) return {
      line: 'bg-emerald-600',
      text: 'text-emerald-900',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <Heart size={12} className="text-emerald-600" />,
      glow: 'shadow-[0_0_8px_rgba(5,150,105,0.2)]'
    };
    if (score <= 3) return {
      line: 'bg-rose-600',
      text: 'text-rose-900',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      icon: <Swords size={12} className="text-rose-600" />,
      glow: 'shadow-[0_0_8px_rgba(225,29,72,0.2)]'
    };
    return {
      line: 'bg-stone-400',
      text: 'text-stone-800',
      bg: 'bg-stone-50',
      border: 'border-stone-200',
      icon: <Minus size={12} className="text-stone-400" />,
      glow: ''
    };
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header UI */}
      <div className="max-w-4xl w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12 no-print">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold medieval-font text-amber-500 mb-2 flex items-center justify-center md:justify-start gap-3">
            <Flame className="w-10 h-10 animate-pulse text-amber-600" />
            Shadowdark Village Architect
          </h1>
          <p className="text-slate-400 italic">"Torches are dying... the village awaits."</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-lg medieval-font"
        >
          {loading ? <RefreshCw className="animate-spin" /> : <Scroll />}
          {loading ? "Invoking Shadows..." : "Manifest Village"}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-8 max-w-2xl w-full text-center no-print">
          {error}
        </div>
      )}

      {village && (
        <div className="w-full max-w-4xl flex flex-col gap-6 relative">
          
          <div className="absolute -top-12 right-0 flex gap-4 no-print">
            <button 
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-amber-500 border border-amber-500/30"
              title="Print to PDF"
            >
              <Printer className="w-6 h-6" />
            </button>
          </div>

          <div 
            ref={parchmentRef}
            className="parchment p-8 md:p-12 rounded-sm shadow-2xl border-2 border-stone-400/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Skull className="w-64 h-64" />
            </div>

            <div className="border-b-2 border-stone-800 pb-6 mb-8 text-center">
              <h2 className="text-6xl font-bold medieval-font mb-2 uppercase tracking-tighter">{village.name}</h2>
              <p className="text-xl italic font-serif opacity-80 uppercase tracking-widest">Village Compendium & Relationship Matrix</p>
            </div>

            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <section>
                <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b border-stone-800 mb-4 pb-1">
                  <Users className="w-6 h-6 text-stone-700" /> Population
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 text-lg">
                    <p><strong>Total:</strong> {village.population} souls</p>
                    <p className="text-sm opacity-70 italic">A grim balance of life in the Shadowdark.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b border-stone-800 mb-4 pb-1">
                  <Waves className="w-6 h-6 text-stone-700" /> Geography
                </h3>
                <p className="leading-relaxed italic">{village.geography}</p>
                <p className="mt-2 font-bold text-amber-900">Current Mood: {village.atmosphere}</p>
              </section>
            </div>

            {/* Dark Secret */}
            <section className="mb-12 bg-black/5 p-6 border-l-4 border-red-900 rounded-r shadow-sm">
              <h3 className="text-2xl font-bold medieval-font mb-3 text-red-900 flex items-center gap-2">
                <Skull className="w-7 h-7" /> The Town's Dark Secret
              </h3>
              <p className="text-xl italic font-serif leading-relaxed text-stone-800">{village.darkSecret}</p>
            </section>

            {/* Landmarks */}
            <section className="mb-12">
              <h3 className="text-2xl font-bold medieval-font border-b border-stone-800 mb-4 pb-1 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-stone-700" /> Notable Landmarks
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {village.landmarks.map((landmark, idx) => (
                  <li key={idx} className="flex items-start gap-2 italic text-stone-800">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stone-500 shrink-0" />
                    {landmark}
                  </li>
                ))}
              </ul>
            </section>

            {/* Establishments */}
            <section className="mb-16">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 flex items-center gap-2 uppercase tracking-wider">
                <Store className="w-8 h-8 text-stone-800" /> Establishments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                {village.businesses.map((biz, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-4 bg-stone-300/10 rounded-sm border border-stone-300/30">
                    <div className="border-b border-stone-400 flex justify-between items-end mb-1">
                      <h4 className="text-2xl font-bold medieval-font">{biz.name}</h4>
                      <span className="text-xs font-bold uppercase opacity-60">{biz.type}</span>
                    </div>
                    <p className="italic text-sm opacity-90 leading-tight mb-3">{biz.description}</p>
                    
                    {/* Wares & Services */}
                    <div className="mb-3">
                      <div className="text-[10px] font-black uppercase text-stone-500 mb-1 flex items-center gap-1.5">
                        <ShoppingBag size={10} className="text-stone-600" /> Wares & Services
                      </div>
                      <ul className="text-xs space-y-0.5">
                        {biz.notableItems.map((item, iidx) => (
                          <li key={iidx} className="flex items-center gap-2 text-stone-800">
                             <Package size={8} className="opacity-40" />
                             {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Business Rumor */}
                    <div className="text-xs bg-amber-900/5 p-2 rounded border-l-2 border-amber-800/40 mb-2 italic">
                       <span className="font-bold uppercase tracking-tighter opacity-60 flex items-center gap-1 mb-1">
                         <MessageSquareQuote size={12} className="text-amber-900" /> Local Rumor
                       </span>
                       "{biz.rumor}"
                    </div>

                    <div className="text-sm mt-auto">
                      <span className="font-bold">Proprietor:</span> {biz.owner.name} ({biz.owner.race})
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Residents & Social Connections */}
            <section className="page-break-before mb-16">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 flex items-center gap-2 uppercase tracking-wider">
                <UserCircle className="w-8 h-8 text-stone-800" /> Residents & Social Connections
              </h3>
              <div className="space-y-12">
                {village.residents.map((npc, idx) => (
                  <div key={idx} className="p-6 border border-stone-400 bg-stone-200/20 rounded-md shadow-inner relative overflow-hidden transition-transform hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <UserCircle className="w-24 h-24" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-3xl font-bold medieval-font text-stone-900">{npc.name}</h4>
                        <p className="text-amber-900 font-bold uppercase text-xs tracking-widest">{npc.race} — {npc.role}</p>
                      </div>
                    </div>
                    
                    <p className="mb-6 text-lg italic leading-relaxed border-l-4 border-stone-400 pl-4 bg-white/10 py-2">"{npc.personality}"</p>

                    <div className="mb-6 bg-red-50/50 p-4 border border-red-200/30 rounded no-print">
                      <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase mb-2">
                        <EyeOff size={14} /> Secret (DM ONLY)
                      </div>
                      <p className="text-sm font-serif italic text-red-900/80">{npc.secret}</p>
                    </div>

                    {/* Relationship Matrix */}
                    {npc.relationships && npc.relationships.length > 0 && (
                      <div className="mt-8">
                        <h5 className="text-xs font-black uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                          <ArrowRight size={14} /> Social Web
                        </h5>
                        <div className="flex flex-col gap-4">
                          {npc.relationships.map((rel, ridx) => {
                            const styles = getRelationshipStyles(rel.score);
                            return (
                              <div 
                                key={ridx} 
                                className={`p-4 rounded border ${styles.bg} ${styles.border} ${styles.glow} transition-all duration-300 hover:translate-x-1 group`}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-bold text-stone-900 text-sm">{npc.name}</span>
                                  <div className="flex flex-col items-center px-4 flex-grow relative">
                                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${styles.border} ${styles.bg} ${styles.text} flex items-center gap-1.5 z-10 transition-transform group-hover:scale-110`}>
                                      {styles.icon}
                                      {rel.score} • {rel.feeling}
                                    </div>
                                    <div className={`h-[2px] w-full ${styles.line} relative mt-1 opacity-60 transition-opacity group-hover:opacity-100`}>
                                      <div className={`absolute right-0 -top-[5px] border-t-[6px] border-l-[6px] border-t-transparent border-l-current ${styles.text} h-3 w-3`}></div>
                                    </div>
                                  </div>
                                  <span className="font-bold text-stone-900 text-sm">{rel.targetName}</span>
                                </div>
                                <p className="text-sm text-stone-700 font-serif leading-relaxed pl-2 border-l-2 border-stone-300 ml-1 italic">
                                  {rel.reason}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* GM Notes Section */}
            <section className="page-break-before">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 flex items-center gap-2 uppercase tracking-wider">
                <BookOpen className="w-8 h-8 text-stone-800" /> GM's Campaign Records
              </h3>
              <div className="p-6 border border-stone-400 bg-stone-300/30 rounded-md shadow-inner">
                <div className="flex items-center gap-2 text-stone-600 font-bold text-xs uppercase mb-4 no-print">
                   <Pencil size={14} /> Edit Campaign Hooks & Observations
                </div>
                <textarea
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                  className="w-full min-h-[300px] bg-transparent border-none focus:ring-0 text-lg font-serif italic leading-relaxed text-stone-900 resize-none outline-none"
                  placeholder="Record your campaign progress, player interactions, and plot changes here..."
                />
              </div>
              <p className="text-xs text-stone-500 mt-4 italic no-print">* Changes made here are local and can be saved by printing to PDF.</p>
            </section>

            <div className="mt-16 pt-8 border-t border-stone-800 text-center opacity-40 text-sm italic">
              <p>Village data prepared for the Dungeon Master. Shadowdark Edition.</p>
            </div>
          </div>
        </div>
      )}

      {!village && !loading && (
        <div className="max-w-2xl text-center space-y-8 mt-20">
          <div className="p-12 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20 backdrop-blur transition-all hover:bg-slate-800/30">
            <Scroll className="w-24 h-24 text-amber-600/50 mx-auto mb-6" />
            <h3 className="text-3xl medieval-font mb-4 italic">The settlement is yet unformed...</h3>
            <p className="text-slate-400 text-lg mb-8">
              Click "Manifest Village" to generate a detailed Shadowdark settlement with a river, 
              12 businesses, 15 NPCs, a relationship matrix, and hidden secrets for every soul in town.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center flex-col gap-6">
          <Flame className="w-24 h-24 text-amber-500 animate-pulse" />
          <div className="text-center">
            <h2 className="text-3xl medieval-font text-amber-500 mb-2">Consulting the Starry Wisdom</h2>
            <p className="text-slate-400 italic">Forging lives, secrets, and grudges...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
