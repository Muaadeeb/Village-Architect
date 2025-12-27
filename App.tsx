
import React, { useState, useRef } from 'react';
import { generateVillageDetails, generateNPCPortrait, generateVillageMap } from './services/geminiService';
import { VillageData, DetailedNPC } from './types';
import { 
  Scroll, 
  RefreshCw, 
  Users, 
  Flame, 
  Waves,
  Store,
  Printer,
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
  ShoppingBag,
  Sparkles,
  Search,
  Fingerprint,
  Edit2,
  Check,
  X,
  CloudFog,
  Wind,
  Image as ImageIcon,
  Wand2,
  Map as MapIcon,
  Compass,
  FileText,
  Shield,
  Activity,
  Sword,
  Axe,
  Zap,
  Castle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const WEATHER_TABLE = [
  "Eerie, bone-white fog.",
  "Freezing, relentless rain.",
  "Hot, stagnant air thick with flies.",
  "A howling wind that sounds like screams.",
  "A fine, grey ash falling from the sky.",
  "Oppressive, heavy overcast.",
  "A sickly yellow sun through smog.",
  "Thunder without rain, shaking the earth.",
  "A damp, clingy mist that smells of rot.",
  "Unnatural stillness; no birds sing.",
  "A bitter, dry cold that cracks lips.",
  "Blood-red sunset through storm clouds."
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [village, setVillage] = useState<VillageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editableNotes, setEditableNotes] = useState("");
  const [npcFilter, setNpcFilter] = useState("");
  const [editingNpcIdx, setEditingNpcIdx] = useState<number | null>(null);
  const [portraitLoading, setPortraitLoading] = useState<Record<number, boolean>>({});
  const [tempNpcData, setTempNpcData] = useState<{ trait: string; personality: string; secret: string }>({
    trait: "",
    personality: "",
    secret: ""
  });
  
  const parchmentRef = useRef<HTMLDivElement>(null);

  const calculateDemographics = (total: number) => {
    const humans = Math.floor(total * 0.85);
    const halflings = Math.floor(total * 0.08);
    const dwarves = Math.floor(total * 0.03);
    const elves = Math.floor(total * 0.02);
    const remaining = total - (humans + halflings + dwarves + elves);
    const otherRaces = ['Half-Orc', 'Goblin', 'Tiefling', 'Kobold'];
    const others = remaining > 0 ? [{ race: otherRaces[Math.floor(Math.random() * otherRaces.length)], count: remaining }] : [];
    return { humans, halflings, dwarves, elves, others };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setEditingNpcIdx(null);
    setPortraitLoading({});
    try {
      const pop = Math.floor(Math.random() * (300 - 200) + 200);
      const demo = calculateDemographics(pop);
      const names = ["Cinderglade", "Blackwater", "Mire's End", "Hollowshade", "Dreadmoor", "Ravenstone", "Grimford", "Thistlevale", "Ironcreek", "Sorrow's Reach", "Bleak-Water"];
      const name = names[Math.floor(Math.random() * names.length)];
      const data = await generateVillageDetails(name, pop, demo);
      setVillage(data);
      setEditableNotes(data.gmNotes || "");
    } catch (err) {
      setError("The shadows have obscured the path. The matrix was too large for the light to pierce.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMap = async () => {
    if (!village) return;
    setMapLoading(true);
    try {
      const url = await generateVillageMap(village);
      setVillage({ ...village, mapUrl: url });
    } catch (err) {
      console.error("Map generation failed:", err);
    } finally {
      setMapLoading(false);
    }
  };

  const rollWeather = () => {
    if (!village) return;
    const newWeather = WEATHER_TABLE[Math.floor(Math.random() * WEATHER_TABLE.length)];
    setVillage({ ...village, weather: newWeather });
  };

  const startEditingNpc = (idx: number, npc: DetailedNPC) => {
    setEditingNpcIdx(idx);
    setTempNpcData({
      trait: npc.trait || "",
      personality: npc.personality || "",
      secret: npc.secret || ""
    });
  };

  const handleGeneratePortrait = async (idx: number, npc: DetailedNPC) => {
    if (!village) return;
    setPortraitLoading(prev => ({ ...prev, [idx]: true }));
    try {
      const url = await generateNPCPortrait(npc);
      const updatedResidents = [...village.residents];
      updatedResidents[idx] = { ...updatedResidents[idx], portraitUrl: url };
      setVillage({ ...village, residents: updatedResidents });
    } catch (err) {
      console.error("Portrait generation failed:", err);
    } finally {
      setPortraitLoading(prev => ({ ...prev, [idx]: false }));
    }
  };

  const saveNpcChanges = (idx: number) => {
    if (!village) return;
    const updatedResidents = [...village.residents];
    updatedResidents[idx] = {
      ...updatedResidents[idx],
      trait: tempNpcData.trait,
      personality: tempNpcData.personality,
      secret: tempNpcData.secret
    };
    setVillage({ ...village, residents: updatedResidents });
    setEditingNpcIdx(null);
  };

  const cancelEditingNpc = () => {
    setEditingNpcIdx(null);
  };

  const chartData = village ? [
    { name: `Humans (${village.demographics.humans})`, value: village.demographics.humans, color: '#4b5563' },
    { name: `Halflings (${village.demographics.halflings})`, value: village.demographics.halflings, color: '#059669' },
    { name: `Dwarves (${village.demographics.dwarves})`, value: village.demographics.dwarves, color: '#b45309' },
    { name: `Elves (${village.demographics.elves})`, value: village.demographics.elves, color: '#7c3aed' },
    ...village.demographics.others.map(o => ({ name: `${o.race} (${o.count})`, value: o.count, color: '#dc2626' }))
  ] : [];

  const getRelationshipStyles = (score: number) => {
    if (score >= 8) return { line: 'bg-emerald-600', text: 'text-emerald-900', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <Heart size={10} className="text-emerald-600" /> };
    if (score <= 3) return { line: 'bg-rose-600', text: 'text-rose-900', bg: 'bg-rose-50', border: 'border-rose-200', icon: <Swords size={10} className="text-rose-600" /> };
    return { line: 'bg-stone-400', text: 'text-stone-800', bg: 'bg-stone-50', border: 'border-stone-200', icon: <Minus size={10} className="text-stone-400" /> };
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12 no-print">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold medieval-font text-amber-500 mb-2 flex items-center justify-center md:justify-start gap-3">
            <Flame className="w-10 h-10 animate-pulse text-amber-600" />
            Shadowdark Village Architect
          </h1>
          <p className="text-slate-400 italic">"Full Dossier: Lives, Deaths, and Grudges in the Gloom."</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-lg medieval-font"
        >
          {loading ? <RefreshCw className="animate-spin" /> : <Scroll />}
          {loading ? "Manifesting Matrix..." : "Manifest Village"}
        </button>
      </div>

      {village && (
        <div className="w-full max-w-6xl flex flex-col gap-6 relative">
          <div className="absolute -top-12 right-0 flex gap-4 no-print">
            <button onClick={() => window.print()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-amber-500 border border-amber-500/30">
              <Printer className="w-6 h-6" />
            </button>
          </div>

          <div ref={parchmentRef} className="parchment p-8 md:p-12 rounded-sm shadow-2xl border-2 border-stone-400/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Skull className="w-96 h-96" />
            </div>

            <div className="border-b-2 border-stone-800 pb-6 mb-8 text-center">
              <h2 className="text-7xl font-bold medieval-font mb-2 uppercase tracking-tighter">{village.name}</h2>
              <p className="text-xl italic font-serif opacity-80 uppercase tracking-widest">Master Dossier & Complete Social Matrix</p>
            </div>

            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <section>
                <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b border-stone-800 mb-6 pb-1">
                  <Users className="w-6 h-6 text-stone-700" /> Population Distribution
                </h3>
                <div className="h-64 w-full flex flex-col items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle" 
                        formatter={(value) => <span className="font-bold text-stone-800">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="mt-4 text-center font-bold text-stone-700">Total Souls: {village.population}</p>
                </div>
              </section>

              <section>
                <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b border-stone-800 mb-4 pb-1">
                  <Waves className="w-6 h-6 text-stone-700" /> Geography & Atmosphere
                </h3>
                <p className="leading-relaxed italic text-lg mb-4">{village.geography}</p>
                <div className="bg-stone-800/10 p-4 border-l-4 border-stone-800 italic">
                  "The air here tastes of {village.atmosphere}..."
                </div>
              </section>
            </div>

            {/* Map Section */}
            <section className="mb-16">
              <div className="flex justify-between items-end border-b-2 border-stone-800 mb-6 pb-2">
                <h3 className="text-3xl font-bold medieval-font flex items-center gap-2 uppercase tracking-wider">
                  <MapIcon className="w-8 h-8 text-stone-800" /> Village Cartography
                </h3>
                {!village.mapUrl && !mapLoading && (
                  <button 
                    onClick={handleGenerateMap}
                    className="no-print flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-amber-500 px-4 py-2 rounded font-bold transition-all text-sm mb-1 shadow-md active:scale-95"
                  >
                    <Compass size={16} />
                    Cartograph Village
                  </button>
                )}
                {village.mapUrl && !mapLoading && (
                   <button 
                    onClick={handleGenerateMap}
                    className="no-print flex items-center gap-2 bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-2 rounded font-bold transition-all text-sm mb-1 border border-stone-400"
                  >
                    <RefreshCw size={14} />
                    Update Map
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-8">
                <div className="w-full relative aspect-[16/9] bg-stone-800/10 border-4 border-stone-800 rounded-sm overflow-hidden flex items-center justify-center shadow-2xl">
                   {village.mapUrl ? (
                    <img src={village.mapUrl} alt={`${village.name} Map`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-stone-400">
                       {mapLoading ? (
                        <div className="flex flex-col items-center gap-4">
                          <Compass className="w-16 h-16 animate-spin text-amber-600" />
                          <p className="medieval-font text-xl text-stone-600 animate-pulse">Drafting the layout of {village.name}...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <MapIcon className="w-32 h-32" />
                          <p className="text-lg italic">The chart is currently blank.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Map Legend */}
                <div className="bg-stone-800/5 p-8 border-2 border-stone-800/20 rounded-sm">
                   <h4 className="text-xl font-bold medieval-font border-b border-stone-800 mb-6 flex items-center gap-2 uppercase">
                      <FileText size={20} /> Map Legend: Key Establishments
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-12">
                      {village.businesses.map((biz, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                           <div className="w-8 h-8 flex-shrink-0 bg-stone-800 text-amber-500 rounded-full flex items-center justify-center font-bold text-sm shadow-md border border-amber-500/30">
                              {idx + 1}
                           </div>
                           <div>
                              <p className="font-bold text-stone-900 leading-tight medieval-font">{biz.name}</p>
                              <p className="text-[10px] text-stone-600 italic">Owned by {biz.owner.name} ({biz.owner.race})</p>
                           </div>
                        </div>
                      ))}
                      {/* Add Landmarks to legend */}
                      {village.landmarks.map((landmark, idx) => (
                         <div key={`landmark-${idx}`} className="flex items-start gap-4">
                            <div className="w-8 h-8 flex-shrink-0 bg-amber-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border border-white/20">
                               L{idx + 1}
                            </div>
                            <div>
                               <p className="font-bold text-stone-900 leading-tight medieval-font">{landmark.name}</p>
                               <p className="text-[10px] text-stone-600 italic">Major Landmark</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              </div>
            </section>

            {/* Landmarks Section */}
            <section className="mb-16">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 flex items-center gap-2 uppercase tracking-wider text-stone-800">
                <Castle className="w-8 h-8" /> Landmarks of Note
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {village.landmarks.map((landmark, idx) => (
                  <div key={idx} className="p-6 bg-stone-800/5 border border-stone-300 rounded relative group">
                    <div className="absolute top-4 right-4 text-xs font-black bg-amber-900 text-white px-2 py-0.5 rounded shadow-sm border border-white/20">
                      L{idx+1}
                    </div>
                    <h4 className="text-2xl font-bold medieval-font text-stone-900 mb-2">{landmark.name}</h4>
                    <p className="text-sm italic leading-relaxed text-stone-700 mb-4">{landmark.description}</p>
                    <div className="bg-stone-100 p-4 border-l-4 border-amber-800 shadow-sm rounded-r">
                      <div className="text-[10px] font-black uppercase text-amber-900 flex items-center gap-1.5 mb-1.5">
                        <Zap size={12} /> Encounter Hook
                      </div>
                      <p className="text-sm font-serif italic text-stone-800 leading-tight">
                        {landmark.encounterHook}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Dark Secret */}
            <section className="mb-12 bg-black/5 p-8 border-l-4 border-red-900 rounded-r shadow-sm">
              <h3 className="text-2xl font-bold medieval-font mb-3 text-red-900 flex items-center gap-2">
                <Skull className="w-7 h-7" /> The Town's Dark Secret
              </h3>
              <p className="text-2xl italic font-serif leading-relaxed text-stone-800">{village.darkSecret}</p>
            </section>

            {/* Quests Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <section>
                <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-2 flex items-center gap-2 uppercase tracking-wider text-amber-900">
                  <Swords className="w-8 h-8" /> Main Storyline Quests
                </h3>
                <div className="space-y-6">
                  {village.mainQuests.map((q, i) => (
                    <div key={i} className="p-4 bg-stone-100 border-l-4 border-amber-800 shadow-sm">
                      <h4 className="font-bold text-xl medieval-font mb-1">{q.title}</h4>
                      <p className="text-sm italic mb-2 text-stone-700">{q.description}</p>
                      <p className="text-xs font-bold text-amber-900">Reward: {q.reward}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-2 flex items-center gap-2 uppercase tracking-wider text-stone-800">
                  <Sparkles className="w-8 h-8" /> Side Trek Encounters
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {village.sideTreks.map((q, i) => (
                    <div key={i} className="p-3 bg-white/40 border border-stone-300 rounded text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-stone-900 uppercase tracking-tighter">{q.title}</h4>
                        <span className="text-[10px] bg-stone-200 px-1 rounded">{q.reward}</span>
                      </div>
                      <p className="italic opacity-80 leading-tight">{q.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Businesses */}
            <section className="mb-16">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 flex items-center gap-2 uppercase tracking-wider">
                <Store className="w-8 h-8 text-stone-800" /> Establishments & Wares
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {village.businesses.map((biz, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-4 bg-stone-300/10 rounded-sm border border-stone-300/30">
                    <div className="flex justify-between items-start border-b border-stone-400 mb-1">
                      <h4 className="text-xl font-bold medieval-font">{biz.name}</h4>
                      <span className="text-[10px] bg-stone-800 text-amber-500 px-1.5 rounded-full font-bold">{idx + 1}</span>
                    </div>
                    <p className="italic text-xs opacity-90 mb-2 leading-relaxed">{biz.description}</p>
                    
                    <div className="bg-amber-900/5 p-2 rounded-sm border-l-2 border-amber-800/30 mb-2">
                      <div className="text-[9px] font-black uppercase text-amber-900 flex items-center gap-1 mb-1">
                        <Zap size={10} /> Encounter Hook
                      </div>
                      <p className="text-[10px] italic leading-tight text-stone-800">
                        {biz.encounterHook}
                      </p>
                    </div>

                    <div className="mb-2">
                      <div className="text-[10px] font-black uppercase text-stone-500 mb-1 flex items-center gap-1">
                        <ShoppingBag size={10} /> Notable Wares
                      </div>
                      <ul className="text-[10px] space-y-0.5">
                        {biz.notableItems.map((item, i) => <li key={i} className="flex items-center gap-1 italic"><Package size={8} /> {item}</li>)}
                      </ul>
                    </div>
                    <div className="text-[10px] bg-stone-800/5 p-2 rounded italic mb-2 border border-stone-300/30">
                       <MessageSquareQuote size={10} className="inline mr-1 text-stone-400" /> "{biz.rumor}"
                    </div>
                    <div className="text-[10px] mt-auto border-t border-stone-300/50 pt-2 text-stone-600">
                      <span className="font-bold">Proprietor:</span> {biz.owner.name} ({biz.owner.race})
                      <br/>
                      <span className="italic">Quirk: {biz.owner.trait}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Residents Dossier & Full Matrix */}
            <section className="page-break-before mb-16">
              <div className="flex justify-between items-end border-b-2 border-stone-800 mb-8 pb-2">
                <h3 className="text-3xl font-bold medieval-font flex items-center gap-2 uppercase tracking-wider">
                  <UserCircle className="w-8 h-8 text-stone-800" /> Resident Dossiers & Social Matrix
                </h3>
                <div className="no-print relative mb-1">
                  <Search className="absolute left-2 top-2 w-4 h-4 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Search name..." 
                    className="pl-8 py-1 text-sm bg-white/50 border border-stone-300 rounded outline-none focus:ring-1 focus:ring-amber-500"
                    onChange={(e) => setNpcFilter(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-16">
                {village.residents.filter(r => r.name.toLowerCase().includes(npcFilter.toLowerCase())).map((npc, idx) => {
                  const isEditing = editingNpcIdx === idx;
                  const isPortraitLoading = portraitLoading[idx];
                  return (
                    <div key={idx} className="p-8 border-2 border-stone-400 bg-white/20 rounded-lg shadow-xl relative group overflow-hidden">
                      {/* Edit Button */}
                      {!isEditing && (
                        <button 
                          onClick={() => startEditingNpc(idx, npc)}
                          className="absolute top-4 right-4 p-2 bg-stone-200/50 hover:bg-stone-300 rounded-full transition-colors no-print text-stone-600 group-hover:opacity-100 opacity-0 z-10"
                          title="Edit NPC Details"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}

                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/3 flex flex-col">
                          {/* Portrait Area */}
                          <div className="relative mb-6 w-full aspect-square bg-stone-800/10 border-4 border-stone-800/20 rounded shadow-inner flex items-center justify-center group/portrait">
                            {npc.portraitUrl ? (
                              <img src={npc.portraitUrl} alt={npc.name} className="w-full h-full object-cover rounded shadow-md" />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-stone-400">
                                {isPortraitLoading ? (
                                  <RefreshCw className="w-12 h-12 animate-spin text-amber-600" />
                                ) : (
                                  <UserCircle className="w-24 h-24 opacity-20" />
                                )}
                              </div>
                            )}
                            
                            {!npc.portraitUrl && !isPortraitLoading && (
                              <button 
                                onClick={() => handleGeneratePortrait(idx, npc)}
                                className="absolute inset-0 bg-stone-900/60 opacity-0 group-portrait/portrait:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-amber-500 font-bold medieval-font no-print"
                              >
                                <Wand2 className="w-8 h-8 animate-bounce" />
                                <span>Generate Portrait</span>
                              </button>
                            )}

                            {npc.portraitUrl && !isPortraitLoading && (
                               <button 
                                onClick={() => handleGeneratePortrait(idx, npc)}
                                className="absolute bottom-2 right-2 p-2 bg-stone-900/80 rounded-full text-amber-500 opacity-0 group-portrait/portrait:opacity-100 transition-opacity no-print shadow-lg hover:scale-110"
                                title="Regenerate Portrait"
                              >
                                <RefreshCw size={16} />
                              </button>
                            )}
                          </div>

                          <div className="mb-4">
                            <h4 className="text-4xl font-bold medieval-font text-stone-900 mb-0">{npc.name}</h4>
                            <p className="text-amber-900 font-bold uppercase text-xs tracking-widest">{npc.race} — {npc.role}</p>
                            
                            {/* Combat Stats Section */}
                            <div className="mt-4 grid grid-cols-2 gap-2 bg-stone-800/5 p-3 rounded-sm border border-stone-800/10">
                              <div className="flex items-center gap-2">
                                <Shield size={14} className="text-stone-700" />
                                <span className="text-xs font-bold text-stone-900">AC {npc.stats?.ac || 10}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Activity size={14} className="text-rose-700" />
                                <span className="text-xs font-bold text-stone-900">HP {npc.stats?.hp || 4}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Sword size={14} className="text-stone-700" />
                                <span className="text-xs font-bold text-stone-900">ATK {npc.stats?.atk || "+0"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Axe size={14} className="text-stone-700" />
                                <span className="text-xs font-bold text-stone-900">DMG {npc.stats?.dmg || "1d4"}</span>
                              </div>
                            </div>

                            {/* Trait Field */}
                            <div className="mt-4">
                              <div className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-1.5 mb-1">
                                <Fingerprint size={12} className="text-stone-700" /> Defining Trait
                              </div>
                              {isEditing ? (
                                <input 
                                  className="w-full bg-white/80 border border-stone-400 rounded px-2 py-1 text-sm italic font-bold text-stone-800"
                                  value={tempNpcData.trait}
                                  onChange={(e) => setTempNpcData({ ...tempNpcData, trait: e.target.value })}
                                />
                              ) : (
                                <p className="text-sm font-bold text-stone-800 italic">{npc.trait}</p>
                              )}
                            </div>
                          </div>

                          {/* Personality Field */}
                          <div className="mb-4">
                            <div className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-1.5 mb-1">
                              <Pencil size={12} className="text-stone-700" /> Personality
                            </div>
                            {isEditing ? (
                              <textarea 
                                className="w-full bg-white/80 border border-stone-400 rounded px-2 py-1 text-sm italic text-stone-700 min-h-[80px]"
                                value={tempNpcData.personality}
                                onChange={(e) => setTempNpcData({ ...tempNpcData, personality: e.target.value })}
                              />
                            ) : (
                              <p className="italic leading-relaxed border-l-4 border-stone-300 pl-4 text-stone-700">"{npc.personality}"</p>
                            )}
                          </div>

                          {/* Secret Field */}
                          <div className={`bg-red-50 p-3 border border-red-100 rounded no-print ${isEditing ? 'ring-2 ring-red-400/20' : ''}`}>
                            <div className="flex items-center gap-2 text-red-900 font-bold text-[10px] uppercase mb-1">
                              <EyeOff size={12} /> Secret (DM ONLY)
                            </div>
                            {isEditing ? (
                              <textarea 
                                className="w-full bg-white border border-red-200 rounded px-2 py-1 text-xs italic text-red-800 min-h-[60px]"
                                value={tempNpcData.secret}
                                onChange={(e) => setTempNpcData({ ...tempNpcData, secret: e.target.value })}
                              />
                            ) : (
                              <p className="text-xs italic text-red-800">{npc.secret}</p>
                            )}
                          </div>

                          {/* Edit Controls */}
                          {isEditing && (
                            <div className="flex gap-2 mt-4 no-print">
                              <button 
                                onClick={() => saveNpcChanges(idx)}
                                className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-all text-xs"
                              >
                                <Check size={14} /> Save Changes
                              </button>
                              <button 
                                onClick={cancelEditingNpc}
                                className="flex items-center justify-center gap-1 bg-stone-400 hover:bg-stone-500 text-white font-bold py-2 px-4 rounded transition-all text-xs"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="w-full md:w-2/3">
                          <h5 className="text-xs font-black uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                            <ArrowRight size={14} /> Full Social Matrix for {npc.name}
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {npc.relationships.map((rel, ridx) => {
                              const styles = getRelationshipStyles(rel.score);
                              return (
                                <div key={ridx} className={`p-3 rounded border ${styles.bg} ${styles.border} transition-all hover:bg-white`}>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-xs">{rel.targetName}</span>
                                    <div className={`text-[9px] font-black px-1.5 rounded border ${styles.border} ${styles.text} flex items-center gap-1`}>
                                      {styles.icon} {rel.score} • {rel.feeling}
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-stone-600 italic leading-tight">{rel.reason}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* GM Notes Section */}
            <section className="page-break-before">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 flex items-center gap-2 uppercase tracking-wider">
                <BookOpen className="w-8 h-8 text-stone-800" /> GM's Campaign Records
              </h3>
              
              {/* Weather System */}
              <div className="mb-6 p-6 border-2 border-stone-800/20 bg-stone-800/5 rounded-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-stone-800 text-amber-500 rounded-full shadow-lg">
                    <CloudFog className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1">
                      <Wind size={12} /> Atmospheric Conditions
                    </h4>
                    <p className="text-2xl font-serif italic font-bold text-stone-900 tracking-tight">
                      "{village.weather}"
                    </p>
                  </div>
                </div>
                <button 
                  onClick={rollWeather}
                  className="no-print group flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-amber-500 px-6 py-3 rounded-md font-bold transition-all shadow-lg active:scale-95"
                >
                  <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                  Roll for Weather
                </button>
              </div>

              <div className="p-6 border border-stone-400 bg-stone-300/30 rounded-md shadow-inner">
                <textarea
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                  className="w-full min-h-[300px] bg-transparent border-none focus:ring-0 text-lg font-serif italic leading-relaxed text-stone-900 resize-none outline-none"
                  placeholder="Notes on the timeline, party actions, and changes to the matrix..."
                />
              </div>
            </section>
          </div>
        </div>
      )}

      {!village && !loading && (
        <div className="max-w-2xl text-center space-y-8 mt-20">
          <div className="p-12 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20 backdrop-blur">
            <Scroll className="w-24 h-24 text-amber-600/50 mx-auto mb-6" />
            <h3 className="text-3xl medieval-font mb-4 italic">The matrix is yet unformed...</h3>
            <p className="text-slate-400 text-lg mb-8">
              Click "Manifest Village" to generate a massive Shadowdark dossier. 
              Warning: Manifesting 15x15 relationship paths consumes significant stellar energy.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center flex-col gap-6">
          <div className="relative">
            <Flame className="w-24 h-24 text-amber-500 animate-pulse" />
            <RefreshCw className="w-24 h-24 text-amber-600 animate-spin absolute top-0 left-0 opacity-20" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl medieval-font text-amber-500 mb-2">Calculating 210 Relationship Paths</h2>
            <p className="text-slate-400 italic">Forging 3 main quests, 10 side treks, and a full social matrix...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
