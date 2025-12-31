import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  generateVillageDetails, 
  generateNPCPortrait, 
  generateVillageMap, 
  generateMerchantVoice,
  generateVillageGossip,
  generatePOI
} from './services/geminiService';
import { VillageData, DetailedNPC, Relationship, PointOfInterest, Business, SettlementRelation, Festival } from './types';
import { 
  Scroll, RefreshCw, Users, Flame, Waves, Store, Printer, Skull, ArrowRight, UserCircle,
  EyeOff, MessageSquareQuote, BookOpen, Pencil, MapPin, Heart, Swords, Minus, Package,
  ShoppingBag, Sparkles, Search, Fingerprint, Edit2, Check, X, CloudFog, Wind, Wand2,
  Map as MapIcon, Compass, FileText, Shield, Activity, Sword, Axe, Zap, Castle, Crown,
  Frown, Meh, Volume2, Coins, Tag, Newspaper, BarChart3, Info, Scale, CircleDot, Ghost,
  User as UserIcon, Mountain, Ghost as GhostIcon, Binoculars, AlertCircle,
  Briefcase, FileDigit, Dices, CloudRain, Sun, ThermometerSnowflake, HeartCrack, Goal,
  ZapOff, Calendar, MapPinned, Moon, SunMedium, UserSearch, Tent, Ghost as MonsterIcon,
  HandHelping, MessageCircle, Save, FolderOpen, Download, Settings2, Plus, Trash2,
  Bug, Zap as Spark, Target, Footprints, Droplets, Bone, Wind as Gust, Globe,
  CalendarDays, Sprout, Leaf, Snowflake, Star, Boxes, Landmark
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// --- Constants: 1d100 Tables (Low to Mid Level) ---

const ENCOUNTERS_DAY_INSIDE = [
  { icon: <UserSearch size={16} />, who: "Pickpocket", attitude: "Hostile", text: "A nimble-fingered youth attempts to lift a pouch from a PC's belt." },
  { icon: <MessageSquareQuote size={16} />, who: "Street Preacher", attitude: "Bizarre", text: "A wild-eyed man screams about the 'Great Shadow' coming to consume the sun." },
  { icon: <Activity size={16} />, who: "Stray Hound", attitude: "Friendly", text: "A scrawny, mangy dog follows the party, hoping for a scrap of dried meat." },
  { icon: <ShoppingBag size={16} />, who: "Suspicious Merchant", attitude: "Neutral", text: "A hooded figure offers 'genuine' elven silk at a price too good to be true." },
  { icon: <Shield size={16} />, who: "Guard Patrol", attitude: "Wary", text: "Two guards in rusted chainmail demand to know the party's business in this quarter." },
  { icon: <Users size={16} />, who: "Orphan Beggar", attitude: "Fearful", text: "A grime-covered child asks for a single copper piece to buy a crust of bread." },
  { icon: <Swords size={16} />, who: "Drunken Brawl", attitude: "Hostile", text: "Two laborers spill out of a tavern, swinging heavy clubs at anyone nearby." },
  { icon: <Activity size={16} />, who: "Runaway Cart", attitude: "Neutral", text: "A panicked mule pulls a cart of cabbages through the street; make a DEX save!" },
  { icon: <Wand2 size={16} />, who: "Hedge Witch", attitude: "Bizarre", text: "An old woman offers to read the party's fortune in a bowl of brackish water." },
  { icon: <Package size={16} />, who: "Mysterious Package", attitude: "Neutral", text: "A small, ticking box is left on a doorstep just as the party passes." },
  { icon: <CloudRain size={16} />, who: "Sudden Deluge", attitude: "Neutral", text: "The sky opens up, drenching the street and reducing visibility to a few paces." },
  { icon: <Meh size={16} />, who: "Town Drunk", attitude: "Neutral", text: "A man smelling of sour ale stumbles into a PC, muttering apologies." },
  { icon: <MessageCircle size={16} />, who: "Gossiping Elders", attitude: "Neutral", text: "Three old men on a bench stop talking and stare intently at the party." },
  { icon: <Skull size={16} />, who: "Public Stocks", attitude: "Neutral", text: "A local criminal is being pelted with rotten fruit; they beg the PCs for water." },
  { icon: <Tag size={16} />, who: "Snake Oil Vendor", attitude: "Friendly", text: "A charismatic woman sells 'Troll Blood' tonic that is just dyed vinegar." },
  { icon: <Crown size={16} />, who: "Minor Noble", attitude: "Neutral", text: "A local official passes by in a sedan chair, escorted by four surly guards." },
  { icon: <GhostIcon size={16} />, who: "Black Cat", attitude: "Bizarre", text: "A cat with one white paw crosses the path and hisses at the party's shadows." },
  { icon: <Flame size={16} />, who: "Chimney Fire", attitude: "Neutral", text: "Smoke billows from a nearby roof; residents scramble with buckets of sand." },
  { icon: <Activity size={16} />, who: "Rat Swarm", attitude: "Hostile", text: "A dozen rats surge from a sewer grate, biting at the party's boots." },
  { icon: <Newspaper size={16} />, who: "Local Messenger", attitude: "Friendly", text: "A boy runs past, shouting about the latest 'Current Event' in the village." }
];

const ENCOUNTERS_NIGHT_INSIDE = [
  { icon: <UserSearch size={16} />, who: "Roof Stalker", attitude: "Hostile", text: "A silhouette is seen leaping between rooftops, watching the party." },
  { icon: <Ghost size={16} />, who: "Muffled Scream", attitude: "Wary", text: "A cry for help echoes from a narrow, unlit alleyway." },
  { icon: <Users size={16} />, who: "Hooded Cultists", attitude: "Hostile", text: "Six figures in gray robes carry a heavy, blood-stained sack." },
  { icon: <ZapOff size={16} />, who: "Sleeping Sentry", attitude: "Neutral", text: "A guard is fast asleep against a crate, their torch long extinguished." },
  { icon: <Activity size={16} />, who: "Giant Rat", attitude: "Hostile", text: "A massive rat with glowing red eyes gnaws on a discarded bone." },
  { icon: <Wind size={16} />, who: "Slamming Shutter", attitude: "Bizarre", text: "A window shutter slams shut violently as the party passes beneath it." },
  { icon: <MonsterIcon size={16} />, who: "Distant Howl", attitude: "Hostile", text: "A howl that sounds far too large for a dog echoes through the empty streets." },
  { icon: <Spark size={16} />, who: "Green Light", attitude: "Bizarre", text: "A sickly green glow flickers through the cracks of a cellar door." },
  { icon: <ThermometerSnowflake size={16} />, who: "Shivering Beggar", attitude: "Fearful", text: "A man huddles in a doorway, his breath visible in the freezing night air." },
  { icon: <MessageCircle size={16} />, who: "Secret Meeting", attitude: "Wary", text: "Two figures whisper urgently behind a rain barrel; they bolt if seen." },
  { icon: <CloudFog size={16} />, who: "Choking Fog", attitude: "Neutral", text: "A thick, yellow fog rolls in, smelling of sulfur and damp earth." },
  { icon: <GhostIcon size={16} />, who: "Spectral Child", attitude: "Bizarre", text: "A translucent girl chases a ghostly ball across the road and vanishes." },
  { icon: <Flame size={16} />, who: "Night Watch", attitude: "Wary", text: "A patrol of four guards with lanterns demands the party's 'night pass'." },
  { icon: <Fingerprint size={16} />, who: "Lock-picker", attitude: "Hostile", text: "A thief is caught red-handed trying to jemmy open a shop door." },
  { icon: <Activity size={16} />, who: "Scratching Wall", attitude: "Bizarre", text: "The sound of frantic scratching comes from inside a seemingly empty house." },
  { icon: <Gust size={16} />, who: "Foul Wind", attitude: "Neutral", text: "A sudden blast of cold air carries the unmistakable stench of the grave." },
  { icon: <EyeOff size={16} />, who: "Glowing Eyes", attitude: "Bizarre", text: "Multiple pairs of reflective eyes watch the party from a dark stable." },
  { icon: <Meh size={16} />, who: "Lost Reveler", attitude: "Neutral", text: "A nobleman's son, far too drunk, is wandering the wrong part of town." },
  { icon: <Castle size={16} />, who: "Phantom Door", attitude: "Bizarre", text: "A door painted blood-red appears on a wall that was bare yesterday." },
  { icon: <Ghost size={16} />, who: "Moving Shadow", attitude: "Hostile", text: "A PC's shadow seems to lag behind their movements for a few seconds." }
];

const ENCOUNTERS_MONSTERS = [
  { icon: <MonsterIcon size={16} />, who: "Giant Centipede", attitude: "Hostile", text: "A segmented horror with venomous pincers lunges from a sewer grate." },
  { icon: <GhostIcon size={16} />, who: "Shadow", attitude: "Hostile", text: "A patch of darkness detaches from a wall and reaches for your throat." },
  { icon: <Skull size={16} />, who: "Ghoul", attitude: "Hostile", text: "A rubbery-skinned undead with long claws tries to drag you into an alley." },
  { icon: <Activity size={16} />, who: "Giant Rat", attitude: "Neutral", text: "A dog-sized rodent gnaws on a discarded boot." },
  { icon: <Bug size={16} />, who: "Swarm of Beetles", attitude: "Hostile", text: "Thousands of clicking insects boil out of the ground." },
  { icon: <Droplets size={16} />, who: "Gray Ooze", attitude: "Hostile", text: "A puddle of acidic slime moves toward metal armor." },
  { icon: <Bone size={16} />, who: "Skeleton", attitude: "Hostile", text: "A rattling pile of bones rises and draws a rusted shortsword." },
  { icon: <Bug size={16} />, who: "Giant Spider", attitude: "Hostile", text: "A web drops from above, followed by a bloated predator." },
  { icon: <Skull size={16} />, who: "Zombie", attitude: "Hostile", text: "A bloated, water-logged corpse lurches toward the party." },
  { icon: <Axe size={16} />, who: "Owlbear Cub", attitude: "Wary", text: "A beaked beast-ling growls; the mother is nearby." },
  { icon: <MonsterIcon size={16} />, who: "Harpy", attitude: "Hostile", text: "A screeching humanoid with bird-wings dives from above." },
  { icon: <MonsterIcon size={16} />, who: "Cockatrice", attitude: "Hostile", text: "A lizard-like bird attempts to peck at exposed skin." },
  { icon: <Bug size={16} />, who: "Rust Monster", attitude: "Neutral", text: "A creature sniffs at metal gear. It just wants to eat the iron." },
  { icon: <Waves size={16} />, who: "River Ghoul", attitude: "Hostile", text: "A water-logged undead climbs out of the river, croaking." },
  { icon: <Skull size={16} />, who: "Wight", attitude: "Hostile", text: "A gaunt undead in rotted mail raises a life-draining blade." },
  { icon: <Axe size={16} />, who: "Bugbear", attitude: "Hostile", text: "A hairy brute steps from the gloom with a heavy mace." },
  { icon: <Target size={16} />, who: "Goblin Sniper", attitude: "Hostile", text: "A green figure aims a blowgun from the shadows." },
  { icon: <Users size={16} />, who: "Orc Warband", attitude: "Hostile", text: "1d6 gray-skinned warriors surround the group." },
  { icon: <Activity size={16} />, who: "Stirges", attitude: "Hostile", text: "1d6 mosquito-like birds dive to drain blood." },
  { icon: <Axe size={16} />, who: "Ogre", attitude: "Hostile", text: "A lumbering brute is chewing on a raw horse leg." },
  { icon: <Activity size={16} />, who: "Basilisk", attitude: "Hostile", text: "An eight-legged lizard with a stony gaze crawls into the light." },
  { icon: <Axe size={16} />, who: "Minotaur", attitude: "Hostile", text: "A bull-headed giant huffs steam in the alleyway." },
  { icon: <GhostIcon size={16} />, who: "Blink Dog", attitude: "Neutral", text: "A hound flickers in and out, barking at an unseen threat." },
  { icon: <Target size={16} />, who: "Werewolf", attitude: "Hostile", text: "A half-man, half-wolf predator leaps from a thatched roof." },
  { icon: <Activity size={16} />, who: "Giant Snake", attitude: "Hostile", text: "A twenty-foot constrictor drops from a rafter." },
  { icon: <Target size={16} />, who: "Hill Giant", attitude: "Wary", text: "A hungry giant is searching for livestock (or small people)." },
  { icon: <Activity size={16} />, who: "Dire Wolf", attitude: "Hostile", text: "A massive predator snarling in the dark." },
  { icon: <Users size={16} />, who: "Bandit Patrol", attitude: "Hostile", text: "A group of 1d6 deserters looking for easy gold." },
  { icon: <Bug size={16} />, who: "Giant Toad", attitude: "Neutral", text: "A massive amphibian watching for something to swallow whole." },
  { icon: <Activity size={16} />, who: "Brown Bear", attitude: "Wary", text: "A powerful beast protecting its territory near a landmark." },
].concat(Array(70).fill({ icon: <GhostIcon size={16} />, who: "Gloom Stalker", attitude: "Hostile", text: "A generic dark predator tracks the party from the periphery." }));

// --- Decoding Helpers ---
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
  const [error, setError] = useState<string | null>(null);
  const [editableNotes, setEditableNotes] = useState("");
  const [npcFilter, setNpcFilter] = useState("");
  const [portraitLoading, setPortraitLoading] = useState<Record<number, boolean>>({});
  const [voiceLoading, setVoiceLoading] = useState<Record<number, boolean>>({});
  
  const [lastDayInsideRoll, setLastDayInsideRoll] = useState<number | null>(null);
  const [lastMonsterRoll, setLastMonsterRoll] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demographics Calculation Logic
  const calculateDemographics = (total: number) => {
    const humans = Math.floor(total * 0.85);
    const halflings = Math.floor(total * 0.08);
    const dwarves = Math.floor(total * 0.04);
    const elves = Math.floor(total * 0.02);
    const remaining = total - (humans + halflings + dwarves + elves);
    return {
      humans,
      halflings,
      dwarves,
      elves,
      others: remaining > 0 ? [{ race: 'Half-Orc', count: remaining }] : []
    };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const pop = Math.floor(Math.random() * 100 + 200);
      const demo = calculateDemographics(pop);
      const data = await generateVillageDetails("Cinderglade", pop, demo);
      setVillage(data);
      setEditableNotes(data.gmNotes || "");
    } catch (err) {
      setError("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!village) return;
    const blob = new Blob([JSON.stringify(village, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${village.name}_dossier.json`;
    a.click();
  };

  const handleGeneratePOI = async () => {
    if (!village) return;
    setPoiLoading(true);
    try {
      const poiData = await generatePOI(village);
      setVillage({ ...village, poi: poiData });
    } catch (err) { console.error(err); } finally { setPoiLoading(false); }
  };

  const handleGeneratePortrait = async (idx: number, npc: DetailedNPC) => {
    if (!village) return;
    setPortraitLoading(prev => ({ ...prev, [idx]: true }));
    try {
      const url = await generateNPCPortrait(npc);
      const updated = [...village.residents];
      updated[idx] = { ...updated[idx], portraitUrl: url };
      setVillage({ ...village, residents: updated });
    } catch (err) { console.error(err); } finally { setPortraitLoading(prev => ({ ...prev, [idx]: false })); }
  };

  const playVoice = async (idx: number, npc: DetailedNPC) => {
    if (voiceLoading[idx]) return;
    setVoiceLoading(prev => ({ ...prev, [idx]: true }));
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const ctx = audioContextRef.current;
      const base64 = await generateMerchantVoice(npc);
      const audioData = decodeBase64(base64);
      const buffer = await decodeAudioData(audioData, ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (err) { console.error(err); } finally { setVoiceLoading(prev => ({ ...prev, [idx]: false })); }
  };

  const getStandingCategory = (npc: DetailedNPC) => {
    const total = npc.relationships.reduce((acc, r) => acc + r.score, 0);
    const avg = total / (npc.relationships.length || 1);
    // 1-10 Scale Logic (Refined for varied results)
    if (avg <= 4.0) return { label: 'Pariah', color: 'text-red-950 font-black', icon: <Frown size={12} className="text-red-900" /> };
    if (avg >= 7.0) return { label: 'Pillar', color: 'text-amber-950 font-black', icon: <Crown size={12} className="text-amber-700" /> };
    return { label: 'Resident', color: 'text-stone-950 font-black', icon: <Users size={12} className="text-stone-800" /> };
  };

  const getRelationshipStyles = (score: number) => {
    if (score >= 8) return { bg: 'bg-emerald-100', border: 'border-emerald-700', text: 'text-emerald-950 font-black', icon: <Heart size={14} className="text-emerald-800" /> };
    if (score <= 4) return { bg: 'bg-rose-100', border: 'border-rose-700', text: 'text-rose-950 font-black', icon: <Swords size={14} className="text-rose-800" /> };
    return { bg: 'bg-stone-100', border: 'border-stone-500', text: 'text-stone-950 font-black', icon: <Minus size={14} className="text-stone-700" /> };
  };

  const getSeasonIcon = (season: string) => {
    switch(season) {
      case 'Spring': return <Sprout className="text-emerald-700" size={18} />;
      case 'Summer': return <Sun className="text-amber-700" size={18} />;
      case 'Fall': return <Leaf className="text-orange-800" size={18} />;
      case 'Winter': return <Snowflake className="text-blue-700" size={18} />;
      default: return <Star className="text-purple-700" size={18} />;
    }
  };

  const handleGenerateMap = async () => {
    if (!village) return;
    setMapLoading(true);
    try {
      const url = await generateVillageMap(village);
      setVillage({ ...village, mapUrl: url });
    } catch (err) { console.error(err); } finally { setMapLoading(false); }
  };

  const chartData = useMemo(() => {
    if (!village || !village.demographics) return [];
    const base = [
      { name: 'Humans', value: village.demographics.humans, color: '#1a1a1a' },
      { name: 'Halflings', value: village.demographics.halflings, color: '#44403c' },
      { name: 'Dwarves', value: village.demographics.dwarves, color: '#78716c' },
      { name: 'Elves', value: village.demographics.elves, color: '#a8a29e' },
      ...(village.demographics.others || []).map((o, idx) => ({ name: o.race, value: o.count, color: idx % 2 === 0 ? '#7f1d1d' : '#450a0a' }))
    ];
    return base.filter(d => d.value > 0);
  }, [village]);

  const totalPop = village?.population || 1;

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
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={handleSave} disabled={!village} className="bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-amber-500 font-bold py-3 px-5 rounded-lg shadow-xl transition-all border border-amber-900/50"><Save size={18} /> Save</button>
          <button onClick={() => window.print()} className="bg-stone-800 hover:bg-stone-700 text-amber-500 font-bold py-3 px-5 rounded-lg shadow-xl transition-all border border-amber-900/50"><Printer size={18} /> Print</button>
          <button onClick={handleGenerate} disabled={loading} className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg shadow-xl transition-all flex items-center gap-2 text-base medieval-font">{loading ? <RefreshCw className="animate-spin" /> : <Scroll />} Manifest Village</button>
        </div>
      </div>

      {village && (
        <div className="w-full max-w-4xl flex flex-col gap-8 relative">
          <div className="parchment p-8 md:p-12 rounded-sm shadow-2xl border-2 border-stone-400/30 relative overflow-visible h-auto">
            {/* Header Manifest */}
            <section className="print:print-page-border">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none no-print"><Skull className="w-96 h-96" /></div>
              <div className="border-b-4 border-double border-stone-800 pb-6 mb-12 text-center">
                <h2 className="text-7xl font-bold medieval-font mb-2 uppercase tracking-tighter text-black">{village.name}</h2>
                <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-stone-700"><span>Village Dossier</span><div className="w-2 h-2 rounded-full bg-stone-800"></div><span>Shadowdark RPG</span></div>
              </div>
              
              {/* Atmospheric Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-4 bg-white/30 border-2 border-stone-800 rounded">
                  <h3 className="text-xs font-black uppercase text-stone-600 mb-2 flex items-center gap-1"><CloudRain size={14} /> Current Climate</h3>
                  <p className="text-lg font-bold text-black italic font-black">"{village.weather}"</p>
                </div>
                <div className="p-4 bg-white/30 border-2 border-stone-800 rounded">
                  <h3 className="text-xs font-black uppercase text-stone-600 mb-2 flex items-center gap-1"><Wind size={14} /> Local Atmosphere</h3>
                  <p className="text-lg font-bold text-black italic font-black">"{village.atmosphere}"</p>
                </div>
                <div className="p-4 bg-white/30 border-2 border-stone-800 rounded">
                  <h3 className="text-xs font-black uppercase text-stone-600 mb-2 flex items-center gap-1"><MapPin size={14} /> Geography</h3>
                  <p className="text-lg font-bold text-black italic font-black">"{village.geography}"</p>
                </div>
              </div>

              <div className="mb-12 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 pb-1 uppercase text-black"><Scroll className="w-6 h-6" /> Narrative Manifest</div>
                  <p className="text-2xl italic font-serif leading-relaxed text-black bg-white/40 p-8 border-l-8 border-stone-800 rounded-r shadow-inner font-black">"{village.description}"</p>
                </div>
                <div className="w-full md:w-72 shrink-0 break-inside-avoid">
                  <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b border-stone-800 mb-4 pb-1 text-black"><Users size={20} /> Census</h3>
                  <div className="h-72 w-full bg-white/20 p-2 rounded-lg border border-stone-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={chartData} 
                          innerRadius={45} 
                          outerRadius={65} 
                          paddingAngle={3} 
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fef3c7', border: '1px solid #1a1a1a', borderRadius: '4px' }}
                          itemStyle={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                        />
                        <Legend 
                          layout="vertical" 
                          align="right" 
                          verticalAlign="middle" 
                          iconType="square"
                          formatter={(value, entry: any) => {
                            const item = entry.payload;
                            const percent = ((item.value / totalPop) * 100).toFixed(0);
                            return <span className="text-[10px] font-black text-stone-950 uppercase leading-none">{value}: {item.value} ({percent}%)</span>;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>

            {/* Local Traditions & Relations */}
            <section className="page-break-before">
              <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase text-black flex items-center gap-2"><CalendarDays /> Cycle of Tradition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {village.festivals.map((fest, idx) => (
                  <div key={idx} className="p-4 bg-white/40 border-2 border-stone-400 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-black uppercase medieval-font text-lg">{fest.name}</span>
                      {getSeasonIcon(fest.season)}
                    </div>
                    <span className="text-[10px] font-black uppercase text-stone-600">{fest.timing} of {fest.season}</span>
                    <p className="text-xs italic font-black text-stone-950 mt-2">"{fest.lore}"</p>
                    <p className="text-[10px] text-stone-900 mt-1 font-bold">Practice: {fest.modernPractice}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase text-black flex items-center gap-2"><Globe /> Nearby Settlement Relations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {village.settlementRelations.map((rel, idx) => (
                  <div key={idx} className="p-4 bg-white/40 border-2 border-stone-800 rounded">
                    <h4 className="font-bold text-black medieval-font">{rel.settlementName}</h4>
                    <div className="text-[10px] font-black bg-stone-800 text-white px-2 py-0.5 rounded inline-block my-1 uppercase">{rel.type} - {rel.status}</div>
                    <p className="text-xs italic text-black font-black">"{rel.description}"</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Encounter Archives */}
            <section className="page-break-before">
              <h3 className="text-3xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-4 text-black flex items-center gap-4 uppercase"><Compass size={36} /> Random Encounter Archives</h3>
              <div className="space-y-12">
                {[
                  { title: "Day: Inside Walls", table: ENCOUNTERS_DAY_INSIDE, roll: lastDayInsideRoll, size: 20 },
                  { title: "Wandering Monsters (Outside)", table: ENCOUNTERS_MONSTERS, roll: lastMonsterRoll, size: 100 }
                ].map((category, cIdx) => (
                  <div key={cIdx} className="break-inside-avoid">
                    <h4 className="text-xl font-bold medieval-font text-black mb-4 uppercase">{category.title}</h4>
                    <div className="bg-white/50 border-2 border-stone-800 rounded overflow-hidden">
                      <table className="w-full text-left text-sm font-serif">
                        <thead className="bg-stone-800 text-amber-500 text-[10px] font-black">
                          <tr>
                            <th className="py-2 px-3 w-12 text-center">d{category.size}</th>
                            <th className="py-2 px-3 w-1/4">Encounter</th>
                            <th className="py-2 px-3">Situation Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-300">
                          {category.table.slice(0, 20).map((enc, eIdx) => (
                            <tr key={eIdx} className="hover:bg-amber-100/30">
                              <td className="py-2 px-3 text-center border-r border-stone-300 font-black text-black text-lg">{(eIdx + 1).toString().padStart(2, '0')}</td>
                              <td className="py-2 px-3 font-black text-black flex items-center gap-2">{enc.icon} {enc.who}</td>
                              <td className="py-2 px-3 italic text-stone-950 font-black">{enc.text}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Master Resident Dossiers */}
            <section className="page-break-before">
              <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-12 pb-4 text-black flex items-center gap-4 uppercase"><UserCircle size={36} /> Master Resident Dossiers</h3>
              <div className="space-y-16">
                {village.residents.map((npc, idx) => {
                  const standing = getStandingCategory(npc);
                  return (
                    <div key={idx} className="p-10 border-4 border-stone-800 bg-white/50 rounded-sm shadow-2xl relative break-inside-avoid">
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="w-full md:w-1/3 flex flex-col items-center">
                          <div className="relative w-full aspect-square bg-stone-900/10 mb-6 border-2 border-stone-800 overflow-hidden group/port">
                            {npc.portraitUrl ? <img src={npc.portraitUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><UserCircle size={100} /></div>}
                            <button onClick={() => handleGeneratePortrait(idx, npc)} className="absolute inset-0 bg-stone-900/80 opacity-0 group-hover/port:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-500 no-print font-bold"><Wand2 /> Manifest Portrait</button>
                            <button onClick={() => playVoice(idx, npc)} className="absolute bottom-2 right-2 p-2 bg-amber-600 text-white rounded-full no-print shadow-lg"><Volume2 size={16} /></button>
                          </div>
                          <h4 className="text-3xl font-bold medieval-font text-black uppercase text-center leading-none mb-1">{npc.name}</h4>
                          <p className="text-[10px] font-black text-stone-700 uppercase mb-4">{npc.sex} • {npc.race} • {npc.role}</p>
                          <div className={`text-xs font-black px-4 py-2 border-2 border-stone-800 rounded bg-white w-full flex items-center justify-center gap-2 ${standing.color}`}>{standing.icon} {standing.label}</div>
                        </div>
                        <div className="flex-1 space-y-8">
                          <div>
                            <h5 className="text-[10px] font-black uppercase text-stone-600 mb-2 tracking-widest">Psychological Profile</h5>
                            <p className="italic text-xl text-black font-black leading-relaxed border-l-4 border-stone-800 pl-4">"{npc.personality}"</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-stone-800 text-amber-500 rounded border-2 border-stone-900 shadow-sm font-black"><span className="text-[10px] font-black block uppercase mb-1 opacity-50">Motivation</span>{npc.motivation}</div>
                            <div className="p-4 bg-white/60 text-stone-950 rounded border-2 border-stone-800 shadow-sm font-black"><span className="text-[10px] font-black block uppercase mb-1 opacity-50">AC / HP</span>{npc.stats.ac} / {npc.stats.hp}</div>
                          </div>
                          <div>
                            <h5 className="text-[10px] font-black uppercase text-stone-600 mb-2 tracking-widest">Social Influence Matrix</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {npc.relationships.slice(0, 8).map((rel, ridx) => {
                                const styles = getRelationshipStyles(rel.score);
                                return (
                                  <div key={ridx} className={`p-2 border-2 rounded ${styles.bg} ${styles.border} flex flex-col gap-1 shadow-sm`}>
                                    <div className="flex justify-between items-center text-[10px] font-black">
                                      <span className="flex items-center gap-1 text-black truncate">{styles.icon} {rel.targetName}</span>
                                      <span className={styles.text}>{rel.score} • {rel.feeling}</span>
                                    </div>
                                    <p className="text-[10px] italic font-black text-stone-950 truncate">"{rel.reason}"</p>
                                  </div>
                                );
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

            {/* Marketplace Ledger */}
            <section className="page-break-before">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-1 uppercase text-black flex items-center gap-2"><ShoppingBag /> Marketplace Ledger</h3>
              <div className="grid grid-cols-1 gap-6">
                {village.businesses.map((biz, bidx) => (
                  <div key={bidx} className="break-inside-avoid p-6 bg-white/40 border-2 border-stone-800 rounded">
                    <div className="flex justify-between items-end border-b border-stone-800 pb-2 mb-4">
                      <h4 className="text-2xl font-bold medieval-font text-black">{biz.name}</h4>
                      <span className="text-[10px] font-black uppercase text-stone-600">Merchant: {biz.owner.name}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-4">
                      {biz.marketItems.map((item, iidx) => (
                        <div key={iidx} className="flex justify-between items-center text-sm border-b border-dashed border-stone-400 pb-1">
                          <div className="flex items-center gap-1">
                            <span className="font-black text-black">{item.name}</span>
                            <span className="text-[9px] font-bold text-stone-700 bg-stone-200 px-1 rounded">{item.availability}</span>
                          </div>
                          <span className="font-black text-black medieval-font">{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-amber-100/50 rounded border-l-4 border-amber-800 shadow-inner">
                       <p className="text-[10px] font-black text-amber-900 uppercase mb-1">Local Rumor</p>
                       <p className="text-sm italic text-amber-950 font-black">"{biz.rumor}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Nearby Crawl in a Box */}
            <section className="page-break-before">
              <div className="flex justify-between items-center border-b-4 border-stone-800 mb-8 pb-4">
                <h3 className="text-3xl font-bold medieval-font text-black flex items-center gap-2 uppercase"><Boxes /> Nearby Crawl in a Box</h3>
                <button onClick={handleGeneratePOI} className="bg-stone-800 text-amber-500 px-4 py-2 rounded no-print font-bold hover:bg-stone-700 text-xs uppercase">{poiLoading ? 'Digging...' : village.poi ? 'Regenerate Crawl' : 'Draft Crawl'}</button>
              </div>
              {village.poi && (
                <div className="space-y-8">
                  <div className="p-6 bg-stone-900 text-stone-200 border-4 border-stone-700 rounded shadow-2xl">
                    <h4 className="text-3xl font-bold medieval-font text-amber-500 mb-2 uppercase">{village.poi.title}</h4>
                    <div className="text-xs font-black text-stone-500 uppercase mb-4 tracking-widest">{village.poi.type} • {village.poi.location}</div>
                    <p className="text-lg italic font-serif border-l-4 border-amber-600 pl-4 mb-8 text-stone-300 font-black">"{village.poi.background}"</p>
                    <div className="grid grid-cols-1 gap-6">
                      {village.poi.rooms.map((room, ridx) => (
                        <div key={ridx} className="p-5 border-2 border-stone-700 bg-stone-800/50 rounded shadow-inner">
                          <h5 className="text-lg font-bold text-amber-400 mb-2 uppercase medieval-font">Room {room.number}: {room.name}</h5>
                          <p className="text-sm italic mb-4 font-black text-stone-200">"{room.description}"</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-xs bg-red-900/40 p-3 rounded border border-red-900/50 text-red-100 font-bold"><span className="block uppercase opacity-70 text-[9px] mb-1 tracking-widest">Threats & Traps</span>{room.threats}</div>
                            <div className="text-xs bg-emerald-900/40 p-3 rounded border border-emerald-900/50 text-emerald-100 font-bold"><span className="block uppercase opacity-70 text-[9px] mb-1 tracking-widest">Treasure</span>{room.treasure}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* GM Eyes Only */}
            <section className="page-break-before bg-stone-950 text-red-500 p-12 border-8 border-double border-red-900 shadow-2xl relative">
              <h3 className="text-4xl font-bold medieval-font mb-6 flex items-center gap-3 border-none p-0 uppercase"><Skull className="w-12 h-12" /> The Black Secret</h3>
              <p className="text-3xl italic font-serif leading-relaxed text-red-200 font-black">"{village.darkSecret}"</p>
              <div className="absolute top-2 right-4 text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Eyes Only</div>
            </section>

            {/* Campaign Chronicle */}
            <section className="page-break-before no-print:hidden break-inside-avoid">
              <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-4 text-black uppercase"><BookOpen size={36} /> Campaign Chronicle</h3>
              <div className="p-10 bg-white/40 border-4 border-dashed border-stone-400 rounded-sm min-h-[400px]">
                <textarea className="w-full h-full min-h-[400px] bg-transparent border-none italic text-2xl font-serif text-black font-black leading-relaxed outline-none resize-none" placeholder="The chronicle of your deeds begins here..." value={editableNotes} onChange={(e) => setEditableNotes(e.target.value)} />
              </div>
            </section>
          </div>
        </div>
      )}

      {loading && (<div className="fixed inset-0 bg-stone-900/95 z-50 flex items-center justify-center flex-col gap-6 p-12"><div className="relative"><Flame className="w-32 h-32 text-amber-500 animate-pulse" /><RefreshCw className="w-32 h-32 text-amber-600 animate-spin absolute top-0 left-0 opacity-20" /></div><h2 className="text-4xl medieval-font text-amber-500 text-center uppercase tracking-widest">Drafting the Dossier...</h2><p className="text-stone-400 italic text-center max-w-md text-lg">Weaving alliances, stocking the market, and unearthing deep-seated grudges across the Shadowdark.</p></div>)}
    </div>
  );
};

export default App;