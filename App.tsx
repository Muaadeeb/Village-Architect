
import React, { useState, useRef, useMemo } from 'react';
import { 
  generateVillageDetails, 
  generateNPCPortrait, 
  generateVillageMap, 
  generateMerchantVoice,
  generatePOI
} from './services/geminiService';
import { VillageData, DetailedNPC, PointOfInterest, Business, Festival } from './types';
import { 
  Scroll, RefreshCw, Users, Flame, Skull, UserCircle, MapPin, Heart, Swords, Minus,
  ShoppingBag, Edit2, Wand2, Compass, Shield, Activity, Zap, Castle, Crown, Frown,
  Volume2, Scale, CircleDot, Ghost, Binoculars, Briefcase, Dices, CloudRain, Sun,
  Moon, UserSearch, HandHelping, Save, Printer, Boxes, Landmark, Sprout, Leaf,
  Snowflake, Star, Globe, CalendarDays, BookOpen, Fingerprint, Goal,
  // Added missing icons
  MessageSquare, Axe, Target, Map
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// --- Encounter Constants ---
const ENCOUNTERS_DAY_INSIDE = [
  { icon: <UserSearch size={16} />, who: "Pickpocket", attitude: "Hostile", text: "A nimble youth lifts a pouch from a PC." },
  // Fixed missing icon MessageSquareQuote -> MessageSquare
  { icon: <MessageSquare size={16} />, who: "Street Preacher", attitude: "Bizarre", text: "A wild-eyed man screams of the 'Great Shadow'." },
  { icon: <Activity size={16} />, who: "Stray Hound", attitude: "Friendly", text: "A scrawny dog follows, hoping for meat." },
  { icon: <ShoppingBag size={16} />, who: "Suspicious Merchant", attitude: "Neutral", text: "Hooded figure offers elven silk suspiciously cheap." },
  { icon: <Shield size={16} />, who: "Guard Patrol", attitude: "Wary", text: "Guards demand to know the party's business." },
].concat(Array(15).fill({ icon: <Users size={16} />, who: "Villager", attitude: "Neutral", text: "A common resident goes about their daily business." }));

const ENCOUNTERS_NIGHT_INSIDE = [
  { icon: <UserSearch size={16} />, who: "Roof Stalker", attitude: "Hostile", text: "A silhouette leaps between rooftops." },
  { icon: <Ghost size={16} />, who: "Muffled Scream", attitude: "Wary", text: "A cry for help echoes from an alley." },
  { icon: <Users size={16} />, who: "Hooded Cultists", attitude: "Hostile", text: "Six figures carry a heavy, blood-stained sack." },
].concat(Array(17).fill({ icon: <Moon size={16} />, who: "Night Watch", attitude: "Neutral", text: "A lone sentry with a lantern walks the beat." }));

const ENCOUNTERS_MONSTERS = [
  // Fixed missing icon GhostIcon -> Ghost
  { icon: <Ghost size={16} />, who: "Shadow", attitude: "Hostile", text: "Darkness detaches from a wall and reaches for you." },
  { icon: <Skull size={16} />, who: "Ghoul", attitude: "Hostile", text: "Rubbery-skinned undead tries to drag you away." },
  { icon: <Activity size={16} />, who: "Giant Rat", attitude: "Neutral", text: "Dog-sized rodent gnaws on a bone." },
  // Added missing icon Axe
  { icon: <Axe size={16} />, who: "Ogre", attitude: "Hostile", text: "Lumbering brute chewing on a raw horse leg." },
  // Added missing icon Target
  { icon: <Target size={16} />, who: "Werewolf", attitude: "Hostile", text: "A half-man, half-wolf predator leaps from a roof." },
  // Fixed missing icon GhostIcon -> Ghost
].concat(Array(95).fill({ icon: <Ghost size={16} />, who: "Gloom Predator", attitude: "Hostile", text: "A low-level monster tracks the party from the shadows." }));

// --- App Component ---
const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [poiLoading, setPoiLoading] = useState(false);
  const [village, setVillage] = useState<VillageData | null>(null);
  const [editableNotes, setEditableNotes] = useState("");
  const [manualDemo, setManualDemo] = useState({ h: 170, ha: 16, d: 8, e: 4 });
  const [portraitLoading, setPortraitLoading] = useState<Record<number, boolean>>({});
  const [voiceLoading, setVoiceLoading] = useState<Record<number, boolean>>({});
  
  // Added missing roll states
  const [lastDayInsideRoll, setLastDayInsideRoll] = useState<number | null>(null);
  const [lastMonsterRoll, setLastMonsterRoll] = useState<number | null>(null);

  const calculateDemographics = (total: number) => {
    const h = Math.floor(total * 0.85);
    const ha = Math.floor(total * 0.08);
    const d = Math.floor(total * 0.04);
    const e = total - (h + ha + d);
    return { humans: h, halflings: ha, dwarves: d, elves: e, others: [] };
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const pop = Math.floor(Math.random() * 100 + 200);
      const data = await generateVillageDetails("Cinderglade", pop, calculateDemographics(pop));
      setVillage(data);
      setEditableNotes(data.gmNotes || "");
      setManualDemo({ h: data.demographics.humans, ha: data.demographics.halflings, d: data.demographics.dwarves, e: data.demographics.elves });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleManualRedraw = () => {
    if (!village) return;
    setVillage({ ...village, population: manualDemo.h + manualDemo.ha + manualDemo.d + manualDemo.e, demographics: { ...village.demographics, humans: manualDemo.h, halflings: manualDemo.ha, dwarves: manualDemo.d, elves: manualDemo.e } });
  };

  const handleGeneratePortrait = async (idx: number, npc: DetailedNPC) => {
    setPortraitLoading(p => ({ ...p, [idx]: true }));
    const url = await generateNPCPortrait(npc);
    if (village) {
      const res = [...village.residents];
      res[idx] = { ...res[idx], portraitUrl: url };
      setVillage({ ...village, residents: res });
    }
    setPortraitLoading(p => ({ ...p, [idx]: false }));
  };

  const handleGeneratePOI = async () => {
    if (!village) return;
    setPoiLoading(true);
    const poi = await generatePOI(village);
    setVillage({ ...village, poi });
    setPoiLoading(false);
  };

  // Added missing handleGenerateMap function
  const handleGenerateMap = async () => {
    if (!village) return;
    setLoading(true);
    try {
      const url = await generateVillageMap(village);
      setVillage({ ...village, mapUrl: url });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const playVoice = async (idx: number, npc: DetailedNPC) => {
    setVoiceLoading(p => ({ ...p, [idx]: true }));
    const base64 = await generateMerchantVoice(npc);
    const audioData = atob(base64);
    const bytes = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) bytes[i] = audioData.charCodeAt(i);
    const ctx = new AudioContext();
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
    setVoiceLoading(p => ({ ...p, [idx]: false }));
  };

  const chartData = useMemo(() => {
    if (!village) return [];
    return [
      { name: 'Humans', value: village.demographics.humans, color: '#1a1a1a' },
      { name: 'Halflings', value: village.demographics.halflings, color: '#44403c' },
      { name: 'Dwarves', value: village.demographics.dwarves, color: '#78716c' },
      { name: 'Elves', value: village.demographics.elves, color: '#a8a29e' },
    ].filter(d => d.value > 0);
  }, [village]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full flex justify-between items-center mb-12 no-print">
        <h1 className="text-4xl font-bold medieval-font text-amber-500 flex items-center gap-3"><Flame /> Shadowdark Architect</h1>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="bg-stone-800 text-amber-500 px-5 py-2 rounded-lg font-bold border border-amber-900/50"><Printer size={18} /></button>
          <button onClick={handleGenerate} className="bg-amber-600 text-white px-6 py-2 rounded-lg font-bold medieval-font text-lg shadow-xl hover:scale-105 transition-all">{loading ? <RefreshCw className="animate-spin" /> : "Manifest Village"}</button>
        </div>
      </div>

      {village && (
        <div className="w-full max-w-4xl space-y-12">
          {/* PAGE 1: Narrative, Morale, Census */}
          <section className="parchment p-12 border-2 border-stone-800/20 shadow-2xl relative">
            <div className="border-b-4 border-double border-stone-800 pb-6 mb-8 text-center">
              <h2 className="text-6xl font-bold medieval-font uppercase text-black">{village.name}</h2>
              <p className="text-xs font-black uppercase tracking-widest text-stone-600">Village Dossier • Shadowdark RPG</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 text-black flex items-center gap-2"><Scroll /> Narrative Manifest</h3>
                <p className="text-xl italic font-serif leading-relaxed text-black bg-white/40 p-6 border-l-4 border-stone-800">"{village.description}"</p>
                <div className="mt-8 p-6 bg-stone-100 border-2 border-stone-800 rounded flex flex-col items-center">
                  <h4 className="text-xs font-black uppercase text-stone-500 mb-2">Town Morale</h4>
                  <div className="text-3xl font-black medieval-font uppercase text-black">{village.morale}</div>
                </div>
              </div>
              <div className="break-inside-avoid">
                <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 text-black flex items-center gap-2"><Users /> Census</h3>
                <div className="h-64 w-full bg-white/20 p-4 border border-stone-200 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                        {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        layout="vertical" align="right" verticalAlign="middle" iconType="square"
                        formatter={(val, entry: any) => {
                          const percent = ((entry.payload.value / village.population) * 100).toFixed(0);
                          return <span className="text-[10px] font-black text-black uppercase">{val}: {entry.payload.value} ({percent}%)</span>;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="no-print p-4 bg-white/60 border border-stone-300 rounded text-[10px] font-black space-y-2">
                  <p className="uppercase text-stone-500">Manual Demographic Entry</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col"><span>Humans</span><input className="border p-1" type="number" value={manualDemo.h} onChange={e => setManualDemo({...manualDemo, h: parseInt(e.target.value)})}/></div>
                    <div className="flex flex-col"><span>Halflings</span><input className="border p-1" type="number" value={manualDemo.ha} onChange={e => setManualDemo({...manualDemo, ha: parseInt(e.target.value)})}/></div>
                    <div className="flex flex-col"><span>Dwarves</span><input className="border p-1" type="number" value={manualDemo.d} onChange={e => setManualDemo({...manualDemo, d: parseInt(e.target.value)})}/></div>
                    <div className="flex flex-col"><span>Elves</span><input className="border p-1" type="number" value={manualDemo.e} onChange={e => setManualDemo({...manualDemo, e: parseInt(e.target.value)})}/></div>
                  </div>
                  <button onClick={handleManualRedraw} className="w-full bg-stone-800 text-amber-500 py-1 rounded uppercase mt-1">Re-Draw Chart</button>
                </div>
              </div>
            </div>
          </section>

          {/* PAGE 2: Nearby Relations */}
          <section className="parchment p-12 page-break-before">
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-1 uppercase text-black flex items-center gap-2"><Globe /> Nearby Settlement Relations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {village.settlementRelations.map((rel, idx) => (
                <div key={idx} className="p-6 bg-white/40 border-2 border-stone-800 rounded shadow-sm">
                  <h4 className="text-xl font-bold medieval-font text-black">{rel.settlementName}</h4>
                  <div className="text-[10px] font-black bg-stone-800 text-white px-2 py-0.5 rounded inline-block my-2 uppercase">{rel.type} - {rel.status}</div>
                  <p className="text-sm italic text-black font-black leading-snug">"{rel.description}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 3: Festivals */}
          <section className="parchment p-12 page-break-before">
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-1 uppercase text-black flex items-center gap-2"><CalendarDays /> The Cycle of Tradition: Local Festivals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {village.festivals.map((fest, idx) => (
                <div key={idx} className="p-6 bg-white/40 border-2 border-stone-400 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-black uppercase medieval-font text-xl">{fest.name}</span>
                    <Star className="text-amber-600" size={20} />
                  </div>
                  <p className="text-[10px] font-black text-stone-600 uppercase mb-3">{fest.timing} of {fest.season}</p>
                  <div className="space-y-4">
                    <div><p className="text-[9px] font-black text-amber-900 uppercase">The Old Lore</p><p className="text-xs italic font-black text-stone-900">"{fest.lore}"</p></div>
                    <div><p className="text-[9px] font-black text-stone-500 uppercase">Modern Practice</p><p className="text-xs font-black text-stone-950">{fest.modernPractice}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 4: Atmosphere & Events */}
          <section className="parchment p-12 page-break-before">
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-1 uppercase text-black flex items-center gap-2"><CloudRain /> Atmosphere & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-4 bg-white/30 border-2 border-stone-800 rounded"><h4 className="text-xs font-black uppercase text-stone-500 mb-1">Current Climate</h4><p className="text-lg font-black text-black italic">"{village.weather}"</p></div>
              <div className="p-4 bg-white/30 border-2 border-stone-800 rounded"><h4 className="text-xs font-black uppercase text-stone-500 mb-1">Local Atmosphere</h4><p className="text-lg font-black text-black italic">"{village.atmosphere}"</p></div>
              <div className="p-4 bg-white/30 border-2 border-stone-800 rounded"><h4 className="text-xs font-black uppercase text-stone-500 mb-1">Geography</h4><p className="text-lg font-black text-black italic">"{village.geography}"</p></div>
            </div>
            <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase text-black flex items-center gap-2"><Zap /> Current Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {village.currentEvents.map((ev, i) => (
                <div key={i} className="p-5 bg-stone-100 border-l-4 border-stone-800 shadow-sm"><p className="text-sm font-black italic text-black leading-tight">"{ev}"</p></div>
              ))}
            </div>
          </section>

          {/* PAGE 5: Local Chart (Map) */}
          <section className="parchment p-12 page-break-before">
            {/* Fixed missing icon MapIcon -> Map */}
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-1 uppercase text-black flex items-center gap-2"><Map /> Local Chart (Map)</h3>
            <div className="w-full aspect-[16/9] bg-stone-900/10 border-4 border-stone-800 flex items-center justify-center overflow-hidden">
              {/* Linked handleGenerateMap to the manifest button */}
              {village.mapUrl ? <img src={village.mapUrl} className="w-full h-full object-cover" /> : <button onClick={handleGenerateMap} className="text-amber-600 medieval-font text-2xl no-print">Manifest Map</button>}
            </div>
          </section>

          {/* PAGE 6: Hooks, Landmarks, Quests */}
          <section className="parchment p-12 page-break-before">
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-1 uppercase text-black flex items-center gap-2"><Compass /> Campaign Hooks & POIs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div><h4 className="text-xl font-bold medieval-font text-black mb-4 flex items-center gap-2"><Landmark /> Landmarks</h4>{village.landmarks.map((l, i) => (<div key={i} className="mb-4 p-4 border-2 border-stone-300 rounded bg-white/40"><p className="font-bold text-black text-lg">{l.name}</p><p className="text-xs italic font-black text-stone-800">"{l.description}"</p><div className="mt-2 text-[10px] text-amber-950 font-black italic bg-amber-100 p-2 border-l-2 border-amber-800">Hook: {l.encounterHook}</div></div>))}</div>
              <div><h4 className="text-xl font-bold medieval-font text-black mb-4 flex items-center gap-2"><BookOpen /> Local Quests</h4>{village.mainQuests.map((q, i) => (<div key={i} className="mb-4 p-4 border-l-4 border-stone-800 bg-stone-100 rounded-r"><p className="font-bold text-black uppercase tracking-tight">{q.title}</p><p className="text-xs font-black italic text-stone-700">"{q.description}"</p><div className="mt-1 text-[9px] font-black bg-stone-800 text-amber-400 px-2 py-0.5 rounded inline-block">Reward: {q.reward}</div></div>))}</div>
            </div>
          </section>

          {/* PAGE 7: Crawl in a Box */}
          <section className="parchment p-12 page-break-before">
            <div className="flex justify-between items-center border-b-2 border-stone-800 mb-8 pb-2">
              <h3 className="text-3xl font-bold medieval-font text-black flex items-center gap-2 uppercase"><Boxes /> Nearby Crawl in a Box</h3>
              <button onClick={handleGeneratePOI} className="bg-stone-800 text-amber-500 text-xs px-4 py-1 rounded no-print">{poiLoading ? "Digging..." : village.poi ? "Regenerate" : "Draft Crawl"}</button>
            </div>
            {village.poi && (
              <div className="space-y-6 bg-stone-900 text-stone-200 p-8 rounded border-4 border-stone-700 shadow-xl">
                <h4 className="text-2xl font-bold medieval-font text-amber-500 uppercase">{village.poi.title}</h4>
                <p className="text-sm italic border-l-2 border-amber-600 pl-4 mb-6">"{village.poi.background}"</p>
                <div className="grid grid-cols-1 gap-4">
                  {village.poi.rooms.map((r, i) => (
                    <div key={i} className="p-4 border border-stone-700 bg-stone-800/50 rounded">
                      <p className="font-bold text-amber-400 text-sm uppercase">Room {r.number}: {r.name}</p>
                      <p className="text-xs italic text-stone-300 mt-1 mb-2">"{r.description}"</p>
                      <div className="flex gap-4"><div className="text-[9px] bg-red-900/30 p-2 rounded text-red-200 flex-1">Threat: {r.threats}</div><div className="text-[9px] bg-emerald-900/30 p-2 rounded text-emerald-200 flex-1">Treasure: {r.treasure}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* PAGE 8: The Black Secret */}
          <section className="page-break-before bg-stone-950 text-red-600 p-16 border-8 border-double border-red-900 shadow-2xl relative text-center">
            <h3 className="text-4xl font-bold medieval-font mb-6 flex items-center justify-center gap-3 uppercase"><Skull className="w-12 h-12" /> The Black Secret</h3>
            <p className="text-4xl italic font-serif leading-relaxed text-red-200 font-black">"{village.darkSecret}"</p>
            <div className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-[1em] opacity-30">Eyes Only</div>
          </section>

          {/* PAGE 9: Master Resident Dossiers */}
          <section className="parchment p-12 page-break-before">
            <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-12 pb-4 text-black flex items-center gap-4 uppercase"><UserCircle size={36} /> Master Resident Dossiers</h3>
            <div className="space-y-20">
              {village.residents.map((npc, idx) => {
                const standing = getStandingCategory(npc);
                return (
                  <div key={idx} className="p-8 border-4 border-stone-800 bg-white/50 rounded shadow-2xl relative break-inside-avoid">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="relative w-full aspect-square bg-stone-900/10 mb-6 border-2 border-stone-800 overflow-hidden group/port">
                          {npc.portraitUrl ? <img src={npc.portraitUrl} className="w-full h-full object-cover" /> : <UserCircle size={100} className="opacity-10" />}
                          <button onClick={() => handleGeneratePortrait(idx, npc)} className="absolute inset-0 bg-stone-900/80 opacity-0 group-hover/port:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-500 no-print font-bold"><Wand2 /> Manifest Portrait</button>
                          <button onClick={() => playVoice(idx, npc)} className="absolute bottom-2 right-2 p-2 bg-amber-600 text-white rounded-full no-print shadow-lg"><Volume2 size={16} /></button>
                        </div>
                        <h4 className="text-2xl font-bold medieval-font text-black uppercase mb-1">{npc.name}</h4>
                        <p className="text-[10px] font-black text-stone-600 uppercase mb-4">{npc.sex} • {npc.race} • {npc.role}</p>
                        <div className="flex flex-col gap-2 w-full">
                          <div className={`text-[10px] font-black px-4 py-1.5 border-2 border-stone-800 rounded bg-white w-full flex items-center justify-center gap-2 ${standing.color}`}>{standing.icon} {standing.label}</div>
                          <div className="text-[10px] font-black px-4 py-1.5 border-2 border-stone-800 rounded bg-stone-100 text-stone-950 w-full flex items-center justify-center gap-2 uppercase tracking-widest"><Scale size={12}/> {npc.alignment}</div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-6">
                        <div><h5 className="text-[10px] font-black uppercase text-stone-500 mb-2">Psychological Profile</h5><p className="italic text-xl text-black font-black leading-relaxed border-l-4 border-stone-800 pl-4">"{npc.personality}"</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-stone-800 text-amber-500 rounded border-2 border-stone-900 shadow-sm font-black text-xs"><span className="block opacity-50 mb-1 uppercase text-[9px]">Motivation</span><Goal size={14} className="inline mr-2"/> {npc.motivation}</div>
                          <div className="p-4 bg-stone-800 text-amber-500 rounded border-2 border-stone-900 shadow-sm font-black text-xs"><span className="block opacity-50 mb-1 uppercase text-[9px]">Characteristic</span><Fingerprint size={14} className="inline mr-2"/> {npc.trait}</div>
                          <div className="p-4 bg-white/60 text-stone-950 rounded border-2 border-stone-800 shadow-sm font-black text-xs flex justify-around items-center"><div className="flex flex-col items-center"><Shield size={20}/><span>AC {npc.stats.ac}</span></div><div className="flex flex-col items-center"><Heart size={20}/><span>HP {npc.stats.hp}</span></div></div>
                          <div className="p-4 bg-red-100 text-red-950 rounded border-2 border-red-800 shadow-sm font-black text-xs"><span className="block opacity-70 mb-1 uppercase text-[9px]">Alignment Shadow Secret</span><Skull size={14} className="inline mr-2"/> {npc.secret}</div>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-black uppercase text-stone-500 mb-2">Social Matrix</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {npc.relationships.slice(0, 6).map((rel, r) => {
                              const s = getRelationshipStyles(rel.score);
                              return (<div key={r} className={`p-2 border-2 rounded ${s.bg} ${s.border} text-[9px] font-black`}><div className="flex justify-between"><span>{s.icon} {rel.targetName}</span><span>{rel.score}</span></div><p className="italic opacity-80 mt-1 truncate">"{rel.reason}"</p></div>);
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PAGE 10: Marketplace Ledger */}
          <section className="parchment p-12 page-break-before">
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-1 uppercase text-black flex items-center gap-2"><ShoppingBag /> Marketplace Ledger</h3>
            <div className="grid grid-cols-1 gap-8">
              {village.businesses.map((biz, b) => (
                <div key={b} className="break-inside-avoid p-6 bg-white/40 border-2 border-stone-800 rounded">
                  <div className="flex justify-between items-end border-b border-stone-800 pb-2 mb-4">
                    <h4 className="text-2xl font-bold medieval-font text-black">{biz.name}</h4>
                    <span className="text-[10px] font-black uppercase text-stone-600">Merchant: {biz.owner.name}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-4">
                    {biz.marketItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm border-b border-dashed border-stone-400 pb-1">
                        <div className="flex items-center gap-2 font-black text-black"><span>{item.name}</span><span className="text-[8px] bg-stone-200 px-1 rounded uppercase">{item.availability}</span></div>
                        <span className="font-black text-black medieval-font">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 11: Random Encounter Archives */}
          <section className="parchment p-12 page-break-before">
            <h3 className="text-3xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-4 text-black flex items-center gap-4 uppercase"><Compass size={36} /> Random Encounter Archives</h3>
            <div className="space-y-12">
              {[
                { title: "Day: Inside Walls", table: ENCOUNTERS_DAY_INSIDE, roll: lastDayInsideRoll, handler: () => setLastDayInsideRoll(Math.floor(Math.random()*20+1)), size: 20 },
                { title: "Night: Inside Walls", table: ENCOUNTERS_NIGHT_INSIDE, roll: null, handler: () => {}, size: 20 },
                { title: "Wandering Monsters: Outside Walls", table: ENCOUNTERS_MONSTERS, roll: lastMonsterRoll, handler: () => setLastMonsterRoll(Math.floor(Math.random()*100+1)), size: 100 }
              ].map((cat, ci) => (
                <div key={ci} className="break-inside-avoid">
                  <div className="flex justify-between items-center mb-4"><h4 className="text-xl font-bold medieval-font text-black uppercase">{cat.title}</h4><button onClick={cat.handler} className="no-print bg-stone-800 text-amber-500 px-3 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1"><Dices size={12}/> Roll 1d{cat.size}</button></div>
                  <div className="bg-white/50 border-2 border-stone-800 rounded overflow-hidden">
                    <table className="w-full text-left text-xs font-serif">
                      <thead className="bg-stone-800 text-amber-500 text-[10px] font-black uppercase"><tr><th className="py-2 px-3 w-12 text-center">d{cat.size}</th><th className="py-2 px-3 w-1/4">Encounter</th><th className="py-2 px-3">Situation</th></tr></thead>
                      <tbody className="divide-y divide-stone-300">
                        {cat.table.slice(0, cat.size === 100 ? 100 : 20).map((e, ei) => (
                          <tr key={ei} className={`hover:bg-amber-100/30 ${cat.roll === ei + 1 ? 'bg-amber-400 font-black' : ''}`}>
                            <td className="py-2 px-3 text-center border-r border-stone-300 font-black text-black text-lg">{(ei + 1).toString().padStart(2, '0')}</td>
                            <td className="py-2 px-3 font-black text-black flex items-center gap-2">{e.icon} {e.who}</td>
                            <td className="py-2 px-3 italic text-stone-950 font-black">{e.text}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 12: Campaign Chronicle */}
          <section className="parchment p-12 page-break-before no-print:hidden break-inside-avoid">
            <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-4 text-black uppercase"><BookOpen size={36} /> Campaign Chronicle</h3>
            <div className="p-10 bg-white/40 border-4 border-dashed border-stone-400 rounded-sm min-h-[500px]">
              <textarea className="w-full h-full min-h-[500px] bg-transparent border-none italic text-2xl font-serif text-black font-black leading-relaxed outline-none resize-none" placeholder="The chronicle of your deeds begins here..." value={editableNotes} onChange={e => setEditableNotes(e.target.value)} />
            </div>
          </section>
        </div>
      )}

      {loading && (<div className="fixed inset-0 bg-stone-900/95 z-50 flex items-center justify-center flex-col gap-6 p-12"><div className="relative"><Flame className="w-32 h-32 text-amber-500 animate-pulse" /><RefreshCw className="w-32 h-32 text-amber-600 animate-spin absolute top-0 left-0 opacity-20" /></div><h2 className="text-4xl medieval-font text-amber-500 text-center uppercase tracking-widest">Drafting the Dossier...</h2><p className="text-stone-400 italic text-center max-w-md text-lg">Weaving alliances, stocking the market, and unearthing deep-seated grudges across the Shadowdark.</p></div>)}
    </div>
  );
};

// --- Helpers ---
const getStandingCategory = (npc: DetailedNPC) => {
  const avg = npc.relationships.reduce((a, r) => a + r.score, 0) / (npc.relationships.length || 1);
  if (avg <= 4.0) return { label: 'Pariah', color: 'text-red-950', icon: <Frown size={12} className="text-red-900" /> };
  if (avg >= 7.0) return { label: 'Pillar', color: 'text-amber-950', icon: <Crown size={12} className="text-amber-700" /> };
  return { label: 'Resident', color: 'text-stone-950', icon: <Users size={12} className="text-stone-800" /> };
};

const getRelationshipStyles = (score: number) => {
  if (score >= 8) return { bg: 'bg-emerald-100', border: 'border-emerald-700', text: 'text-emerald-950', icon: <Heart size={14} className="text-emerald-800" /> };
  if (score <= 4) return { bg: 'bg-rose-100', border: 'border-rose-700', text: 'text-rose-950', icon: <Swords size={14} className="text-rose-800" /> };
  return { bg: 'bg-stone-100', border: 'border-stone-500', text: 'text-stone-950', icon: <Minus size={14} className="text-stone-700" /> };
};

export default App;
