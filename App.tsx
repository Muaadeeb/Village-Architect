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
  Briefcase
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
      const newGossip = await generateVillageGossip(village);
      setGossip(prev => [...newGossip, ...prev].slice(0, 9));
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
          <div className="parchment p-8 md:p-12 rounded-sm shadow-2xl border-2 border-stone-400/30 relative overflow-visible">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Skull className="w-96 h-96" />
            </div>

            <div className="border-b-2 border-stone-800 pb-6 mb-8 text-center">
              <h2 className="text-7xl font-bold medieval-font mb-2 uppercase tracking-tighter">{village.name}</h2>
              <p className="text-xl italic font-serif opacity-80 uppercase tracking-widest">Master Dossier & Complete Social Matrix</p>
            </div>

            {/* Village Overview & Description */}
            <section className="mb-12">
              <div className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 pb-1 uppercase tracking-wider">
                <Scroll className="w-6 h-6 text-stone-700" /> Village Narrative Overview
              </div>
              <p className="text-xl italic font-serif leading-relaxed text-stone-900 bg-stone-800/5 p-6 border-l-4 border-stone-800 rounded-r">
                "{village.description}"
              </p>
            </section>

            {/* Top Row: Distribution & Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <section>
                <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b border-stone-800 mb-6 pb-1">
                  <Users className="w-6 h-6 text-stone-700" /> Village Distribution
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center border-b border-stone-800 mb-4 pb-1">
                  <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font">
                    <MapIcon className="w-6 h-6 text-stone-700" /> Local Cartography
                  </h3>
                  <button onClick={handleGenerateMap} className="text-[10px] font-bold bg-stone-800 text-amber-500 px-2 py-1 rounded no-print hover:bg-stone-700">
                    {mapLoading ? 'Drawing...' : 'Update Map'}
                  </button>
                </div>
                <div className="w-full aspect-[16/9] bg-stone-900/10 border-2 border-stone-800 flex items-center justify-center overflow-hidden">
                   {village.mapUrl ? <img src={village.mapUrl} className="w-full h-full object-cover" /> : <div className="text-stone-400 italic">No chart drafted.</div>}
                </div>
              </section>
            </div>

            {/* Gossip & Atmosphere */}
            <div className="grid grid-cols-1 gap-8 mb-16">
               <section>
                 <div className="flex justify-between items-center border-b-2 border-stone-800 mb-4 pb-1">
                    <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font">
                      <Newspaper className="w-6 h-6 text-stone-700" /> Town Gossip Log
                    </h3>
                    <button onClick={handleRollGossip} disabled={gossipLoading} className="no-print flex items-center gap-1 text-[10px] bg-amber-900 text-white px-2 py-1 rounded hover:bg-amber-800">
                      <RefreshCw size={10} className={gossipLoading ? 'animate-spin' : ''} /> Roll for Gossip
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   {gossip.length === 0 ? (
                     <div className="italic text-stone-500 text-sm col-span-3">No tavern talk logged yet. Click "Roll for Gossip" to listen in.</div>
                   ) : gossip.map((item, idx) => (
                     <div key={idx} className="bg-stone-100 p-3 border-l-4 border-amber-800 shadow-sm relative overflow-hidden group">
                        <p className="text-sm italic text-stone-900 leading-tight">"{item}"</p>
                     </div>
                   ))}
                 </div>
               </section>
               <section>
                  <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 pb-1">
                    <CloudFog className="w-6 h-6 text-stone-700" /> Atmospheric Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-800/10 border-l-4 border-stone-800 font-bold italic text-stone-900">
                       {village.weather}
                    </div>
                    <div className="text-sm leading-relaxed text-stone-700">
                       <span className="font-black uppercase text-[10px] block mb-1">Geography:</span>
                       {village.geography}
                    </div>
                  </div>
               </section>
            </div>

            {/* ESTABLISHMENT RECORDS */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={24} className="text-stone-800" /> Establishment Records
              </h3>
              <p className="text-[11px] text-stone-600 italic mb-4 no-print">Keep specific notes on each shop, its secrets, or current plot developments.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {village.businesses.map((business, bIdx) => (
                  <div key={bIdx} className="p-4 bg-white/40 border border-stone-300 rounded shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-stone-900 medieval-font text-xl">{business.name}</h4>
                      <span className="text-[9px] font-black bg-stone-800 text-white px-2 py-0.5 rounded">{business.type}</span>
                    </div>
                    <p className="text-[10px] italic text-stone-600 mb-2 leading-tight">Proprietor: <span className="font-bold text-stone-800">{business.owner.name}</span></p>
                    <p className="text-[11px] text-stone-700 mb-3 leading-relaxed">{business.description}</p>
                    
                    <div className="space-y-3 no-print">
                      <div className="bg-amber-100/50 p-2 rounded border-l-2 border-amber-800">
                        <p className="text-[9px] font-black text-amber-900 uppercase">Rumor</p>
                        <p className="text-[10px] italic text-amber-800">"{business.rumor}"</p>
                      </div>
                      <div className="p-2 border border-stone-300 rounded bg-white/50">
                        <label className="text-[9px] font-black text-stone-500 uppercase block mb-1 flex items-center gap-1">
                          <Edit2 size={8} /> GM Establishment Notes
                        </label>
                        <textarea 
                          className="w-full text-[10px] bg-transparent border-none focus:ring-0 italic text-stone-800 min-h-[50px] resize-none"
                          placeholder="Store shop-specific secrets or hooks..."
                          value={business.gmNotes}
                          onChange={(e) => updateBusinessGMNotes(bIdx, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Landmarks & Quests */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase tracking-wider">
                <Castle size={24} className="inline mr-2" /> Key Landmarks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {village.landmarks.map((l, i) => (
                  <div key={i} className="p-4 bg-white/40 border border-stone-300 rounded shadow-sm break-inside-avoid">
                    <h4 className="font-bold text-stone-900 medieval-font text-xl">{l.name}</h4>
                    <p className="text-xs italic text-stone-600 mb-3">{l.description}</p>
                    <div className="bg-amber-100 p-2 rounded text-[10px] font-bold text-amber-900 border-l-4 border-amber-900">
                      HOOK: {l.encounterHook}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-16">
              <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase tracking-wider">
                <Swords size={24} className="inline mr-2" /> Local Quests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {village.mainQuests.map((q, i) => (
                   <div key={i} className="p-3 bg-stone-800/5 border-l-4 border-stone-800 rounded-r break-inside-avoid">
                      <h4 className="font-bold text-sm text-stone-900 uppercase tracking-tighter">{q.title}</h4>
                      <p className="text-[10px] italic text-stone-600 mb-1">{q.description}</p>
                      <span className="text-[9px] font-bold bg-stone-800 text-amber-500 px-2 rounded-full">Reward: {q.reward}</span>
                   </div>
                 ))}
              </div>
            </section>

            {/* POINT OF INTEREST - "SESSION IN A BOX" */}
            <section className="mb-16">
              <div className="flex justify-between items-center border-b-2 border-stone-800 mb-6 pb-1">
                <h3 className="text-2xl font-bold medieval-font uppercase tracking-wider flex items-center gap-2">
                  <Binoculars size={24} /> Nearby Crawl: Session in a Box
                </h3>
                {!village.poi && (
                  <button 
                    onClick={handleGeneratePOI} 
                    disabled={poiLoading}
                    className="no-print flex items-center gap-1 text-[10px] bg-amber-900 text-white px-3 py-1 rounded hover:bg-amber-800 uppercase font-black tracking-tighter"
                  >
                    {poiLoading ? <RefreshCw size={10} className="animate-spin" /> : <Mountain size={10} />} Scout Nearby POI
                  </button>
                )}
              </div>

              {poiLoading && (
                <div className="p-8 text-center animate-pulse">
                  <GhostIcon className="w-12 h-12 mx-auto text-stone-400 mb-4" />
                  <p className="text-stone-500 italic font-serif">Surveying local terrain for hidden dangers...</p>
                </div>
              )}

              {village.poi && (
                <div className="space-y-6">
                  <div className="bg-stone-800/10 p-4 border-l-4 border-stone-800 break-inside-avoid">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-3xl font-bold medieval-font leading-none">{village.poi.title}</h4>
                      <span className="text-[10px] font-black bg-stone-800 text-white px-2 py-0.5 rounded">{village.poi.type}</span>
                    </div>
                    <p className="text-[11px] font-bold text-stone-600 mb-2 flex items-center gap-1"><MapPin size={10} /> {village.poi.location}</p>
                    <p className="text-sm italic text-stone-800 leading-relaxed font-serif">{village.poi.background}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 h-full">
                    {village.poi.rooms.map((room, idx) => (
                      <div key={idx} className="bg-white/40 border border-stone-300 p-3 rounded shadow-sm hover:shadow-md transition-shadow group break-inside-avoid">
                        <div className="text-[10px] font-black text-stone-400 mb-1">ROOM {room.number}</div>
                        <h5 className="font-bold text-stone-900 text-xs uppercase mb-2 border-b border-stone-200 pb-1">{room.name}</h5>
                        <div className="space-y-2">
                           <div>
                             <p className="text-[9px] font-black text-stone-500 uppercase flex items-center gap-1"><EyeOff size={8} /> Atmosphere</p>
                             <p className="text-[10px] italic leading-tight text-stone-700">{room.description}</p>
                           </div>
                           <div>
                             <p className="text-[9px] font-black text-red-900 uppercase flex items-center gap-1"><Skull size={8} /> Danger</p>
                             <p className="text-[10px] leading-tight text-red-800">{room.threats}</p>
                           </div>
                           <div>
                             <p className="text-[9px] font-black text-amber-900 uppercase flex items-center gap-1"><Coins size={8} /> Treasure</p>
                             <p className="text-[10px] leading-tight text-amber-800 font-bold">{room.treasure}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Marketplace Ledger */}
            <section className="mb-16">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 flex items-center gap-2 uppercase tracking-wider">
                <Coins className="w-8 h-8 text-stone-800" /> The Marketplace Ledger
              </h3>
              <div className="bg-stone-800/5 p-6 border-2 border-stone-800/20 rounded-sm">
                <table className="w-full text-left text-sm font-serif border-collapse">
                  <thead className="border-b-2 border-stone-800 uppercase text-xs">
                    <tr>
                      <th className="py-2 px-2">Item Name</th>
                      <th className="py-2 px-2">Price</th>
                      <th className="py-2 px-2">Stock</th>
                      <th className="py-2 px-2">Vendor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-300">
                    {village.businesses.flatMap(b => b.marketItems.map((item, idx) => (
                      <tr key={`${b.name}-${idx}`} className="hover:bg-amber-100/30 transition-colors group break-inside-avoid">
                        <td className="py-3 px-2 font-bold text-stone-900">
                          <div className="flex items-center gap-2">
                            <Tag size={12} className="text-stone-400 group-hover:text-amber-800" /> {item.name}
                          </div>
                          <div className="text-[9px] font-normal text-stone-500 hidden group-hover:block italic">{item.description}</div>
                        </td>
                        <td className="py-3 px-2 italic font-bold text-amber-900">{item.price}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.availability === 'Common' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {item.availability}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-stone-600 text-[10px] font-bold">{b.name}</td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Secret Section */}
            <section className="mb-12 bg-black/5 p-8 border-l-4 border-red-900 rounded-r shadow-sm no-print">
              <h3 className="text-2xl font-bold medieval-font mb-3 text-red-900 flex items-center gap-2">
                <Skull className="w-7 h-7" /> The Town's Dark Secret (DM Eyes Only)
              </h3>
              <p className="text-2xl italic font-serif leading-relaxed text-stone-800">{village.darkSecret}</p>
            </section>

            {/* Social Matrix & Residents */}
            <section className="mb-16">
              <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-stone-800 mb-8 pb-2 gap-4">
                <h3 className="text-3xl font-bold medieval-font flex items-center gap-2 uppercase tracking-wider">
                  <UserCircle className="w-8 h-8 text-stone-800" /> Resident Dossiers
                </h3>
                
                {socialOverview && (
                  <div className="flex gap-4 mb-1 bg-stone-800/5 p-2 rounded border border-stone-300 no-print">
                    <div className="flex items-center gap-1 text-xs font-bold text-red-900">
                      <Frown size={14} /> {socialOverview.pariah} Pariahs
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-stone-600">
                      <Meh size={14} /> {socialOverview.resident} Residents
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-800">
                      <Crown size={14} /> {socialOverview.pillar} Pillars
                    </div>
                  </div>
                )}

                <div className="no-print relative mb-1">
                  <Search className="absolute left-2 top-2 w-4 h-4 text-stone-400" />
                  <input 
                    type="text" placeholder="Search residents..." 
                    className="pl-8 py-1 text-xs bg-white/50 border border-stone-300 rounded outline-none focus:ring-1 focus:ring-amber-500"
                    onChange={(e) => setNpcFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-12">
                {village.residents.filter(r => r.name.toLowerCase().includes(npcFilter.toLowerCase())).map((npc, idx) => {
                  const standing = getStandingCategory(npc);
                  const alignDetails = getAlignmentDetails(npc.alignment);
                  return (
                    <div key={idx} className="p-8 border-2 border-stone-400 bg-white/20 rounded shadow-xl relative group break-inside-avoid">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/3 flex flex-col items-center text-center">
                          <div className="relative w-full aspect-square bg-stone-800/10 mb-6 rounded shadow-inner border-2 border-stone-300 overflow-hidden group/portrait">
                            {npc.portraitUrl ? (
                              <img src={npc.portraitUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {portraitLoading[idx] ? (
                                  <RefreshCw className="w-12 h-12 animate-spin text-amber-600" />
                                ) : (
                                  <UserCircle className="w-full h-full opacity-10 p-4" />
                                )}
                              </div>
                            )}

                            {!portraitLoading[idx] && (
                              <button 
                                onClick={() => handleGeneratePortrait(idx, npc)}
                                className={`absolute inset-0 bg-stone-900/60 transition-opacity flex flex-col items-center justify-center gap-2 text-amber-500 font-bold medieval-font no-print ${npc.portraitUrl ? 'opacity-0 group-hover/portrait:opacity-100' : 'opacity-100'}`}
                              >
                                <Wand2 className="w-8 h-8 animate-bounce" />
                                <span>{npc.portraitUrl ? 'Regenerate Portrait' : 'Manifest Portrait'}</span>
                              </button>
                            )}

                            <button 
                              onClick={(e) => { e.stopPropagation(); playVoice(idx, npc); }}
                              className="absolute bottom-2 right-2 p-3 bg-amber-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all no-print disabled:opacity-50 z-10"
                              disabled={voiceLoading[idx]}
                            >
                              {voiceLoading[idx] ? <RefreshCw className="animate-spin" size={20} /> : <Volume2 size={20} />}
                            </button>
                          </div>
                          <h4 className="text-3xl font-bold medieval-font leading-tight">{npc.name}</h4>
                          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">
                             {npc.sex} • {npc.race} • {npc.role}
                          </p>
                          
                          <div className="flex flex-col gap-2 w-full px-4">
                            <div className={`text-[10px] font-black px-3 py-1 bg-stone-100 rounded-full border border-stone-300 shadow-sm flex items-center justify-center gap-1.5 ${standing.color}`}>
                               {standing.icon} {standing.label}
                            </div>
                            <div className={`text-[10px] font-black px-3 py-1 ${alignDetails.bg} rounded-full border border-stone-300 shadow-sm flex items-center justify-center gap-1.5 ${alignDetails.color}`}>
                               {alignDetails.icon} {npc.alignment}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                           <div className="grid grid-cols-1 gap-8">
                              <div>
                                 <h5 className="text-[10px] font-black uppercase text-stone-400 mb-2">Personality & Traits</h5>
                                 <p className="italic text-stone-700 border-l-4 border-stone-300 pl-4 mb-4 text-sm leading-relaxed">"{npc.personality}"</p>
                                 <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2 py-1 bg-stone-800 text-amber-500 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                                       <Fingerprint size={10} /> {npc.trait}
                                    </span>
                                    <span className="px-2 py-1 bg-rose-900 text-white text-[10px] font-bold rounded uppercase flex items-center gap-1">
                                       <Shield size={10} /> AC {npc.stats.ac} | HP {npc.stats.hp}
                                    </span>
                                 </div>
                                 <div className="bg-red-50 p-2 border border-red-100 rounded no-print">
                                    <h6 className="text-[9px] font-black text-red-900 uppercase mb-1">Alignment-Based Secret</h6>
                                    <p className="text-[10px] italic text-red-800">{npc.secret}</p>
                                 </div>
                              </div>

                              <div>
                                 <h5 className="text-[10px] font-black uppercase text-stone-400 mb-2">Social Matrix Insights</h5>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar print:max-h-none print:overflow-visible">
                                    {npc.relationships.map((rel, ridx) => {
                                       const styles = getRelationshipStyles(rel.score);
                                       return (
                                          <div key={ridx} className={`p-2 rounded border text-[10px] transition-all duration-500 ${styles.bg} ${styles.border} ${styles.effects} break-inside-avoid`}>
                                             <div className="flex justify-between font-bold mb-0.5">
                                                <span>{rel.targetName}</span>
                                                <span className={styles.text}>{rel.score} • {rel.feeling}</span>
                                             </div>
                                             <p className="italic opacity-70 leading-tight">{rel.reason}</p>
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

            {/* GM Records */}
            <section className="no-print">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase tracking-wider">
                <BookOpen size={24} className="inline mr-2" /> Campaign Records
              </h3>
              <div className="p-6 bg-stone-300/20 border-2 border-dashed border-stone-400 rounded-lg">
                 <textarea 
                  className="w-full min-h-[200px] bg-transparent focus:ring-0 border-none italic text-lg font-serif text-stone-800 leading-relaxed outline-none"
                  placeholder="Record party deeds, casualties, and shifted alliances here..."
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                 />
              </div>
            </section>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center flex-col gap-6 p-6">
          <div className="relative">
            <Flame className="w-24 h-24 text-amber-500 animate-pulse" />
            <RefreshCw className="w-24 h-24 text-amber-600 animate-spin absolute top-0 left-0 opacity-10" />
          </div>
          <h2 className="text-3xl medieval-font text-amber-500 text-center uppercase tracking-tighter">Forging Village Matrix...</h2>
          <p className="text-slate-400 italic text-center max-w-sm">Generating relationships across Shadowdark alignments, stocking shops, and drafting dark deeds.</p>
        </div>
      )}
    </div>
  );
};

export default App;