import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  generateVillageDetails, 
  generateNPCPortrait, 
  generateVillageMap, 
  generateMerchantVoice,
  generateVillageGossip,
  generatePOI
} from './services/geminiService';
import { VillageData, DetailedNPC, Relationship, PointOfInterest, Business } from './types';
import { 
  Scroll, RefreshCw, Users, Flame, Waves, Store, Printer, Skull, ArrowRight, UserCircle,
  EyeOff, MessageSquareQuote, BookOpen, Pencil, MapPin, Heart, Swords, Minus, Package,
  ShoppingBag, Sparkles, Search, Fingerprint, Edit2, Check, X, CloudFog, Wind, Wand2,
  Map as MapIcon, Compass, FileText, Shield, Activity, Sword, Axe, Zap, Castle, Crown,
  Frown, Meh, Volume2, Coins, Tag, Newspaper, BarChart3, Info, Scale, CircleDot, Ghost,
  User as UserIcon, Mountain, Ghost as GhostIcon, Binoculars, AlertCircle,
  Briefcase, FileDigit
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// --- Decoding Helpers for raw PCM from Gemini TTS ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [poiLoading, setPoiLoading] = useState(false);
  const [gossipLoading, setGossipLoading] = useState(false);
  const [village, setVillage] = useState<VillageData | null>(null);
  const [gossip, setGossip] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editableNotes, setEditableNotes] = useState("");
  const [npcFilter, setNpcFilter] = useState("");
  const [portraitLoading, setPortraitLoading] = useState<Record<number, boolean>>({});
  const [voiceLoading, setVoiceLoading] = useState<Record<number, boolean>>({});
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const calculateDemographics = (total: number) => {
    const humans = Math.floor(total * 0.85);
    const halflings = Math.floor(total * 0.08);
    const dwarves = Math.floor(total * 0.03);
    const elves = Math.floor(total * 0.02);
    const remaining = total - (humans + halflings + dwarves + elves);
    return { humans, halflings, dwarves, elves, others: remaining > 0 ? [{ race: 'Half-Orc', count: remaining }] : [] };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPortraitLoading({});
    setVoiceLoading({});
    setGossip([]);
    try {
      const pop = Math.floor(Math.random() * (300 - 200) + 200);
      const data = await generateVillageDetails("Cinderglade", pop, calculateDemographics(pop));
      setVillage(data);
      setEditableNotes(data.gmNotes || "");
    } catch (err) {
      setError("The shadows have obscured the path. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePOI = async () => {
    if (!village || poiLoading) return;
    setPoiLoading(true);
    try {
      const poiData = await generatePOI(village);
      setVillage({ ...village, poi: poiData });
    } catch (err) {
      console.error("POI generation failed", err);
    } finally {
      setPoiLoading(false);
    }
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

  const handleRollGossip = async () => {
    if (!village || gossipLoading) return;
    setGossipLoading(true);
    try {
      const gossipData = await generateVillageGossip(village);
      setGossip(prev => [...gossipData, ...prev].slice(0, 9));
    } catch (err) {
      console.error("Gossip failed", err);
    } finally {
      setGossipLoading(false);
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

  const updateBusinessGMNotes = (bIdx: number, newNotes: string) => {
    if (!village) return;
    const newBusinesses = [...village.businesses];
    newBusinesses[bIdx] = { ...newBusinesses[bIdx], gmNotes: newNotes };
    setVillage({ ...village, businesses: newBusinesses });
  };

  const playVoice = async (idx: number, npc: DetailedNPC) => {
    if (voiceLoading[idx]) return;
    setVoiceLoading(prev => ({ ...prev, [idx]: true }));
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const base64 = await generateMerchantVoice(npc);
      const audioData = decodeBase64(base64);
      const buffer = await decodeAudioData(audioData, ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (err) {
      console.error("Voice playback failed", err);
    } finally {
      setVoiceLoading(prev => ({ ...prev, [idx]: false }));
    }
  };

  const getAlignmentDetails = (alignment: string) => {
    switch(alignment) {
      case 'Lawful': return { icon: <Scale size={14} />, color: 'text-blue-900', bg: 'bg-blue-50' };
      case 'Chaotic': return { icon: <Zap size={14} />, color: 'text-purple-900', bg: 'bg-purple-50' };
      default: return { icon: <CircleDot size={14} />, color: 'text-stone-700', bg: 'bg-stone-50' };
    }
  };

  const getRelationshipStyles = (rawScore: number) => {
    const score = Math.max(1, Math.min(10, Math.round(rawScore)));
    if (score >= 8) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: <Heart size={10} />, effects: 'animate-pulse-subtle' };
    if (score <= 3) return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', icon: <Swords size={10} />, effects: 'matrix-desaturated' };
    return { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-800', icon: <Minus size={10} />, effects: '' };
  };

  const getStandingCategory = (npc: DetailedNPC) => {
    const avg = npc.relationships.reduce((acc, r) => acc + r.score, 0) / (npc.relationships.length || 1);
    if (avg <= 3.5) return { label: 'Pariah', color: 'text-red-900', icon: <Frown size={12}/> };
    if (avg >= 7.5) return { label: 'Pillar', color: 'text-amber-800', icon: <Crown size={12}/> };
    return { label: 'Resident', color: 'text-stone-900', icon: <Users size={12}/> };
  };

  const socialOverview = useMemo(() => {
    if (!village) return null;
    const stats = { pariah: 0, resident: 0, pillar: 0 };
    village.residents.forEach(r => {
      const standing = getStandingCategory(r).label;
      if (standing === 'Pariah') stats.pariah++;
      else if (standing === 'Pillar') stats.pillar++;
      else stats.resident++;
    });
    return stats;
  }, [village]);

  const chartData = village ? [
    { name: 'Humans', value: village.demographics.humans, color: '#4b5563' },
    { name: 'Halflings', value: village.demographics.halflings, color: '#059669' },
    { name: 'Dwarves', value: village.demographics.dwarves, color: '#b45309' },
    { name: 'Elves', value: village.demographics.elves, color: '#7c3aed' },
    ...village.demographics.others.map(o => ({ name: o.race, value: o.count, color: '#dc2626' }))
  ] : [];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* HUD - Not Printed */}
      <div className="max-w-6xl w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12 no-print">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold medieval-font text-amber-500 mb-2 flex items-center gap-3">
            <Flame className="w-10 h-10 animate-pulse text-amber-600" />
            Shadowdark Architect
          </h1>
          <p className="text-slate-400 italic">"Full Dossier: Lives, Deaths, and Grudges in the Gloom."</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()} 
            className="bg-stone-800 hover:bg-stone-700 text-amber-500 font-bold py-4 px-6 rounded-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-lg medieval-font border border-amber-900/50"
          >
            <Printer size={20} /> Print Dossier
          </button>
          <button onClick={handleGenerate} disabled={loading} className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-lg medieval-font">
            {loading ? <RefreshCw className="animate-spin" /> : <Scroll />} Manifest Village
          </button>
        </div>
      </div>

      {village && (
        <div className="w-full max-w-4xl flex flex-col gap-6 relative">
          <div className="parchment p-8 md:p-12 rounded-sm shadow-2xl border-2 border-stone-400/30 relative overflow-visible h-auto">
            
            {/* Page 1: Title & Atmospheric Records */}
            <section className="print:print-page-border">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none no-print">
                <Skull className="w-96 h-96" />
              </div>

              <div className="border-b-4 border-double border-stone-800 pb-6 mb-12 text-center">
                <h2 className="text-7xl font-bold medieval-font mb-2 uppercase tracking-tighter">{village.name}</h2>
                <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.2em] opacity-80">
                  <span>Village Dossier</span>
                  <div className="w-2 h-2 rounded-full bg-stone-800"></div>
                  <span>Shadowdark RPG</span>
                </div>
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 pb-1 uppercase">
                  <Scroll className="w-6 h-6" /> Narrative Manifest
                </div>
                <p className="text-2xl italic font-serif leading-relaxed text-stone-900 bg-white/30 p-8 border-l-8 border-stone-800 rounded-r shadow-inner">
                  "{village.description}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 break-inside-avoid">
                <div>
                  <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b border-stone-800 mb-6 pb-1">
                    <Users className="w-6 h-6" /> Census Data
                  </h3>
                  <div className="h-64 w-full bg-white/20 p-4 rounded-lg border border-stone-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center border-b border-stone-800 mb-4 pb-1">
                    <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font">
                      <MapIcon className="w-6 h-6" /> Local Chart
                    </h3>
                    <button onClick={handleGenerateMap} className="text-[10px] font-bold bg-stone-800 text-amber-500 px-2 py-1 rounded no-print hover:bg-stone-700">
                      {mapLoading ? 'Drafting...' : 'Update Map'}
                    </button>
                  </div>
                  <div className="w-full aspect-[16/9] bg-stone-900/10 border-2 border-stone-800 flex items-center justify-center overflow-hidden shadow-md">
                     {village.mapUrl ? <img src={village.mapUrl} className="w-full h-full object-cover" /> : <div className="text-stone-400 italic">No visual chart drafted.</div>}
                  </div>
                </div>
              </div>
            </section>

            {/* Page 2: Gossip & Local Records */}
            <section className="print:print-page-border">
              <div className="grid grid-cols-1 gap-12 mb-16 break-inside-avoid">
                 <div className="w-full">
                   <div className="flex justify-between items-center border-b-2 border-stone-800 mb-4 pb-1">
                      <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font uppercase">
                        <Newspaper className="w-6 h-6" /> Tavern Intelligence
                      </h3>
                      <button onClick={handleRollGossip} disabled={gossipLoading} className="no-print flex items-center gap-1 text-[10px] bg-amber-900 text-white px-2 py-1 rounded hover:bg-amber-800 uppercase font-black">
                        <RefreshCw size={10} className={gossipLoading ? 'animate-spin' : ''} /> Refresh Gossip
                      </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {gossip.length === 0 ? (
                       <div className="italic text-stone-500 text-sm col-span-3">No tavern talk logged.</div>
                     ) : gossip.map((item, idx) => (
                       <div key={idx} className="bg-white/40 p-4 border-l-4 border-amber-800 shadow-sm relative overflow-hidden group">
                          <p className="text-base italic text-stone-900 leading-tight">"{item}"</p>
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 <div>
                    <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 pb-1 uppercase">
                      <CloudFog className="w-6 h-6" /> Regional Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-6 bg-white/40 border-2 border-stone-800 font-bold italic text-stone-900 text-xl text-center flex items-center justify-center">
                         {village.weather}
                      </div>
                      <div className="text-lg leading-relaxed text-stone-700">
                         <span className="font-black uppercase text-[10px] block mb-1 opacity-50">Local Geography:</span>
                         {village.geography}
                      </div>
                    </div>
                 </div>
              </div>
            </section>

            {/* Page 3: Establishments & Commerce */}
            <section className="page-break-before print:print-page-border">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 flex items-center gap-2 uppercase tracking-wider">
                <Briefcase size={28} /> Establishment Records
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {village.businesses.map((business, bIdx) => (
                  <div key={bIdx} className="p-6 bg-white/50 border-2 border-stone-300 rounded shadow-md break-inside-avoid relative overflow-visible">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-stone-900 medieval-font text-2xl uppercase tracking-tighter">{business.name}</h4>
                      <span className="text-[10px] font-black bg-stone-800 text-white px-3 py-1 rounded uppercase">{business.type}</span>
                    </div>
                    <p className="text-xs italic text-stone-600 mb-3 border-b border-stone-200 pb-2">Proprietor: <span className="font-bold text-stone-900">{business.owner.name}</span></p>
                    <p className="text-base text-stone-700 mb-4 leading-relaxed font-serif">{business.description}</p>
                    
                    <div className="space-y-4">
                      <div className="bg-amber-100/60 p-3 rounded border-l-4 border-amber-800 shadow-inner">
                        <p className="text-[10px] font-black text-amber-900 uppercase mb-1">Local Rumor</p>
                        <p className="text-sm italic text-amber-900 leading-tight">"{business.rumor}"</p>
                      </div>
                      
                      <div className="p-4 border-2 border-dashed border-stone-400 rounded bg-white/40">
                        <label className="text-[9px] font-black text-stone-500 uppercase block mb-2 flex items-center gap-1">
                          <Edit2 size={10} /> GM Establishment Notes
                        </label>
                        <textarea 
                          className="w-full text-base bg-transparent border-none focus:ring-0 italic text-stone-800 min-h-[80px] resize-none leading-relaxed"
                          placeholder="Record shop secrets here..."
                          value={business.gmNotes}
                          onChange={(e) => updateBusinessGMNotes(bIdx, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Page 4: Hooks & Nearby Hazards */}
            <section className="page-break-before print:print-page-border">
              <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-1 uppercase tracking-wider flex items-center gap-2">
                <Swords size={28} /> Campaign Hooks & Points of Interest
              </h3>
              
              <div className="grid grid-cols-1 gap-12 mb-12">
                <div className="break-inside-avoid">
                  <h4 className="text-xl font-bold medieval-font mb-4 flex items-center gap-2"><Castle /> Landmarks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {village.landmarks.map((l, i) => (
                      <div key={i} className="p-5 bg-white/40 border-2 border-stone-300 rounded shadow-sm break-inside-avoid">
                        <h5 className="font-bold text-stone-900 medieval-font text-xl mb-1">{l.name}</h5>
                        <p className="text-sm italic text-stone-600 mb-4 leading-snug">{l.description}</p>
                        <div className="bg-amber-800/10 p-3 rounded text-sm font-bold text-amber-900 border-l-4 border-amber-900 italic">
                          "{l.encounterHook}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="break-inside-avoid">
                  <h4 className="text-xl font-bold medieval-font mb-4 flex items-center gap-2"><Scroll /> Local Quests</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {village.mainQuests.map((q, i) => (
                       <div key={i} className="p-4 bg-stone-800/5 border-l-8 border-stone-800 rounded-r shadow-sm">
                          <h5 className="font-bold text-base text-stone-900 uppercase tracking-tighter mb-1">{q.title}</h5>
                          <p className="text-sm italic text-stone-600 mb-2 leading-tight">{q.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black bg-stone-800 text-amber-400 px-3 py-1 rounded-full uppercase">Reward: {q.reward}</span>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              {/* Session In A Box Sub-section */}
              <div className="page-break-before">
                <div className="flex justify-between items-center border-b-2 border-stone-800 mb-6 pb-2">
                  <h4 className="text-2xl font-bold medieval-font uppercase tracking-wider flex items-center gap-2">
                    <Binoculars size={24} /> Nearby Crawl: Session in a Box
                  </h4>
                  {!village.poi && (
                    <button 
                      onClick={handleGeneratePOI} 
                      disabled={poiLoading}
                      className="no-print flex items-center gap-1 text-[10px] bg-amber-900 text-white px-4 py-2 rounded hover:bg-amber-800 uppercase font-black"
                    >
                      {poiLoading ? <RefreshCw className="animate-spin" /> : <Mountain size={14} />} Scout Terrain
                    </button>
                  )}
                </div>

                {poiLoading && (
                  <div className="p-16 text-center animate-pulse">
                    <GhostIcon className="w-16 h-16 mx-auto text-stone-400 mb-4" />
                    <p className="text-xl stone-500 italic font-serif">Surveying hidden hazards...</p>
                  </div>
                )}

                {village.poi && (
                  <div className="space-y-8">
                    <div className="bg-stone-800/10 p-8 border-l-8 border-stone-800 break-inside-avoid shadow-inner">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="text-4xl font-bold medieval-font leading-none">{village.poi.title}</h5>
                        <span className="text-xs font-black bg-stone-800 text-white px-4 py-1 rounded uppercase">{village.poi.type}</span>
                      </div>
                      <p className="text-sm font-bold text-stone-600 mb-4 flex items-center gap-1"><MapPin size={14} /> {village.poi.location}</p>
                      <p className="text-lg italic text-stone-800 leading-relaxed font-serif bg-white/30 p-4 rounded">"{village.poi.background}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {village.poi.rooms.map((room, idx) => (
                        <div key={idx} className="bg-white/60 border-2 border-stone-400 p-4 rounded-sm shadow-md break-inside-avoid flex flex-col">
                          <div className="text-[10px] font-black text-stone-400 mb-1">CHAMBER {room.number}</div>
                          <h6 className="font-bold text-stone-900 text-sm uppercase mb-3 border-b-2 border-stone-800 pb-1">{room.name}</h6>
                          <div className="space-y-4 flex-1">
                             <div>
                               <p className="text-[10px] font-black text-stone-500 uppercase flex items-center gap-1"><EyeOff size={10} /> Sense</p>
                               <p className="text-xs italic leading-tight text-stone-700">{room.description}</p>
                             </div>
                             <div>
                               <p className="text-[10px] font-black text-red-900 uppercase flex items-center gap-1"><Skull size={10} /> Threat</p>
                               <p className="text-xs leading-tight text-red-800 font-bold">{room.threats}</p>
                             </div>
                             <div className="mt-auto pt-4">
                               <p className="text-[10px] font-black text-amber-900 uppercase flex items-center gap-1"><Coins size={10} /> Loot</p>
                               <p className="text-xs leading-tight text-amber-900 font-black bg-amber-100 p-2 rounded">{room.treasure}</p>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Page 5: Ledger Table */}
            <section className="page-break-before print:print-page-border">
              <h3 className="text-3xl font-bold medieval-font border-b-4 border-double border-stone-800 mb-8 pb-4 flex items-center gap-2 uppercase tracking-wider">
                <Coins size={32} /> Marketplace Ledger
              </h3>
              <div className="bg-white/40 p-1 border-2 border-stone-800 rounded-sm">
                <table className="w-full text-left text-sm font-serif">
                  <thead className="bg-stone-800 text-amber-500 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-3 px-4">Commodity Manifest</th>
                      <th className="py-3 px-4">Appraised Price</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4">Vendor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-stone-300">
                    {village.businesses.flatMap(b => b.marketItems.map((item, idx) => (
                      <tr key={`${b.name}-${idx}`} className="break-inside-avoid group">
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-stone-900 text-base mb-1">{item.name}</div>
                          <div className="text-[10px] font-normal text-stone-500 italic leading-tight">{item.description}</div>
                        </td>
                        <td className="py-4 px-4 align-top italic font-bold text-lg text-amber-900 whitespace-nowrap">{item.price}</td>
                        <td className="py-4 px-4 align-top">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.availability === 'Common' ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                            {item.availability}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-top text-stone-700 text-xs font-black uppercase">{b.name}</td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* DM Secrets - Usually short, so keep it with Dossiers or start on new page */}
            <section className="page-break-before bg-stone-900 text-stone-100 p-12 border-8 border-double border-red-900 shadow-2xl relative overflow-visible break-inside-avoid">
              <h3 className="text-4xl font-bold medieval-font mb-6 text-red-500 flex items-center gap-3 border-none pb-0 uppercase tracking-tighter">
                <Skull className="w-12 h-12" /> The Black Secret
              </h3>
              <p className="text-3xl italic font-serif leading-relaxed text-red-200">{village.darkSecret}</p>
              <div className="absolute top-2 right-4 text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Eyes Only</div>
            </section>

            {/* FINAL MAJOR SECTION: RESIDENTS */}
            <section className="page-break-before print:print-page-border">
              <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-stone-800 mb-12 pb-4 gap-4">
                <h3 className="text-4xl font-bold medieval-font flex items-center gap-2 uppercase tracking-wider border-none p-0">
                  <UserCircle size={36} /> Master Resident Dossiers
                </h3>
                
                <div className="no-print relative mb-1">
                  <Search className="absolute left-2 top-2 w-4 h-4 text-stone-400" />
                  <input 
                    type="text" placeholder="Filter residents..." 
                    className="pl-8 py-2 text-sm bg-white border-2 border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                    onChange={(e) => setNpcFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-16">
                {village.residents.filter(r => r.name.toLowerCase().includes(npcFilter.toLowerCase())).map((npc, idx) => {
                  const standing = getStandingCategory(npc);
                  const alignDetails = getAlignmentDetails(npc.alignment);
                  return (
                    <div key={idx} className="p-10 border-4 border-stone-800 bg-white/40 rounded-sm shadow-2xl relative group break-inside-avoid overflow-visible npc-card-print">
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="w-full md:w-1/3 flex flex-col items-center text-center">
                          <div className="relative w-full aspect-square bg-stone-800/10 mb-8 rounded-sm shadow-lg border-2 border-stone-800 overflow-hidden group/portrait">
                            {npc.portraitUrl ? (
                              <img src={npc.portraitUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {portraitLoading[idx] ? (
                                  <RefreshCw className="w-16 h-16 animate-spin text-amber-600" />
                                ) : (
                                  <UserCircle className="w-full h-full opacity-10 p-4" />
                                )}
                              </div>
                            )}

                            {!portraitLoading[idx] && (
                              <button 
                                onClick={() => handleGeneratePortrait(idx, npc)}
                                className={`absolute inset-0 bg-stone-900/80 transition-opacity flex flex-col items-center justify-center gap-3 text-amber-400 font-bold medieval-font no-print ${npc.portraitUrl ? 'opacity-0 group-hover/portrait:opacity-100' : 'opacity-100'}`}
                              >
                                <Wand2 className="w-10 h-10" />
                                <span className="text-lg">Manifest Portrait</span>
                              </button>
                            )}

                            <button 
                              onClick={(e) => { e.stopPropagation(); playVoice(idx, npc); }}
                              className="absolute bottom-4 right-4 p-4 bg-amber-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all no-print disabled:opacity-50 z-10"
                              disabled={voiceLoading[idx]}
                            >
                              {voiceLoading[idx] ? <RefreshCw className="animate-spin" size={24} /> : <Volume2 size={24} />}
                            </button>
                          </div>
                          
                          <h4 className="text-4xl font-bold medieval-font leading-none uppercase tracking-tighter mb-2">{npc.name}</h4>
                          <p className="text-xs font-black text-stone-500 uppercase tracking-widest mb-4">
                             {npc.sex} • {npc.race} • {npc.role}
                          </p>
                          
                          <div className="flex flex-col gap-3 w-full px-4">
                            <div className={`text-xs font-black px-4 py-2 bg-white rounded border-2 border-stone-800 shadow-sm flex items-center justify-center gap-2 ${standing.color}`}>
                               {standing.icon} {standing.label}
                            </div>
                            <div className={`text-xs font-black px-4 py-2 bg-white rounded border-2 border-stone-800 shadow-sm flex items-center justify-center gap-2 ${alignDetails.color}`}>
                               {alignDetails.icon} {npc.alignment}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                           <div className="grid grid-cols-1 gap-10">
                              <div>
                                 <h5 className="text-xs font-black uppercase text-stone-400 mb-3 tracking-[0.2em]">Psychological Profile</h5>
                                 <p className="italic text-xl text-stone-800 border-l-8 border-stone-800 pl-6 mb-6 leading-relaxed font-serif">"{npc.personality}"</p>
                                 
                                 <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="px-4 py-2 bg-stone-800 text-amber-400 text-xs font-bold rounded flex items-center justify-center gap-2 uppercase">
                                       <Fingerprint size={12} /> {npc.trait}
                                    </div>
                                    <div className="px-4 py-2 bg-rose-900 text-white text-xs font-bold rounded flex items-center justify-center gap-2 uppercase">
                                       <Shield size={12} /> AC {npc.stats.ac} | HP {npc.stats.hp}
                                    </div>
                                 </div>
                                 
                                 <div className="bg-red-50/80 p-4 border-2 border-red-200 rounded-sm">
                                    <h6 className="text-[10px] font-black text-red-900 uppercase mb-2 tracking-widest">Alignment Shadow Secret</h6>
                                    <p className="text-sm italic text-red-800 font-serif leading-snug">{npc.secret}</p>
                                 </div>
                              </div>

                              <div>
                                 <h5 className="text-xs font-black uppercase text-stone-400 mb-4 tracking-[0.2em]">Social Influence Matrix</h5>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] md:max-h-none overflow-y-auto pr-2 custom-scrollbar print:max-h-none print:overflow-visible h-auto">
                                    {npc.relationships.map((rel, ridx) => {
                                       const styles = getRelationshipStyles(rel.score);
                                       return (
                                          <div key={ridx} className={`p-3 rounded border-2 transition-all duration-500 ${styles.bg} ${styles.border} ${styles.effects} break-inside-avoid flex flex-col justify-between`}>
                                             <div className="flex justify-between font-black text-[10px] uppercase mb-1">
                                                <span>{rel.targetName}</span>
                                                <span className={styles.text}>{rel.score} • {rel.feeling}</span>
                                             </div>
                                             <p className="italic text-xs opacity-80 leading-tight font-serif">"{rel.reason}"</p>
                                          </div>
                                       );
                                    })}
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* FINAL PAGE: GM ARCHIVE */}
            <section className="page-break-before print:print-page-border no-print:hidden break-inside-avoid h-auto overflow-visible">
              <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-4 uppercase tracking-wider">
                <BookOpen size={36} /> Campaign Chronicle
              </h3>
              <div className="p-10 bg-white/40 border-4 border-dashed border-stone-400 rounded-sm h-auto min-h-[400px]">
                 <textarea 
                  className="w-full h-full min-h-[400px] bg-transparent focus:ring-0 border-none italic text-2xl font-serif text-stone-800 leading-relaxed outline-none resize-none"
                  placeholder="The chronicle of your deeds begins here..."
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                 />
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-stone-900/95 z-50 flex items-center justify-center flex-col gap-6 p-12">
          <div className="relative">
            <Flame className="w-32 h-32 text-amber-500 animate-pulse" />
            <RefreshCw className="w-32 h-32 text-amber-600 animate-spin absolute top-0 left-0 opacity-20" />
          </div>
          <h2 className="text-4xl medieval-font text-amber-500 text-center uppercase tracking-widest">Drafting the Dossier...</h2>
          <p className="text-stone-400 italic text-center max-w-md text-lg">Weaving alliances, stocking the market, and unearthing deep-seated grudges across the Shadowdark.</p>
        </div>
      )}
    </div>
  );
};

export default App;