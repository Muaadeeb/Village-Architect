
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
  MessageSquare, Axe, Target, Map, ShieldAlert, ZapOff, Droplets, Bone, Package,
  Cloud, Wind, Thermometer, CloudLightning, SunMedium, CloudFog, Zap as Spark,
  Newspaper, Bug, Eye, Waves, Trees, Mountain
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// --- Unique Encounter Tables (Shadowdark Optimized) ---
const ENCOUNTERS_DAY_INSIDE = [
  { icon: <UserSearch size={16} />, who: "Pickpocket", text: "A nimble youth lifts a pouch from a PC." },
  { icon: <MessageSquare size={16} />, who: "Street Preacher", text: "A wild-eyed man screams of the 'Great Shadow'." },
  { icon: <Activity size={16} />, who: "Stray Hound", text: "A scrawny dog follows, hoping for meat." },
  { icon: <ShoppingBag size={16} />, who: "Suspicious Merchant", text: "Hooded figure offers elven silk suspiciously cheap." },
  { icon: <Shield size={16} />, who: "Guard Patrol", text: "Two guards in rusted chain demand the party's business." },
  { icon: <Users size={16} />, who: "Orphan Beggar", text: "A child asks for a copper piece for bread." },
  { icon: <Swords size={16} />, who: "Drunken Brawl", text: "Laborers spill out of a tavern, swinging clubs." },
  { icon: <Activity size={16} />, who: "Runaway Cart", text: "A panicked mule pulls a cart through the street." },
  { icon: <Wand2 size={16} />, who: "Hedge Witch", text: "Old woman offers to read fortune in brackish water." },
  { icon: <Package size={16} />, who: "Mysterious Package", text: "A ticking box is left on a doorstep." },
  { icon: <Droplets size={16} />, who: "Water Carrier", text: "Spills a bucket on the party's gear; checks for rust." },
  { icon: <Activity size={16} />, who: "Rat Swarm", text: "A surge of rodents crosses the street in broad daylight." },
  { icon: <Newspaper size={16} />, who: "Town Crier", text: "Shouts about a local execution scheduled for dusk." },
  { icon: <Skull size={16} />, who: "Plague Cart", text: "Bell ringing, a man calls for the residents to bring out their dead." },
  { icon: <Axe size={16} />, who: "Woodchopper", text: "Dragging a massive, gnarled log that seems to be bleeding." },
  { icon: <Landmark size={16} />, who: "Statue of Loss", text: "A stone figure that seems to have moved since the last glance." },
  { icon: <Crown size={16} />, who: "Tax Collector", text: "Demands a 'gate fee' from the party immediately." },
  { icon: <Ghost size={16} />, who: "Mourning Widow", text: "She clutches a PC's hand, mistaking them for her dead son." },
  { icon: <Heart size={16} />, who: "Charismatic Bard", text: "Singing a song that contains secret details of a PC's past." },
  { icon: <CloudRain size={16} />, who: "Sudden Deluge", text: "The sky opens; visibility drops to five feet." }
];

const ENCOUNTERS_NIGHT_INSIDE = [
  { icon: <UserSearch size={16} />, who: "Roof Stalker", text: "A silhouette leaps between rooftops." },
  { icon: <Ghost size={16} />, who: "Muffled Scream", text: "A cry for help echoes from an alley." },
  { icon: <Users size={16} />, who: "Hooded Cultists", text: "Six figures carry a heavy, blood-stained sack." },
  { icon: <ZapOff size={16} />, who: "Sleeping Sentry", text: "A guard is fast asleep against a rain barrel." },
  { icon: <Activity size={16} />, who: "Giant Rat", text: "A massive rat with glowing eyes gnaws a bone." },
  { icon: <Moon size={16} />, who: "The Night Watch", text: "A patrol of four guards with lanterns demands a night pass." },
  { icon: <Fingerprint size={16} />, who: "Lock-picker", text: "A thief is caught jemmying open a shop door." },
  { icon: <Ghost size={16} />, who: "Spectral Child", text: "A translucent girl chases a ghostly ball and vanishes." },
  { icon: <Skull size={16} />, who: "Ghoul", text: "A rubbery undead stalks the dark corners." },
  { icon: <CloudRain size={16} />, who: "Choking Fog", text: "Thick yellow fog rolls in, smelling of sulfur." },
  { icon: <Zap size={16} />, who: "Will-o'-Wisp", text: "Lures the curious into a deep sewer grate." },
  { icon: <ShieldAlert size={16} />, who: "Panic Call", text: "A resident bolts from a house, screaming about a mimic." },
  { icon: <Wind size={16} />, who: "Howling Wind", text: "Blows out all non-magical torches for 1 round." },
  { icon: <Bone size={16} />, who: "Scavenger", text: "A hunched figure collecting teeth from the gutter." },
  { icon: <Target size={16} />, who: "Assassin", text: "Waits in a doorway, checking a poison-coated blade." },
  { icon: <Activity size={16} />, who: "Street Dog swarm", text: "Hungry curs surround the party, snarling." },
  { icon: <CloudFog size={16} />, who: "Grave Mist", text: "Cold vapor that slows movement by half." },
  { icon: <Frown size={16} />, who: "Lost Drunk", text: "Stumbles into the party, smelling of black bile." },
  { icon: <Spark size={16} />, who: "Eerie Glow", text: "A green light flickers behind a boarded-up window." },
  { icon: <Skull size={16} />, who: "The Reaper", text: "A tall, hooded figure that points a bony finger at a PC." }
];

const UNIQUE_MONSTERS = [
  "A patch of darkness detaches from a wall (Shadow).",
  "Rubbery-skinned undead dragging a limb (Ghoul).",
  "A massive rat with mangy fur and red eyes (Giant Rat).",
  "Lumbering brute chewing on a raw horse leg (Ogre).",
  "A half-man, half-wolf predator leaping from a roof (Werewolf).",
  "A puddle of acidic slime moving toward metal (Gray Ooze).",
  "Rattling bones rising from a pile of refuse (Skeleton).",
  "A bloated, water-logged corpse lurching forward (Zombie).",
  "A green figure aiming a blowgun from the gloom (Goblin).",
  "A hairy brute wielding a heavy, spiked mace (Bugbear).",
  "Ancient warrior with glowing blue life-draining eyes (Wight).",
  "A mosquito-bird hybrid diving for a neck (Stirge).",
  "A massive arachnid dropping from a sticky web (Giant Spider).",
  "A translucent horror that bypasses physical armor (Wraith).",
  "A rubbery-skinned giant with regenerative wounds (Troll).",
  "A beast firing iron-hard spikes from its tail (Manticore).",
  "An eight-legged lizard with a petrifying stare (Basilisk).",
  "A skeletal mage chanting words of necrotic rot (Lich Apprentice).",
  "A towering brute looking for a human snack (Hill Giant).",
  "A corrosive black mass that splits when struck (Black Pudding).",
  "A multi-headed serpent with acidic breath (Hydra).",
  "A winged lion with a human face and scorpion tail (Chimera).",
  "A floating eye with many smaller eyestalks (Beholder Kin).",
  "A massive, armored centipede with toxic venom (Giant Centipede).",
  "A creature disguised as a treasure chest (Mimic).",
  "A winged serpent that hums with static (Couatl).",
  "A heap of rotting vegetation that starts to move (Shambling Mound).",
  "A creature made of living flame (Fire Elemental).",
  "A spirit bound to a rusted suit of plate (Animated Armor).",
  "A massive bear with the head of an owl (Owlbear).",
  "A tiny, mischievous demon offering a dark bargain (Imp).",
  "A half-man, half-bull wielding a great axe (Minotaur).",
  "A floating skull wreathed in green fire (Flameskull).",
  "A beautiful woman with snakes for hair (Medusa).",
  "A giant scorpion with a stinger that glows purple.",
  "A swarm of tiny, blood-drinking bats.",
  "A creature made of wet clay and graveyard dirt (Golem).",
  "A headless rider on a phantom steed (Dullahan).",
  "A massive, burrowing worm with serrated teeth (Ankheg).",
  "A group of tiny, aggressive lizardfolk (Kobolds).",
  "A woman with the lower body of a spider (Drider).",
  "A massive eagle with a 30-foot wingspan (Giant Eagle).",
  "A creature that looks like a man but has no face (Doppelganger).",
  "A floating, brain-like entity with tentacles (Mind Flayer).",
  "A massive toad that can swallow a PC whole.",
  "A spirit that screams with the voices of a thousand dying men (Banshee).",
  "A group of small, stone-eating creatures (Xorn).",
  "A massive, multi-colored lizard with wings (Wyvern).",
  "A creature of pure shadow that drains strength.",
  "A giant constrictor snake hiding in the rafters.",
  "A rusted clockwork soldier clicking rhythmically.",
  "A group of cannibalistic primitives with bone spears.",
  "A massive crab with barnacles that look like eyes.",
  "A floating jellyfish that drifts through the air (Gas Spore).",
  "A creature made of hundreds of crawling insects.",
  "A man-sized moth with hypnotic wing patterns.",
  "A giant owl that watches silently from a dead tree.",
  "A group of feral, blue-skinned dwarfs (Dark Creepers).",
  "A massive elk with antlers made of obsidian.",
  "A creature that mimics the sound of a crying baby.",
  "A swarm of glowing beetles that burn to the touch.",
  "A massive, one-eyed giant throwing boulders (Cyclops).",
  "A spirit that possesses the party's own shadows.",
  "A creature made of animated, bloody chains.",
  "A giant, intelligent raven that speaks in riddles.",
  "A group of cultists wearing masks of human skin.",
  "A massive, burrowing mole with iron claws.",
  "A floating, translucent brain (Intellect Devourer).",
  "A creature that looks like a heap of golden coins.",
  "A giant bat with a sonar cry that deafens.",
  "A group of undead sailors dripping with seawater.",
  "A massive, white-furred ape (Yeti).",
  "A creature made of sharp, jagged glass shards.",
  "A giant wasp with a stinger the size of a dagger.",
  "A group of small, blue imps that steal light (Darkmantle).",
  "A massive, three-eyed toad with poisonous skin.",
  "A spirit bound to a mirror that shows a PC's death.",
  "A giant, multi-colored centipede that hums.",
  "A group of ghouls wearing rusted wedding finery.",
  "A massive, stone-skinned boar with iron tusks.",
  "A creature made of living, pulsing shadows.",
  "A giant dragonfly that can hover silently.",
  "A group of small, mechanical spiders.",
  "A massive, white worm that breathes frost.",
  "A spirit that looks like a PC's lost loved one.",
  "A giant, black-furred wolf with glowing yellow eyes.",
  "A group of skeletons playing rusted trumpets.",
  "A massive, armored beetle that spits acid.",
  "A creature made of hundreds of interlocking bones.",
  "A giant, blue-skinned humanoid with four arms.",
  "A spirit that drains the heat from the room.",
  "A giant, translucent slug that leaves a trail of salt.",
  "A group of tiny, flying demons with jagged teeth.",
  "A massive, winged gargoyle that looks like a statue.",
  "A creature that has no body, only a floating head.",
  "A giant, red-eyed salamander that drips lava.",
  "A spirit that makes a PC forget their own name.",
  "A giant, multi-legged lizard that climbs walls.",
  "A group of zombies carrying a heavy iron coffin.",
  "A massive, ancient shadow that swallows all light."
];

const ENCOUNTERS_MONSTERS = UNIQUE_MONSTERS.map((m, i) => ({
  icon: i % 3 === 0 ? <Skull size={16} /> : i % 3 === 1 ? <Ghost size={16} /> : <Activity size={16} />,
  who: m.split('(')[1]?.replace(')', '') || "Unknown Horror",
  text: m
}));

const WEATHER_SPRING = ["Gentle drizzle.", "Heavy mist.", "Violent storm.", "Warm breeze.", "Freezing rain.", "Clear sky.", "Day-long downpour.", "Gusty winds.", "Chilling fog.", "Brief hail.", "Heavy humidity.", "Cool overcast.", "Light snow.", "Dry thunder.", "Dust devils.", "Low clouds.", "Rattling wind.", "Soft sun.", "Bitter snap.", "Silent air."];
const WEATHER_SUMMER = ["Blistering heat.", "Dusty wind.", "Evening tempest.", "Sticky humidity.", "Heat haze.", "Refreshing shower.", "Static air.", "Drought breeze.", "Biting flies.", "Dust storm.", "River breeze.", "Blinding sun.", "Smoggy air.", "Midnight rain.", "Oppressive still.", "Earthquake thunder.", "Golden sunset.", "Cracking wind.", "Deluge.", "Unrelenting blue."];
const WEATHER_FALL = ["Cold drizzle.", "Autumn gale.", "Morning frost.", "Crisp sun.", "Sodden mist.", "Driving rain.", "Whirling leaves.", "Damp humidity.", "Sudden sleet.", "Grey overcast.", "Mountain wind.", "Ghostly fog.", "Cold rain.", "Dying warmth.", "Gusts.", "Low clouds.", "Harsh wind.", "Muted sun.", "Temp drop.", "Heavy air."];
const WEATHER_WINTER = ["Blizzard.", "Bone-chill cold.", "Silent snow.", "Frozen sleet.", "Grey sunless.", "Freezing fog.", "Arctic wind.", "Short light.", "Ice storm.", "Sub-zero.", "Cracking ice.", "Dark clouds.", "Biting wind.", "Heavy snow.", "Freezing rain.", "Leaden skies.", "Shatter frost.", "Icy mist.", "Powder snow.", "Knife wind."];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [poiLoading, setPoiLoading] = useState(false);
  const [village, setVillage] = useState<VillageData | null>(null);
  const [editableNotes, setEditableNotes] = useState("");
  const [manualDemo, setManualDemo] = useState({ h: 170, ha: 16, d: 8, e: 4, o: 2 });
  const [portraitLoading, setPortraitLoading] = useState<Record<number, boolean>>({});
  const [voiceLoading, setVoiceLoading] = useState<Record<number, boolean>>({});
  
  const [lastDayInsideRoll, setLastDayInsideRoll] = useState<number | null>(null);
  const [lastNightInsideRoll, setLastNightInsideRoll] = useState<number | null>(null);
  const [lastMonsterRoll, setLastMonsterRoll] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const pop = Math.floor(Math.random() * 100 + 200);
      const demo = { humans: Math.floor(pop*0.8), halflings: Math.floor(pop*0.1), dwarves: Math.floor(pop*0.05), elves: Math.floor(pop*0.03), others: [] };
      const data = await generateVillageDetails("Cinderglade", pop, demo);
      setVillage(data);
      setEditableNotes(data.gmNotes || "");
      setManualDemo({ h: data.demographics.humans, ha: data.demographics.halflings, d: data.demographics.dwarves, e: data.demographics.elves, o: 0 });
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

  const handleGenerateMap = async () => {
    if (!village) return;
    setLoading(true);
    try {
      const url = await generateVillageMap(village);
      setVillage({ ...village, mapUrl: url });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleGeneratePOI = async () => {
    if (!village) return;
    setPoiLoading(true);
    const poi = await generatePOI(village);
    setVillage({ ...village, poi });
    setPoiLoading(false);
  };

  const playVoice = async (idx: number, npc: DetailedNPC) => {
    setVoiceLoading(p => ({ ...p, [idx]: true }));
    const base64 = await generateMerchantVoice(npc);
    if (!base64) { setVoiceLoading(p => ({ ...p, [idx]: false })); return; }
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

  const PageNumber = ({ n }: { n: number }) => (
    <div className="absolute top-4 right-8 text-xs font-black uppercase tracking-[0.2em] opacity-30 medieval-font pointer-events-none no-print">
      Page {n}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between items-center p-8 no-print">
        <div>
          <h1 className="text-4xl font-bold medieval-font text-amber-500 flex items-center gap-3"><Flame /> Shadowdark Architect</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="bg-stone-800 text-amber-500 px-5 py-2 rounded-lg font-bold border border-amber-900/50 hover:bg-stone-700 transition-all"><Printer size={20} /></button>
          <button onClick={handleGenerate} className="bg-amber-600 text-white px-8 py-2 rounded-lg font-bold medieval-font text-xl shadow-xl hover:bg-amber-700 transition-all flex items-center gap-2">{loading ? <RefreshCw className="animate-spin" /> : <Scroll />} Manifest Village</button>
        </div>
      </div>

      {village && (
        <div className="w-full max-w-5xl flex flex-col items-center">
          
          {/* PAGE 1: Narrative Manifest, Morale and Census */}
          <section className="parchment p-12 relative w-full mb-0">
            <PageNumber n={1} />
            <div className="border-b-4 border-double border-stone-800 pb-6 mb-12 text-center">
              <h2 className="text-8xl font-bold medieval-font uppercase text-black leading-none">{village.name}</h2>
              <div className="flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.4em] text-stone-600 mt-4">
                <span>Shadowdark RPG Dossier</span>
                <div className="w-2 h-2 rounded-full bg-stone-800"></div>
                <span>Volume I</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 text-black flex items-center gap-2 uppercase"><Scroll /> Narrative Manifest</h3>
                <p className="text-3xl italic font-serif leading-relaxed text-black bg-white/40 p-10 border-l-8 border-stone-800 rounded-r shadow-inner font-black">"{village.description}"</p>
                <div className="mt-12 p-8 bg-stone-100 border-2 border-stone-800 rounded-lg flex flex-col items-center shadow-md break-inside-avoid">
                  <h4 className="text-xs font-black uppercase text-stone-500 mb-2">Town Morale</h4>
                  <div className="text-6xl font-black medieval-font uppercase text-black tracking-tighter">{village.morale}</div>
                </div>
              </div>
              <div className="break-inside-avoid flex flex-col">
                <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 text-black flex items-center gap-2 uppercase"><Users /> Census</h3>
                <div className="h-96 w-full bg-white/30 p-4 border-2 border-stone-800 rounded-lg shadow-inner mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={60} outerRadius={85} dataKey="value" stroke="#fff" strokeWidth={2}>
                        {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Legend 
                        layout="vertical" align="right" verticalAlign="middle" iconType="square"
                        formatter={(val, entry: any) => <span className="text-xs font-black text-black uppercase">{val}: {entry.payload.value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="no-print p-6 bg-stone-800/5 border-2 border-dashed border-stone-400 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-xs font-black">
                    <label><span>Humans</span><input className="w-full border-2 border-stone-800 px-2 py-1 rounded" type="number" value={manualDemo.h} onChange={e => setManualDemo({...manualDemo, h: parseInt(e.target.value) || 0})}/></label>
                    <label><span>Halflings</span><input className="w-full border-2 border-stone-800 px-2 py-1 rounded" type="number" value={manualDemo.ha} onChange={e => setManualDemo({...manualDemo, ha: parseInt(e.target.value) || 0})}/></label>
                    <label><span>Dwarves</span><input className="w-full border-2 border-stone-800 px-2 py-1 rounded" type="number" value={manualDemo.d} onChange={e => setManualDemo({...manualDemo, d: parseInt(e.target.value) || 0})}/></label>
                    <label><span>Elves</span><input className="w-full border-2 border-stone-800 px-2 py-1 rounded" type="number" value={manualDemo.e} onChange={e => setManualDemo({...manualDemo, e: parseInt(e.target.value) || 0})}/></label>
                  </div>
                  <button onClick={handleManualRedraw} className="w-full bg-stone-800 text-amber-500 py-2 rounded uppercase mt-4 font-bold shadow-md">Re-Draw Census</button>
                </div>
              </div>
            </div>
          </section>

          {/* PAGE 2: Settlement Relations */}
          <section className="parchment p-12 relative w-full mb-0">
            <PageNumber n={2} />
            <h3 className="text-4xl font-bold medieval-font border-b-2 border-stone-800 mb-10 pb-2 uppercase text-black flex items-center gap-3"><Globe /> Nearby Settlement Relations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {village.settlementRelations.map((rel, idx) => (
                <div key={idx} className="p-10 bg-white/40 border-2 border-stone-800 rounded-lg shadow-sm flex flex-col h-full break-inside-avoid">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-3xl font-bold medieval-font text-black">{rel.settlementName}</h4>
                    <span className={`text-[11px] font-black px-3 py-1 rounded border-2 uppercase ${rel.type === 'Harmful' ? 'bg-red-100 border-red-800 text-red-900' : rel.type === 'Good' ? 'bg-emerald-100 border-emerald-800 text-emerald-900' : 'bg-stone-200 border-stone-800 text-stone-900'}`}>{rel.type}</span>
                  </div>
                  <p className="text-[11px] font-black uppercase text-stone-500 mb-4 italic tracking-widest border-b border-stone-300 pb-2">Status: {rel.status}</p>
                  <p className="text-lg italic text-black font-black leading-relaxed">"{rel.description}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 3: Festivals */}
          <section className="parchment p-12 relative w-full mb-0">
            <PageNumber n={3} />
            <h3 className="text-4xl font-bold medieval-font border-b-2 border-stone-800 mb-10 pb-2 uppercase text-black flex items-center gap-3"><CalendarDays /> Cycle of Tradition: Local Festivals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {village.festivals.map((fest, idx) => (
                <div key={idx} className="p-8 bg-white/40 border-2 border-stone-400 rounded-sm relative overflow-hidden break-inside-avoid">
                  <div className="flex justify-between items-center mb-3 border-b-2 border-stone-300 pb-2">
                    <span className="font-bold text-black uppercase medieval-font text-3xl">{fest.name}</span>
                    {getSeasonIcon(fest.season)}
                  </div>
                  <p className="text-xs font-black text-stone-600 uppercase mb-4 tracking-tighter">{fest.timing} of {fest.season}</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-amber-950 uppercase tracking-widest mb-1">Ancient Lore</p>
                      <p className="text-base italic font-black text-stone-950 leading-tight">"{fest.lore}"</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Modern Ritual</p>
                      <p className="text-sm font-black text-stone-900 leading-tight bg-stone-100 p-3 rounded border border-stone-300">Practice: {fest.modernPractice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 4: Atmospheric Status */}
          <section className="parchment p-12 relative w-full mb-0">
            <PageNumber n={4} />
            <h3 className="text-4xl font-bold medieval-font border-b-2 border-stone-800 mb-10 pb-2 uppercase text-black flex items-center gap-3"><CloudRain /> Atmospheric Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                { label: "Current Climate", icon: <Sun />, val: village.weather },
                { label: "Local Atmosphere", icon: <Ghost />, val: village.atmosphere },
                { label: "Geography", icon: <MapPin />, val: village.geography }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white/30 border-2 border-stone-800 rounded-lg shadow-sm break-inside-avoid">
                  <h4 className="text-xs font-black uppercase text-stone-500 mb-3 flex items-center gap-2">{item.icon} {item.label}</h4>
                  <p className="text-2xl font-bold text-black italic font-black leading-snug">"{item.val}"</p>
                </div>
              ))}
            </div>
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 uppercase text-black flex items-center gap-3"><Zap /> Present Chronicles: Current Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {village.currentEvents.map((ev, i) => (
                <div key={i} className="p-8 bg-stone-100 border-l-8 border-stone-800 shadow-md rounded-r-lg break-inside-avoid">
                  <p className="text-lg font-black italic text-black leading-relaxed">"{ev}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 5: Map */}
          <section className="parchment p-12 relative w-full mb-0">
            <PageNumber n={5} />
            <h3 className="text-4xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 uppercase text-black flex items-center gap-3"><Map /> Local Chart (Map)</h3>
            <p className="text-base italic font-black text-stone-600 mb-8">Street map detailing the structures and alleyways of {village.name}.</p>
            <div className="w-full aspect-[16/9] bg-stone-900/10 border-4 border-stone-800 flex items-center justify-center overflow-hidden relative group rounded shadow-2xl">
              {village.mapUrl ? (
                <img src={village.mapUrl} className="w-full h-full object-cover" alt="Village Map" />
              ) : (
                <button onClick={handleGenerateMap} className="bg-stone-800 text-amber-500 px-10 py-5 rounded-lg font-bold medieval-font text-3xl no-print shadow-xl">Manifest Street Map</button>
              )}
              {village.mapUrl && <button onClick={handleGenerateMap} className="absolute bottom-6 right-6 bg-stone-800/80 text-white p-3 rounded-full no-print group-hover:opacity-100 opacity-0 transition-opacity"><RefreshCw size={24}/></button>}
            </div>
          </section>

          {/* PAGE 6: Hooks & Landmarks */}
          <section className="parchment p-12 relative w-full mb-0">
            <PageNumber n={6} />
            <h3 className="text-4xl font-bold medieval-font border-b-2 border-stone-800 mb-12 pb-2 uppercase text-black flex items-center gap-3"><Compass /> Campaign Hooks & Points of Interest</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-12">
                <h4 className="text-3xl font-bold medieval-font text-black border-l-4 border-stone-800 pl-4 uppercase">Sacred Landmarks</h4>
                {village.landmarks.map((l, i) => (
                  <div key={i} className="p-8 border-2 border-stone-300 rounded-lg bg-white/40 shadow-sm break-inside-avoid">
                    <div className="font-bold text-black text-2xl mb-2 flex items-center gap-3"><Landmark size={22} /> {l.name}</div>
                    <p className="text-lg italic font-black text-stone-800 mb-4">"{l.description}"</p>
                    <div className="text-xs text-amber-950 font-black italic bg-amber-100 p-4 border-l-4 border-amber-800 rounded-r shadow-inner">
                      <span className="block uppercase text-[10px] opacity-70 mb-1 tracking-widest">Encounter Hook</span>
                      {l.encounterHook}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-12">
                <h4 className="text-3xl font-bold medieval-font text-black border-l-4 border-stone-800 pl-4 uppercase">Village Quests</h4>
                {village.mainQuests.map((q, i) => (
                  <div key={i} className="p-8 bg-stone-100 border-l-8 border-stone-800 rounded-r-lg shadow-sm break-inside-avoid">
                    <p className="font-black text-black uppercase text-xl tracking-tight mb-3">{q.title}</p>
                    <p className="text-base font-black italic text-stone-700 mb-5">"{q.description}"</p>
                    <div className="text-[11px] font-black bg-stone-800 text-amber-400 px-4 py-1.5 rounded inline-flex items-center gap-2 uppercase shadow">
                      <ShoppingBag size={14}/> Reward: {q.reward}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PAGE 7: Dungeon Crawl */}
          <section className="parchment p-12 relative w-full mb-0">
            <PageNumber n={7} />
            <div className="flex justify-between items-center border-b-2 border-stone-800 mb-10 pb-2">
              <h3 className="text-4xl font-bold medieval-font text-black flex items-center gap-3 uppercase"><Boxes /> Nearby Crawl in a Box</h3>
              <button onClick={handleGeneratePOI} className="bg-stone-800 text-amber-500 text-xs px-8 py-2.5 rounded-lg no-print font-bold hover:bg-stone-700 transition-all uppercase tracking-widest">{poiLoading ? "Excavating..." : "Generate Dungeon"}</button>
            </div>
            {village.poi ? (
              <div className="space-y-8 bg-stone-900 text-stone-200 p-12 rounded-sm border-4 border-stone-700 shadow-2xl relative overflow-hidden">
                <h4 className="text-5xl font-bold medieval-font text-amber-500 uppercase tracking-tighter mb-2">{village.poi.title}</h4>
                <p className="text-xs font-black text-stone-500 uppercase tracking-[0.4em] mb-8">{village.poi.type} • {village.poi.location}</p>
                <p className="text-2xl italic font-serif border-l-8 border-amber-600 pl-8 mb-12 text-stone-300 font-black leading-relaxed">"{village.poi.background}"</p>
                <div className="grid grid-cols-1 gap-10">
                  {village.poi.rooms.map((r, i) => (
                    <div key={i} className="p-8 border-2 border-stone-700 bg-stone-800/80 rounded-lg shadow-inner break-inside-avoid">
                      <p className="font-bold text-amber-400 text-2xl uppercase medieval-font mb-4">Room {r.number}: {r.name}</p>
                      <p className="text-lg italic text-stone-300 mb-8 font-black leading-snug">"{r.description}"</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-sm bg-red-950/40 p-6 rounded border border-red-900/50 text-red-100 font-bold shadow-sm">
                          <span className="flex items-center gap-2 uppercase opacity-70 text-[11px] mb-3 tracking-widest text-red-400"><Skull size={18}/> Threats & Traps</span>
                          {r.threats}
                        </div>
                        <div className="text-sm bg-emerald-950/40 p-6 rounded border border-emerald-900/50 text-emerald-50 font-bold shadow-sm">
                          <span className="flex items-center gap-2 uppercase opacity-70 text-[11px] mb-3 tracking-widest text-emerald-400"><ShoppingBag size={18}/> Treasure</span>
                          {r.treasure}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center border-4 border-dashed border-stone-400 rounded bg-white/20">
                <Skull size={100} className="text-stone-300 mb-6 opacity-20" />
                <p className="medieval-font text-3xl text-stone-400">The Depths are Yet Unclaimed...</p>
              </div>
            )}
          </section>

          {/* PAGE 8: Secret */}
          <section className="parchment p-12 relative w-full mb-0 bg-stone-950 flex flex-col items-center justify-center min-h-screen text-center">
            <PageNumber n={8} />
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="grid grid-cols-10 gap-4 p-8">{Array(100).fill(0).map((_, i) => <Skull key={i} size={40} />)}</div>
            </div>
            <h3 className="text-7xl font-bold medieval-font mb-12 flex items-center justify-center gap-6 uppercase text-red-900 relative z-10"><Skull className="w-20 h-20" /> The Black Secret</h3>
            <p className="text-6xl italic font-serif leading-tight text-red-200 font-black relative z-10 drop-shadow-2xl px-12">"{village.darkSecret}"</p>
          </section>

          {/* MASTER RESIDENT DOSSIERS TITLE PAGE */}
          <section className="parchment p-12 relative w-full mb-0 flex flex-col items-center justify-center min-h-screen">
             <PageNumber n={9} />
             <h3 className="text-7xl font-bold medieval-font border-b-8 border-stone-800 mb-6 pb-6 text-black flex items-center gap-8 uppercase"><UserCircle size={100} /> Master Resident Dossiers</h3>
             <p className="text-xl font-black uppercase tracking-[0.5em] text-stone-500">Classified Personnel Files</p>
          </section>

          {/* INDIVIDUAL NPC DOSSIERS: Each on one page */}
          {village.residents.map((npc, idx) => {
            const standing = getStandingCategory(npc);
            const alignmentColor = npc.alignment === 'Lawful' ? 'bg-blue-100 border-blue-800 text-blue-900' : 
                                 npc.alignment === 'Chaotic' ? 'bg-red-100 border-red-800 text-red-900' : 
                                 'bg-stone-100 border-stone-800 text-stone-900';

            return (
              <section key={idx} className="parchment p-12 relative w-full mb-0">
                <PageNumber n={10 + idx} />
                <div className="p-8 md:p-10 border-4 border-stone-800 bg-white/60 rounded-sm shadow-2xl mb-8 flex flex-col md:flex-row gap-10 break-inside-avoid">
                  {/* IDENTITY COLUMN */}
                  <div className="w-full md:w-1/3 flex flex-col items-center shrink-0">
                    <div className="relative w-full aspect-square bg-stone-900/10 mb-6 border-4 border-stone-800 overflow-hidden shadow-lg group">
                      {npc.portraitUrl ? <img src={npc.portraitUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><UserCircle size={140} /></div>}
                      <button onClick={() => handleGeneratePortrait(idx, npc)} className="absolute inset-0 bg-stone-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-500 no-print font-bold gap-2"><Wand2 size={40} /> Portraits</button>
                      <button onClick={() => playVoice(idx, npc)} className="absolute bottom-4 right-4 p-4 bg-amber-600 text-white rounded-full no-print shadow-2xl">{voiceLoading[idx] ? <RefreshCw className="animate-spin" /> : <Volume2 size={24} />}</button>
                    </div>
                    <h4 className="text-5xl font-bold medieval-font text-black uppercase leading-none mb-1 text-center">{npc.name}</h4>
                    <p className="text-sm font-black text-stone-600 uppercase mb-8 tracking-widest">{npc.sex} • {npc.race} • {npc.role}</p>
                    <div className="flex flex-col gap-3 w-full">
                      <div className={`text-xs font-black px-4 py-3 border-2 border-stone-800 rounded bg-white w-full flex items-center justify-center gap-3 shadow-sm ${standing.color}`}>{standing.icon} {standing.label}</div>
                      <div className={`text-xs font-black px-4 py-3 border-2 rounded w-full flex items-center justify-center gap-3 uppercase tracking-[0.2em] shadow-sm ${alignmentColor}`}><Scale size={18}/> {npc.alignment}</div>
                    </div>
                  </div>

                  {/* PROFILE COLUMN */}
                  <div className="flex-1 space-y-8">
                    <div>
                      <h5 className="text-[11px] font-black uppercase text-stone-500 mb-2 tracking-[0.3em] flex items-center gap-2"><BookOpen size={16}/> Psychological Profile</h5>
                      <p className="italic text-3xl text-black font-black leading-relaxed border-l-8 border-stone-800 pl-8 bg-white/30 p-6 rounded shadow-inner">"{npc.personality}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-stone-800 text-amber-500 rounded-lg border-2 border-stone-900 shadow-xl font-black text-base">
                        <span className="block opacity-50 mb-1 uppercase text-[11px] tracking-[0.2em]">Motivation</span>
                        <Goal size={20} className="inline mr-2 mb-1"/> {npc.motivation}
                      </div>
                      <div className="p-6 bg-stone-800 text-amber-500 rounded-lg border-2 border-stone-900 shadow-xl font-black text-base">
                        <span className="block opacity-50 mb-1 uppercase text-[11px] tracking-[0.2em]">Characteristic</span>
                        <Fingerprint size={20} className="inline mr-2 mb-1"/> {npc.trait}
                      </div>
                      
                      {/* STATS BOX - COMPACT & OVERFLOW FIX */}
                      <div className="p-5 bg-white border-4 border-stone-800 rounded shadow-2xl flex justify-around items-center break-inside-avoid">
                        <div className="flex flex-col items-center">
                          <Shield size={32} className="text-stone-800 mb-1" />
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs uppercase font-bold text-stone-500">AC</span>
                            <span className="text-4xl font-black">{npc.stats.ac}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase opacity-60">Armor</span>
                        </div>
                        <div className="w-1 h-12 bg-stone-200 rounded-full"></div>
                        <div className="flex flex-col items-center">
                          <Heart size={32} className="text-red-700 mb-1" />
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs uppercase font-bold text-stone-500">HP</span>
                            <span className="text-4xl font-black">{npc.stats.hp}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase opacity-60">Health</span>
                        </div>
                      </div>

                      <div className="p-6 bg-red-100 text-red-950 rounded border-2 border-red-800 shadow-xl font-black text-base border-dashed">
                        <span className="block opacity-70 mb-1 uppercase text-[11px] tracking-widest text-red-800">Shadow Secret</span>
                        <Skull size={20} className="inline mr-3 mb-1 text-red-900"/> {npc.secret}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SOCIAL MATRIX - FULL WIDTH GRID */}
                <div className="w-full mt-6">
                  <h5 className="text-sm font-black uppercase text-stone-500 mb-4 tracking-[0.4em] flex items-center gap-3 border-b-4 border-stone-300 pb-2"><Swords size={20}/> Social Matrix Connections</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {npc.relationships.map((rel, r) => {
                      const s = getRelationshipStyles(rel.score);
                      return (
                        <div key={r} className={`p-3 border-2 rounded shadow-md flex flex-col min-h-[90px] transition-all bg-white/70 hover:scale-105 break-inside-avoid ${s.bg} ${s.border}`}>
                          <div className="flex justify-between items-start text-[11px] font-black text-black uppercase mb-1.5">
                            <span className="flex items-center gap-1 leading-none truncate w-[60%]">{s.icon} {rel.targetName}</span>
                            <div className="shrink-0 flex flex-col items-end">
                                <span className="bg-white px-1.5 border border-stone-300 rounded text-lg leading-none mb-0.5">{rel.score}</span>
                                <span className={`text-[8px] border bg-white/80 px-1 rounded-sm ${s.text}`}>{rel.feeling}</span>
                            </div>
                          </div>
                          <p className="text-[10px] italic font-black text-stone-900 leading-tight mt-auto">"{rel.reason}"</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}

          {/* PAGE 10 (Ledger) */}
          <section className="parchment p-12 relative w-full mb-0">
            <PageNumber n={25} />
            <h3 className="text-5xl font-bold medieval-font border-b-4 border-stone-800 mb-12 pb-4 uppercase text-black flex items-center gap-5"><ShoppingBag size={50} /> Marketplace Ledger</h3>
            <div className="grid grid-cols-1 gap-12">
              {village.businesses.map((biz, b) => (
                <div key={b} className="p-10 bg-white/50 border-4 border-stone-800 rounded-sm shadow-2xl relative overflow-hidden break-inside-avoid">
                  <div className="flex justify-between items-end border-b-4 border-stone-800 pb-5 mb-8">
                    <div><h4 className="text-4xl font-bold medieval-font text-black uppercase leading-none">{biz.name}</h4><p className="text-xs font-black text-stone-500 uppercase mt-2 tracking-widest">{biz.type}</p></div>
                    <span className="text-sm font-black uppercase text-stone-700 bg-white/90 px-6 py-2 border-2 border-stone-800 rounded-full mb-2 shadow">Proprietor: {biz.owner.name}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-10">
                    {biz.marketItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xl border-b-2 border-dashed border-stone-300 pb-2 hover:border-stone-800 transition-colors">
                        <div className="flex items-center gap-4 font-black text-black">
                          <CircleDot size={12} className="text-stone-400" />
                          <span>{item.name}</span>
                          <span className={`text-xs px-3 rounded-full border border-stone-300 uppercase ${item.availability === 'Scarce' ? 'text-red-700 bg-red-50' : 'text-stone-600'}`}>{item.availability}</span>
                        </div>
                        <span className="font-black text-black medieval-font text-3xl">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-amber-100/60 rounded border-l-[12px] border-amber-800 shadow-inner flex gap-6 items-center">
                    <ShieldAlert className="text-amber-900 shrink-0" size={36} />
                    <div>
                      <p className="text-xs font-black text-amber-900 uppercase tracking-[0.3em] mb-2">Local Whisper</p>
                      <p className="text-xl italic text-amber-950 font-black leading-snug">"{biz.rumor}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ENCOUNTER TABLES */}
          <section className="parchment p-12 relative w-full mb-0">
             <PageNumber n={30} />
             <h3 className="text-5xl font-bold medieval-font border-b-8 border-stone-800 mb-12 pb-4 text-black flex items-center gap-6 uppercase"><Compass size={60} /> Random Encounter Archives</h3>
             <div className="space-y-20">
                {[
                  { title: "Day: Inside Walls", table: ENCOUNTERS_DAY_INSIDE, roll: lastDayInsideRoll, size: 20 },
                  { title: "Night: Inside Walls", table: ENCOUNTERS_NIGHT_INSIDE, roll: lastNightInsideRoll, size: 20 },
                  { title: "Outside: Wandering Monsters", table: ENCOUNTERS_MONSTERS, roll: lastMonsterRoll, size: 100 }
                ].map((cat, ci) => (
                  <div key={ci} className="break-inside-avoid">
                    <h4 className="text-4xl font-bold medieval-font text-black uppercase mb-6">{cat.title}</h4>
                    <table className="w-full text-left font-serif border-4 border-stone-800 shadow-2xl">
                      <thead className="bg-stone-800 text-amber-500 font-black uppercase text-sm">
                        <tr><th className="py-4 px-6 border-r border-stone-700 w-24">d{cat.size}</th><th className="py-4 px-6">Encounter / Details</th></tr>
                      </thead>
                      <tbody className="divide-y-2 divide-stone-300 bg-white/70">
                        {cat.table.slice(0, 20).map((e, ei) => (
                          <tr key={ei} className="hover:bg-amber-50">
                            <td className="py-4 px-6 text-center border-r-2 border-stone-300 font-black text-2xl">{ei+1}</td>
                            <td className="py-4 px-6">
                              <span className="font-black text-black uppercase text-lg block mb-1">{e.who}</span>
                              <span className="italic font-black text-stone-700 text-base">"{e.text}"</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
             </div>
          </section>

          {/* CHRONICLE */}
          <section className="parchment p-16 relative w-full mb-0 flex flex-col">
            <PageNumber n={40} />
            <h3 className="text-6xl font-bold medieval-font border-b-4 border-stone-800 mb-10 pb-6 text-black uppercase flex items-center gap-6"><BookOpen size={64} /> Campaign Chronicle</h3>
            <div className="p-12 bg-white/40 border-8 border-double border-stone-400 rounded shadow-inner min-h-[800px] flex-1">
              <textarea 
                className="w-full h-full bg-transparent border-none italic text-4xl font-serif text-black font-black leading-loose outline-none resize-none no-print" 
                placeholder="Write your chronicle here..." 
                value={editableNotes} 
                onChange={e => setEditableNotes(e.target.value)} 
              />
              <p className="hidden print:block text-3xl font-serif italic text-black font-black leading-relaxed whitespace-pre-wrap">{editableNotes}</p>
            </div>
          </section>

          {/* WEATHER */}
          <section className="parchment p-12 relative w-full mb-0">
            <PageNumber n={42} />
            <h3 className="text-5xl font-bold medieval-font border-b-8 border-stone-800 mb-16 pb-6 text-black flex items-center gap-8 uppercase"><Cloud size={64} /> Seasonal Weather (d20)</h3>
            <div className="grid grid-cols-2 gap-x-20 gap-y-20">
              {[
                { title: "Spring", table: WEATHER_SPRING, icon: <Sprout /> },
                { title: "Summer", table: WEATHER_SUMMER, icon: <Sun /> },
                { title: "Fall", table: WEATHER_FALL, icon: <Leaf /> },
                { title: "Winter", table: WEATHER_WINTER, icon: <Snowflake /> }
              ].map((season, si) => (
                <div key={si} className="break-inside-avoid">
                  <div className="flex items-center gap-5 mb-8 border-b-4 border-stone-800 pb-3">
                    <span className="scale-150 text-stone-800">{season.icon}</span>
                    <h4 className="text-4xl font-bold medieval-font text-black uppercase">{season.title}</h4>
                  </div>
                  <table className="w-full border-4 border-stone-800 shadow-xl bg-white/80">
                    <thead className="bg-stone-800 text-amber-500 uppercase text-xs">
                      <tr><th className="py-3 px-4 w-16">d20</th><th className="py-3 px-4">Condition</th></tr>
                    </thead>
                    <tbody className="divide-y-2 divide-stone-300">
                      {season.table.map((w, wi) => (
                        <tr key={wi} className="text-lg">
                          <td className="py-2.5 px-4 text-center border-r-2 border-stone-300 font-black">{wi+1}</td>
                          <td className="py-2.5 px-4 italic font-black">"{w}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-stone-900/98 z-50 flex items-center justify-center flex-col gap-10 p-12 backdrop-blur-md">
          <Flame className="w-48 h-48 text-amber-500 animate-pulse" />
          <h2 className="text-6xl medieval-font text-amber-500 text-center uppercase tracking-widest drop-shadow-2xl">Manifesting Dossier...</h2>
          <p className="text-stone-400 italic text-center max-w-2xl text-2xl animate-pulse">Consulting the Oracle, mapping the ley lines, and documenting the residents of the Shadowdark. The ink flows heavy today...</p>
        </div>
      )}
    </div>
  );
};

const getStandingCategory = (npc: DetailedNPC) => {
  const avg = npc.relationships.reduce((a, r) => a + r.score, 0) / (npc.relationships.length || 1);
  if (avg <= 4.0) return { label: 'Pariah', color: 'text-red-950', icon: <Frown size={20} className="text-red-900" /> };
  if (avg >= 7.0) return { label: 'Pillar', color: 'text-amber-950 font-black', icon: <Crown size={20} className="text-amber-700" /> };
  return { label: 'Resident', color: 'text-stone-950', icon: <Users size={20} className="text-stone-800" /> };
};

const getRelationshipStyles = (score: number) => {
  if (score >= 8) return { bg: 'bg-emerald-100', border: 'border-emerald-700', text: 'text-emerald-950', icon: <Heart size={14} className="text-emerald-800" /> };
  if (score <= 4) return { bg: 'bg-rose-100', border: 'border-rose-700', text: 'text-rose-950', icon: <Swords size={14} className="text-rose-800" /> };
  return { bg: 'bg-stone-100', border: 'border-stone-500', text: 'text-stone-950', icon: <Minus size={14} className="text-stone-700" /> };
};

const getSeasonIcon = (season: string) => {
  switch(season) {
    case 'Spring': return <Sprout className="text-emerald-700" size={32} />;
    case 'Summer': return <Sun className="text-amber-700" size={32} />;
    case 'Fall': return <Leaf className="text-orange-800" size={32} />;
    case 'Winter': return <Snowflake className="text-blue-700" size={32} />;
    default: return <Star className="text-purple-700" size={32} />;
  }
};

export default App;
