
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

// --- Unique 100 Monsters (No Duplicates) ---
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

// --- Weather Tables ---
const WEATHER_SPRING = [
  "Gentle, cooling drizzle.", "Heavy morning mist.", "Sudden, violent thunderstorm.", "Warm, humid breeze.", 
  "Freezing rain that turns to sleet.", "Clear sky, blindingly bright.", "Steady, day-long downpour.", "Gusty winds carrying pollen.",
  "Chilling fog that muffles sound.", "Brief hail shower.", "Oppressive, heavy humidity.", "Cool and overcast.",
  "Light snow that melts instantly.", "Thunder but no rain.", "Whirling dust devils.", "Thick, low-hanging clouds.",
  "Violent wind that rattles shutters.", "Soft sun filtered through haze.", "Bitter cold snap.", "Perfectly still, silent air."
];
const WEATHER_SUMMER = [
  "Blistering, relentless heat.", "Dusty, parching wind.", "Violent evening tempest.", "Sticky, unmoving humidity.",
  "Heat haze that distorts vision.", "Brief, refreshing shower.", "Static-heavy air before a storm.", "Drought-stricken, dry breeze.",
  "Biting flies swarm in the heat.", "Sudden dust storm.", "Cooling breeze from the river.", "Blinding white sunshine.",
  "Smoggy, sulfurous air.", "Warm midnight rain.", "Oppressive stillness.", "Thunder that shakes the earth.",
  "Golden sunset that lasts hours.", "Drying wind that cracks lips.", "Short, intense deluge.", "Unrelenting blue sky."
];
const WEATHER_FALL = [
  "Cold, persistent drizzle.", "Howling autumnal gale.", "Sharp, biting morning frost.", "Crisp, cool sunshine.",
  "Sodden mist that smells of decay.", "Driving rain and dark clouds.", "Whirling leaves obscure vision.", "Misty, damp humidity.",
  "Sudden sleet and wind.", "Gloomy, grey overcast sky.", "Bitter wind from the mountains.", "Ghostly white morning fog.",
  "Cold rain that numbs the skin.", "Dying warmth of the sun.", "Gusts that overturn carts.", "Low, threatening clouds.",
  "Harsh, drying wind.", "Muted, grey sunlight.", "Sudden drop in temperature.", "Damp, heavy air."
];
const WEATHER_WINTER = [
  "Blistering, blinding blizzard.", "Bitter, bone-chilling cold.", "Heavy, silent snowfall.", "Frozen sleet that coats roads.",
  "Grey, sunless days.", "Freezing fog that stings the eyes.", "Howling, arctic wind.", "Short, pale hours of light.",
  "Sudden, heavy ice storm.", "Still, sub-zero atmosphere.", "Cracking ice on every surface.", "Gloomy, dark clouds.",
  "Biting wind that freezes breath.", "Snowflakes like heavy coins.", "Violent, freezing rain.", "Dull, leaden skies.",
  "Shattering frost at midnight.", "Icy mist from the river.", "Thick, powdery snow accumulation.", "Wind that cuts like a knife."
];

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

  const calculateDemographics = (total: number) => {
    const h = Math.floor(total * 0.85);
    const ha = Math.floor(total * 0.08);
    const d = Math.floor(total * 0.04);
    const e = Math.max(1, Math.floor(total * 0.02));
    const o = total - (h + ha + d + e);
    return { humans: h, halflings: ha, dwarves: d, elves: e, others: o > 0 ? [{ race: 'Others', count: o }] : [] };
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const pop = Math.floor(Math.random() * 100 + 200);
      const demo = calculateDemographics(pop);
      const data = await generateVillageDetails("Cinderglade", pop, demo);
      setVillage(data);
      setEditableNotes(data.gmNotes || "");
      setManualDemo({ 
        h: data.demographics.humans, 
        ha: data.demographics.halflings, 
        d: data.demographics.dwarves, 
        e: data.demographics.elves,
        o: data.demographics.others.reduce((acc, curr) => acc + curr.count, 0)
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleManualRedraw = () => {
    if (!village) return;
    const total = manualDemo.h + manualDemo.ha + manualDemo.d + manualDemo.e + manualDemo.o;
    setVillage({ 
      ...village, 
      population: total, 
      demographics: { 
        ...village.demographics, 
        humans: manualDemo.h, 
        halflings: manualDemo.ha, 
        dwarves: manualDemo.d, 
        elves: manualDemo.e,
        others: manualDemo.o > 0 ? [{ race: 'Others', count: manualDemo.o }] : []
      } 
    });
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
    const others = village.demographics.others.reduce((acc, curr) => acc + curr.count, 0);
    return [
      { name: 'Humans', value: village.demographics.humans, color: '#1a1a1a' },
      { name: 'Halflings', value: village.demographics.halflings, color: '#44403c' },
      { name: 'Dwarves', value: village.demographics.dwarves, color: '#78716c' },
      { name: 'Elves', value: village.demographics.elves, color: '#a8a29e' },
      { name: 'Others', value: others, color: '#7f1d1d' },
    ].filter(d => d.value > 0);
  }, [village]);

  const totalPop = village?.population || 1;

  // Page numbering helper
  const PageNumber = ({ n }: { n: number }) => (
    <div className="absolute top-4 right-8 text-xs font-black uppercase tracking-[0.2em] opacity-30 medieval-font pointer-events-none">
      Page {n}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Utility Bar */}
      <div className="max-w-6xl w-full flex justify-between items-center mb-12 no-print">
        <div>
          <h1 className="text-4xl font-bold medieval-font text-amber-500 flex items-center gap-3"><Flame /> Shadowdark Architect</h1>
          <p className="text-slate-400 italic text-sm">"Gritty village dossiers for the old-school soul."</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="bg-stone-800 text-amber-500 px-5 py-2 rounded-lg font-bold border border-amber-900/50 hover:bg-stone-700 transition-all"><Printer size={20} /></button>
          <button onClick={handleGenerate} className="bg-amber-600 text-white px-8 py-2 rounded-lg font-bold medieval-font text-xl shadow-xl hover:bg-amber-700 transition-all flex items-center gap-2">{loading ? <RefreshCw className="animate-spin" /> : <Scroll />} Manifest Village</button>
        </div>
      </div>

      {village && (
        <div className="w-full max-w-4xl flex flex-col gap-12">
          
          {/* PAGE 1: Narrative Manifest, Town Morale and Census */}
          <section className="parchment p-12 shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={1} />
            <div className="border-b-4 border-double border-stone-800 pb-6 mb-8 text-center">
              <h2 className="text-7xl font-bold medieval-font uppercase text-black leading-none">{village.name}</h2>
              <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-stone-600 mt-2">
                <span>Shadowdark RPG Dossier</span>
                <div className="w-2 h-2 rounded-full bg-stone-800"></div>
                <span>Volume I</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
              <div>
                <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 text-black flex items-center gap-2 uppercase"><Scroll /> Narrative Manifest</h3>
                <p className="text-2xl italic font-serif leading-relaxed text-black bg-white/40 p-8 border-l-8 border-stone-800 rounded-r shadow-inner font-black">"{village.description}"</p>
                <div className="mt-8 p-6 bg-stone-100 border-2 border-stone-800 rounded-lg flex flex-col items-center shadow-md">
                  <h4 className="text-xs font-black uppercase text-stone-500 mb-1">Town Morale</h4>
                  <div className="text-4xl font-black medieval-font uppercase text-black tracking-tighter">{village.morale}</div>
                </div>
              </div>
              <div className="break-inside-avoid flex flex-col">
                <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 text-black flex items-center gap-2 uppercase"><Users /> Census</h3>
                <div className="h-80 w-full bg-white/30 p-4 border-2 border-stone-800 rounded-lg shadow-inner mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={55} outerRadius={75} dataKey="value" stroke="#fff" strokeWidth={2}>
                        {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#fef3c7', border: '2px solid #1a1a1a', borderRadius: '4px' }} />
                      <Legend 
                        layout="vertical" align="right" verticalAlign="middle" iconType="square"
                        formatter={(val, entry: any) => {
                          const percent = ((entry.payload.value / totalPop) * 100).toFixed(0);
                          return <span className="text-[11px] font-black text-black uppercase leading-none">{val}: {entry.payload.value} ({percent}%)</span>;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Manual Entry Form */}
                <div className="no-print p-6 bg-stone-800/5 border-2 border-dashed border-stone-400 rounded-lg text-xs font-black">
                  <p className="uppercase text-stone-500 mb-4 tracking-widest text-center border-b border-stone-300 pb-2">Manual Demographic Override</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <label className="flex flex-col"><span>Humans</span><input className="border-2 border-stone-800 px-2 py-1 rounded" type="number" value={manualDemo.h} onChange={e => setManualDemo({...manualDemo, h: parseInt(e.target.value) || 0})}/></label>
                    <label className="flex flex-col"><span>Halflings</span><input className="border-2 border-stone-800 px-2 py-1 rounded" type="number" value={manualDemo.ha} onChange={e => setManualDemo({...manualDemo, ha: parseInt(e.target.value) || 0})}/></label>
                    <label className="flex flex-col"><span>Dwarves</span><input className="border-2 border-stone-800 px-2 py-1 rounded" type="number" value={manualDemo.d} onChange={e => setManualDemo({...manualDemo, d: parseInt(e.target.value) || 0})}/></label>
                    <label className="flex flex-col"><span>Elves</span><input className="border-2 border-stone-800 px-2 py-1 rounded" type="number" value={manualDemo.e} onChange={e => setManualDemo({...manualDemo, e: parseInt(e.target.value) || 0})}/></label>
                    <label className="flex flex-col col-span-2"><span>Others</span><input className="border-2 border-stone-800 px-2 py-1 rounded" type="number" value={manualDemo.o} onChange={e => setManualDemo({...manualDemo, o: parseInt(e.target.value) || 0})}/></label>
                  </div>
                  <button onClick={handleManualRedraw} className="w-full bg-stone-800 text-amber-500 py-2 rounded-lg uppercase mt-4 hover:bg-stone-700 transition-all shadow-md font-bold">Re-Draw Chart</button>
                </div>
              </div>
            </div>
          </section>

          {/* PAGE 2: Nearby Settlement Relations */}
          <section className="parchment p-12 page-break-before shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={2} />
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 uppercase text-black flex items-center gap-2"><Globe /> Nearby Settlement Relations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {village.settlementRelations.map((rel, idx) => (
                <div key={idx} className="p-8 bg-white/40 border-2 border-stone-800 rounded-lg shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-2xl font-bold medieval-font text-black">{rel.settlementName}</h4>
                    <span className={`text-[10px] font-black px-2 py-1 rounded border-2 uppercase ${rel.type === 'Harmful' ? 'bg-red-100 border-red-800 text-red-900' : rel.type === 'Good' ? 'bg-emerald-100 border-emerald-800 text-emerald-900' : 'bg-stone-200 border-stone-800 text-stone-900'}`}>{rel.type}</span>
                  </div>
                  <div className="text-[10px] font-black uppercase text-stone-500 mb-4 italic">Status: {rel.status}</div>
                  <p className="text-base italic text-black font-black leading-relaxed flex-grow">"{rel.description}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 3: The Cycle of Tradition: Local Festivals */}
          <section className="parchment p-12 page-break-before shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={3} />
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 uppercase text-black flex items-center gap-2"><CalendarDays /> The Cycle of Tradition: Local Festivals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {village.festivals.map((fest, idx) => (
                <div key={idx} className="p-8 bg-white/40 border-2 border-stone-400 rounded-sm relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Flame size={120} /></div>
                  <div className="flex justify-between items-center mb-2 border-b border-stone-300 pb-2">
                    <span className="font-bold text-black uppercase medieval-font text-2xl">{fest.name}</span>
                    {getSeasonIcon(fest.season)}
                  </div>
                  <p className="text-[11px] font-black text-stone-600 uppercase mb-4">{fest.timing} of {fest.season}</p>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Ancient Lore</p>
                      <p className="text-sm italic font-black text-stone-950 leading-tight">"{fest.lore}"</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Modern Ritual</p>
                      <p className="text-sm font-black text-stone-900 leading-tight bg-stone-100 p-2 rounded">Practice: {fest.modernPractice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 4: Current Climate, Local Atmosphere, Geography, and Current events */}
          <section className="parchment p-12 page-break-before shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={4} />
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 uppercase text-black flex items-center gap-2"><CloudRain /> Atmospheric Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-6 bg-white/30 border-2 border-stone-800 rounded-lg shadow-sm">
                <h4 className="text-xs font-black uppercase text-stone-500 mb-2 flex items-center gap-1"><Sun size={14}/> Current Climate</h4>
                <p className="text-xl font-bold text-black italic font-black leading-tight">"{village.weather}"</p>
              </div>
              <div className="p-6 bg-white/30 border-2 border-stone-800 rounded-lg shadow-sm">
                <h4 className="text-xs font-black uppercase text-stone-500 mb-2 flex items-center gap-1"><Ghost size={14}/> Local Atmosphere</h4>
                <p className="text-xl font-bold text-black italic font-black leading-tight">"{village.atmosphere}"</p>
              </div>
              <div className="p-6 bg-white/30 border-2 border-stone-800 rounded-lg shadow-sm">
                <h4 className="text-xs font-black uppercase text-stone-500 mb-2 flex items-center gap-1"><MapPin size={14}/> Geography</h4>
                <p className="text-xl font-bold text-black italic font-black leading-tight">"{village.geography}"</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-2 uppercase text-black flex items-center gap-2"><Zap /> Present Chronicles: Current Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {village.currentEvents.map((ev, i) => (
                <div key={i} className="p-6 bg-stone-100 border-l-8 border-stone-800 shadow-md rounded-r-lg">
                  <p className="text-base font-black italic text-black leading-relaxed">"{ev}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 5: Local Chart (Map) */}
          <section className="parchment p-12 page-break-before shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={5} />
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 uppercase text-black flex items-center gap-2"><Map /> Local Chart (Map)</h3>
            <p className="text-sm italic font-black text-stone-600 mb-4">Detailed local map showing buildings, alleyways, and merchants within {village.name}.</p>
            <div className="w-full aspect-[16/9] bg-stone-900/10 border-4 border-stone-800 flex items-center justify-center overflow-hidden relative group rounded-sm shadow-2xl">
              {village.mapUrl ? (
                <img src={village.mapUrl} className="w-full h-full object-cover" alt="Village Map" />
              ) : (
                <div className="text-center">
                  <Map size={80} className="mx-auto text-stone-300 mb-4" />
                  <button onClick={handleGenerateMap} className="bg-stone-800 text-amber-500 px-10 py-4 rounded-lg font-bold medieval-font text-2xl no-print hover:bg-stone-700 transition-all shadow-xl">Manifest Strategic Map</button>
                </div>
              )}
              {village.mapUrl && (
                <button onClick={handleGenerateMap} className="absolute bottom-4 right-4 bg-stone-800/80 text-white p-2 rounded-full no-print opacity-0 group-hover:opacity-100 transition-opacity"><RefreshCw size={20}/></button>
              )}
            </div>
            <p className="mt-4 text-xs font-black text-stone-500 uppercase text-center tracking-widest italic">Secret passages and traps may be hidden within these borders.</p>
          </section>

          {/* PAGE 6: Campaign Hooks & Points of Interest, Landmarks and Local Quests */}
          <section className="parchment p-12 page-break-before shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={6} />
            <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-10 pb-2 uppercase text-black flex items-center gap-2"><Compass /> Campaign Hooks & Points of Interest</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-8">
                <h4 className="text-2xl font-bold medieval-font text-black border-l-4 border-stone-800 pl-4 uppercase">Sacred Landmarks</h4>
                {village.landmarks.map((l, i) => (
                  <div key={i} className="p-6 border-2 border-stone-300 rounded-lg bg-white/40 shadow-sm relative group">
                    <div className="font-bold text-black text-xl mb-1 flex items-center gap-2"><Landmark size={18} className="text-stone-700" /> {l.name}</div>
                    <p className="text-sm italic font-black text-stone-800 mb-3">"{l.description}"</p>
                    <div className="text-[10px] text-amber-950 font-black italic bg-amber-100 p-3 border-l-4 border-amber-800 rounded-r shadow-inner">
                      <span className="block uppercase text-[9px] opacity-70 mb-1">Encounter Hook</span>
                      {l.encounterHook}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-8">
                <h4 className="text-2xl font-bold medieval-font text-black border-l-4 border-stone-800 pl-4 uppercase">Village Quests</h4>
                {village.mainQuests.map((q, i) => (
                  <div key={i} className="p-6 bg-stone-100 border-l-8 border-stone-800 rounded-r-lg shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-black uppercase text-lg tracking-tight leading-none">{q.title}</p>
                      <Goal size={20} className="text-stone-600 shrink-0" />
                    </div>
                    <p className="text-sm font-black italic text-stone-700 mb-4">"{q.description}"</p>
                    <div className="text-[10px] font-black bg-stone-800 text-amber-400 px-3 py-1 rounded inline-flex items-center gap-1 uppercase">
                      <ShoppingBag size={12}/> Reward: {q.reward}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PAGE 7: Nearby Crawl in a BOX */}
          <section className="parchment p-12 page-break-before shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={7} />
            <div className="flex justify-between items-center border-b-2 border-stone-800 mb-8 pb-2">
              <h3 className="text-3xl font-bold medieval-font text-black flex items-center gap-2 uppercase"><Boxes /> Nearby Crawl in a Box</h3>
              <button onClick={handleGeneratePOI} className="bg-stone-800 text-amber-500 text-xs px-6 py-2 rounded-lg no-print font-bold hover:bg-stone-700 transition-all uppercase tracking-widest">{poiLoading ? "Excavating..." : village.poi ? "Regenerate Dungeon" : "Draft Dungeon"}</button>
            </div>
            
            {village.poi ? (
              <div className="space-y-8 bg-stone-900 text-stone-200 p-10 rounded-sm border-4 border-stone-700 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Skull size={200} /></div>
                <div className="relative z-10">
                  <h4 className="text-4xl font-bold medieval-font text-amber-500 uppercase tracking-tighter mb-1">{village.poi.title}</h4>
                  <p className="text-xs font-black text-stone-500 uppercase tracking-[0.3em] mb-6">{village.poi.type} • {village.poi.location}</p>
                  <p className="text-xl italic font-serif border-l-4 border-amber-600 pl-6 mb-12 text-stone-300 font-black leading-relaxed">"{village.poi.background}"</p>
                  <div className="grid grid-cols-1 gap-6">
                    {village.poi.rooms.map((r, i) => (
                      <div key={i} className="p-6 border-2 border-stone-700 bg-stone-800/70 rounded-lg shadow-inner group hover:border-amber-900 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <p className="font-bold text-amber-400 text-lg uppercase medieval-font">Room {r.number}: {r.name}</p>
                          <Compass className="text-stone-600" size={18} />
                        </div>
                        <p className="text-base italic text-stone-300 mt-1 mb-6 font-black leading-snug">"{r.description}"</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-xs bg-red-950/40 p-4 rounded border border-red-900/50 text-red-200 font-bold shadow-sm">
                            <span className="flex items-center gap-2 uppercase opacity-70 text-[10px] mb-2 tracking-widest text-red-400"><Skull size={14}/> Threats & Traps</span>
                            {r.threats}
                          </div>
                          <div className="text-xs bg-emerald-950/40 p-4 rounded border border-emerald-900/50 text-emerald-100 font-bold shadow-sm">
                            <span className="flex items-center gap-2 uppercase opacity-70 text-[10px] mb-2 tracking-widest text-emerald-400"><ShoppingBag size={14}/> Treasure</span>
                            {r.treasure}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center border-4 border-dashed border-stone-400 rounded-sm bg-white/20">
                <Skull size={64} className="text-stone-300 mb-4" />
                <p className="medieval-font text-2xl text-stone-400">The Depths are Yet Unclaimed...</p>
              </div>
            )}
          </section>

          {/* PAGE 8: The Black Secret */}
          <section className="page-break-before bg-stone-950 text-red-600 p-24 border-[12px] border-double border-red-950 shadow-2xl relative text-center overflow-hidden">
            <PageNumber n={8} />
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="grid grid-cols-10 gap-2 p-2">
                {Array(100).fill(0).map((_, i) => <Skull key={i} size={40} />)}
              </div>
            </div>
            <h3 className="text-6xl font-bold medieval-font mb-8 flex items-center justify-center gap-4 uppercase relative z-10 text-red-800"><Skull className="w-16 h-16" /> The Black Secret</h3>
            <p className="text-5xl italic font-serif leading-tight text-red-200 font-black relative z-10 drop-shadow-lg">"{village.darkSecret}"</p>
            <div className="absolute top-6 right-8 text-[12px] font-black uppercase tracking-[1.5em] opacity-30 text-red-400 no-print">Eyes Only • GM Secret</div>
            <div className="absolute bottom-6 left-8 text-[12px] font-black uppercase tracking-[1.5em] opacity-30 text-red-400 no-print">Eyes Only • GM Secret</div>
          </section>

          {/* PAGE 9: Master Resident Dossiers (RESTYLED) */}
          <section className="parchment p-12 page-break-before shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={9} />
            <h3 className="text-5xl font-bold medieval-font border-b-4 border-stone-800 mb-12 pb-4 text-black flex items-center gap-4 uppercase"><UserCircle size={48} /> Master Resident Dossiers</h3>
            <div className="space-y-32">
              {village.residents.map((npc, idx) => {
                const standing = getStandingCategory(npc);
                const alignmentColor = npc.alignment === 'Lawful' ? 'bg-blue-100 border-blue-800 text-blue-900' : 
                                     npc.alignment === 'Chaotic' ? 'bg-red-100 border-red-800 text-red-900' : 
                                     'bg-stone-100 border-stone-800 text-stone-900';

                return (
                  <div key={idx} className="break-inside-avoid relative">
                    <div className="p-8 md:p-10 border-4 border-stone-800 bg-white/60 rounded-sm shadow-2xl mb-8">
                      <div className="flex flex-col md:flex-row gap-12">
                        {/* LEFT COLUMN: Identity */}
                        <div className="w-full md:w-1/3 flex flex-col items-center shrink-0">
                          <div className="relative w-full aspect-square bg-stone-900/10 mb-6 border-4 border-stone-800 overflow-hidden shadow-lg group">
                            {npc.portraitUrl ? (
                              <img src={npc.portraitUrl} className="w-full h-full object-cover" alt={npc.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-10"><UserCircle size={140} /></div>
                            )}
                            <button onClick={() => handleGeneratePortrait(idx, npc)} className="absolute inset-0 bg-stone-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-500 no-print font-bold gap-2"><Wand2 size={40} /> Manifest Portrait</button>
                            <button onClick={() => playVoice(idx, npc)} className="absolute bottom-4 right-4 p-4 bg-amber-600 text-white rounded-full no-print shadow-2xl hover:scale-110 transition-transform">{voiceLoading[idx] ? <RefreshCw className="animate-spin" /> : <Volume2 size={24} />}</button>
                          </div>
                          <h4 className="text-4xl font-bold medieval-font text-black uppercase leading-none mb-1 text-center">{npc.name}</h4>
                          <p className="text-[12px] font-black text-stone-600 uppercase mb-6 tracking-widest">{npc.sex} • {npc.race} • {npc.role}</p>
                          
                          <div className="flex flex-col gap-3 w-full" id={`alignment-area-${idx}`}>
                            <div className={`text-[11px] font-black px-4 py-2.5 border-2 border-stone-800 rounded bg-white w-full flex items-center justify-center gap-2 shadow-sm ${standing.color}`}>{standing.icon} {standing.label}</div>
                            <div className={`text-[11px] font-black px-4 py-2.5 border-2 rounded w-full flex items-center justify-center gap-2 uppercase tracking-[0.2em] shadow-sm ${alignmentColor}`}><Scale size={14}/> {npc.alignment}</div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Profile & Bio */}
                        <div className="flex-1 space-y-8">
                          <div>
                            <h5 className="text-[11px] font-black uppercase text-stone-500 mb-2 tracking-[0.2em] flex items-center gap-2"><BookOpen size={14}/> Psychological Profile</h5>
                            <p className="italic text-2xl text-black font-black leading-relaxed border-l-8 border-stone-800 pl-6 bg-white/30 p-4 rounded-r shadow-inner">"{npc.personality}"</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-stone-800 text-amber-500 rounded-lg border-2 border-stone-900 shadow-lg font-black text-sm">
                              <span className="block opacity-50 mb-1 uppercase text-[10px] tracking-widest">Motivation</span>
                              <Goal size={16} className="inline mr-2 mb-1"/> {npc.motivation}
                            </div>
                            <div className="p-5 bg-stone-800 text-amber-500 rounded-lg border-2 border-stone-900 shadow-lg font-black text-sm">
                              <span className="block opacity-50 mb-1 uppercase text-[10px] tracking-widest">Characteristic</span>
                              <Fingerprint size={16} className="inline mr-2 mb-1"/> {npc.trait}
                            </div>
                            
                            {/* FIXED COMBAT STATS BOX */}
                            <div className="p-4 bg-white border-2 border-stone-800 rounded-lg shadow-lg flex justify-between items-center overflow-hidden">
                                <div className="flex flex-col items-center flex-1 border-r border-stone-200">
                                    <Shield size={24} className="text-stone-800 mb-1" />
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] font-bold uppercase text-stone-500">AC</span>
                                        <span className="text-2xl font-black text-black">{npc.stats.ac}</span>
                                    </div>
                                    <span className="text-[8px] uppercase opacity-60 font-black">Armor</span>
                                </div>
                                <div className="flex flex-col items-center flex-1">
                                    <Heart size={24} className="text-red-700 mb-1" />
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] font-bold uppercase text-stone-500">HP</span>
                                        <span className="text-2xl font-black text-black">{npc.stats.hp}</span>
                                    </div>
                                    <span className="text-[8px] uppercase opacity-60 font-black">Health</span>
                                </div>
                            </div>

                            <div className="p-5 bg-red-100 text-red-950 rounded-lg border-2 border-red-800 shadow-lg font-black text-sm border-dashed">
                              <span className="block opacity-70 mb-1 uppercase text-[10px] tracking-widest text-red-800">Alignment Shadow Secret</span>
                              <Skull size={16} className="inline mr-2 mb-1 text-red-900"/> {npc.secret}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SOCIAL MATRIX - MOVED & REFORMATTED */}
                    <div className="w-full">
                      <h5 className="text-[11px] font-black uppercase text-stone-500 mb-4 tracking-[0.3em] flex items-center gap-2 border-b-2 border-stone-300 pb-1 w-full"><Swords size={16}/> Social Matrix Connections</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {npc.relationships.map((rel, r) => {
                          const s = getRelationshipStyles(rel.score);
                          return (
                            <div key={r} className={`p-3 border-2 rounded shadow-sm flex flex-col transition-all hover:bg-white hover:scale-[1.02] ${s.bg} ${s.border}`}>
                              <div className="flex justify-between items-start text-[10px] font-black text-black uppercase mb-1.5">
                                <span className="flex items-center gap-1 leading-none truncate pr-2" title={rel.targetName}>{s.icon} {rel.targetName}</span>
                                <div className="shrink-0 flex flex-col items-end">
                                    <span className="bg-white/80 px-1 border border-stone-300 rounded leading-none text-[11px] mb-0.5">{rel.score}</span>
                                    <span className={`text-[7px] border border-stone-200 bg-white/60 px-1 rounded-sm ${s.text}`}>{rel.feeling}</span>
                                </div>
                              </div>
                              <p className="text-[8.5px] italic font-black text-stone-900 leading-tight line-clamp-2 mt-auto">"{rel.reason}"</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PAGE 10: Marketplace Ledger */}
          <section className="parchment p-12 page-break-before shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={10} />
            <h3 className="text-4xl font-bold medieval-font border-b-2 border-stone-800 mb-10 pb-2 uppercase text-black flex items-center gap-3"><ShoppingBag size={40} /> Marketplace Ledger</h3>
            <div className="grid grid-cols-1 gap-10">
              {village.businesses.map((biz, b) => (
                <div key={b} className="break-inside-avoid p-8 bg-white/50 border-2 border-stone-800 rounded-sm shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><ShoppingBag size={120}/></div>
                  <div className="flex justify-between items-end border-b-4 border-stone-800 pb-3 mb-6">
                    <div>
                      <h4 className="text-3xl font-bold medieval-font text-black uppercase leading-none">{biz.name}</h4>
                      <p className="text-[10px] font-black text-stone-500 uppercase mt-1 tracking-widest">{biz.type}</p>
                    </div>
                    <span className="text-[11px] font-black uppercase text-stone-700 bg-white/80 px-3 py-1 border-2 border-stone-800 rounded-full mb-1">Proprietor: {biz.owner.name}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 mb-8">
                    {biz.marketItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-base border-b-2 border-dashed border-stone-300 pb-1 hover:border-stone-800 transition-colors">
                        <div className="flex items-center gap-3 font-black text-black">
                          <CircleDot size={10} className="text-stone-400" />
                          <span>{item.name}</span>
                          <span className={`text-[9px] px-2 rounded-full border border-stone-300 uppercase ${item.availability === 'Scarce' ? 'text-red-700 bg-red-50' : item.availability === 'Rare' ? 'text-amber-700 bg-amber-50' : 'text-stone-600'}`}>{item.availability}</span>
                        </div>
                        <span className="font-black text-black medieval-font text-lg">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 bg-amber-100/50 rounded-lg border-l-8 border-amber-800 shadow-inner flex gap-4 items-center">
                    <ShieldAlert className="text-amber-900 shrink-0" size={24} />
                    <div>
                      <p className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-1">Local Whisper</p>
                      <p className="text-base italic text-amber-950 font-black leading-snug">"{biz.rumor}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 11: Random Encounter Archives (Unique Entries) */}
          <section className="parchment p-12 page-break-before shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={11} />
            <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-10 pb-4 text-black flex items-center gap-4 uppercase"><Compass size={44} /> Random Encounter Archives</h3>
            <div className="space-y-16">
              {[
                { 
                  title: "Day: Inside Walls", 
                  table: ENCOUNTERS_DAY_INSIDE, 
                  roll: lastDayInsideRoll, 
                  handler: () => setLastDayInsideRoll(Math.floor(Math.random()*20+1)), 
                  size: 20 
                },
                { 
                  title: "Night: Inside Walls", 
                  table: ENCOUNTERS_NIGHT_INSIDE, 
                  roll: lastNightInsideRoll, 
                  handler: () => setLastNightInsideRoll(Math.floor(Math.random()*20+1)), 
                  size: 20 
                },
                { 
                  title: "Wandering Monsters: Outside Walls", 
                  table: ENCOUNTERS_MONSTERS, 
                  roll: lastMonsterRoll, 
                  handler: () => setLastMonsterRoll(Math.floor(Math.random()*100+1)), 
                  size: 100 
                }
              ].map((cat, ci) => (
                <div key={ci} className="break-inside-avoid">
                  <div className="flex justify-between items-center mb-6 border-b-2 border-stone-300 pb-2">
                    <h4 className="text-2xl font-bold medieval-font text-black uppercase tracking-tighter">{cat.title}</h4>
                    <button onClick={cat.handler} className="no-print bg-stone-800 text-amber-500 px-6 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 hover:bg-stone-700 transition-all shadow-md active:scale-95"><Dices size={16}/> Roll 1d{cat.size}</button>
                  </div>
                  <div className="bg-white/60 border-2 border-stone-800 rounded-sm overflow-hidden shadow-xl">
                    <table className="w-full text-left text-sm font-serif border-collapse">
                      <thead className="bg-stone-800 text-amber-500 text-[11px] font-black uppercase tracking-widest">
                        <tr>
                          <th className="py-3 px-4 w-16 text-center border-r border-stone-700">d{cat.size}</th>
                          <th className="py-3 px-4 w-1/4 border-r border-stone-700">Encounter</th>
                          <th className="py-3 px-4">Situation / Narrative Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-300">
                        {cat.table.slice(0, cat.size === 100 ? 100 : 20).map((e, ei) => (
                          <tr key={ei} className={`transition-colors ${cat.roll === ei + 1 ? 'bg-amber-400/80 font-black scale-[1.01] shadow-lg' : 'hover:bg-amber-100/40'}`}>
                            <td className="py-3 px-4 text-center border-r border-stone-300 font-black text-xl leading-none">{(ei + 1).toString().padStart(2, '0')}</td>
                            <td className="py-3 px-4 font-black text-black flex items-center gap-3">
                              <span className="opacity-70 group-hover:opacity-100 transition-opacity">{e.icon}</span>
                              <span className="uppercase tracking-tight">{e.who}</span>
                            </td>
                            <td className="py-3 px-4 italic text-stone-950 font-black leading-snug">"{e.text}"</td>
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
          <section className="parchment p-16 page-break-before no-print:hidden break-inside-avoid shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={12} />
            <h3 className="text-5xl font-bold medieval-font border-b-4 border-stone-800 mb-10 pb-4 text-black uppercase flex items-center gap-4"><BookOpen size={48} /> Campaign Chronicle</h3>
            <p className="text-xs font-black uppercase text-stone-500 mb-8 tracking-widest">Journal your party's deeds, deaths, and discoveries in the Shadowdark.</p>
            <div className="p-12 bg-white/40 border-4 border-dashed border-stone-400 rounded-sm min-h-[700px] shadow-inner relative">
              <textarea 
                className="w-full h-full min-h-[700px] bg-transparent border-none italic text-2xl font-serif text-black font-black leading-loose outline-none resize-none" 
                placeholder="The ink of destiny begins to flow..." 
                value={editableNotes} 
                onChange={e => setEditableNotes(e.target.value)} 
              />
              <div className="absolute bottom-6 right-8 text-xs font-black uppercase opacity-20 medieval-font">Record of Souls</div>
            </div>
          </section>

          {/* PAGE 13: Seasonal Weather Tables */}
          <section className="parchment p-12 page-break-before shadow-2xl relative border-2 border-stone-800/20">
            <PageNumber n={13} />
            <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-10 pb-4 text-black flex items-center gap-4 uppercase"><Cloud size={44} /> Seasonal Weather (d20 Tables)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {[
                { title: "Spring Weather", table: WEATHER_SPRING, icon: <Sprout className="text-emerald-700" /> },
                { title: "Summer Weather", table: WEATHER_SUMMER, icon: <Sun className="text-amber-700" /> },
                { title: "Fall Weather", table: WEATHER_FALL, icon: <Leaf className="text-orange-800" /> },
                { title: "Winter Weather", table: WEATHER_WINTER, icon: <Snowflake className="text-blue-700" /> }
              ].map((season, si) => (
                <div key={si} className="break-inside-avoid">
                  <div className="flex items-center gap-3 mb-4 border-b-2 border-stone-800 pb-1">
                    {season.icon}
                    <h4 className="text-2xl font-bold medieval-font text-black uppercase">{season.title}</h4>
                  </div>
                  <div className="bg-white/60 border-2 border-stone-800 rounded-sm shadow-lg">
                    <table className="w-full text-left text-sm font-serif">
                      <thead className="bg-stone-800 text-amber-500 text-[11px] font-black uppercase">
                        <tr><th className="py-2 px-3 w-12 text-center border-r border-stone-700">d20</th><th className="py-2 px-3">Conditions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-stone-300">
                        {season.table.map((w, wi) => (
                          <tr key={wi} className="hover:bg-amber-100/40">
                            <td className="py-1.5 px-3 text-center border-r border-stone-300 font-black text-lg">{(wi + 1).toString().padStart(2, '0')}</td>
                            <td className="py-1.5 px-3 italic font-black text-black">"{w}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-stone-900/98 z-50 flex items-center justify-center flex-col gap-8 p-12 backdrop-blur-sm">
          <div className="relative">
            <Flame className="w-40 h-40 text-amber-500 animate-pulse" />
            <RefreshCw className="w-40 h-40 text-amber-600 animate-spin absolute top-0 left-0 opacity-20" />
          </div>
          <h2 className="text-5xl medieval-font text-amber-500 text-center uppercase tracking-widest drop-shadow-lg">Manifesting Village Dossier...</h2>
          <div className="max-w-md w-full bg-stone-800 h-2 rounded-full overflow-hidden shadow-inner">
            <div className="bg-amber-500 h-full animate-[loading_15s_linear_infinite]"></div>
          </div>
          <p className="text-stone-400 italic text-center max-w-md text-xl animate-pulse">
            Weaving narrative arcs, calculating social matrices, and unearthing the dark secrets of the Shadowdark. Please wait while the ink dries...
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

// --- Helpers ---
const getStandingCategory = (npc: DetailedNPC) => {
  const avg = npc.relationships.reduce((a, r) => a + r.score, 0) / (npc.relationships.length || 1);
  if (avg <= 4.0) return { label: 'Pariah', color: 'text-red-950', icon: <Frown size={14} className="text-red-900" /> };
  if (avg >= 7.0) return { label: 'Pillar', color: 'text-amber-950 font-black', icon: <Crown size={14} className="text-amber-700" /> };
  return { label: 'Resident', color: 'text-stone-950', icon: <Users size={14} className="text-stone-800" /> };
};

const getRelationshipStyles = (score: number) => {
  if (score >= 8) return { bg: 'bg-emerald-100', border: 'border-emerald-700', text: 'text-emerald-950', icon: <Heart size={14} className="text-emerald-800" /> };
  if (score <= 4) return { bg: 'bg-rose-100', border: 'border-rose-700', text: 'text-rose-950', icon: <Swords size={14} className="text-rose-800" /> };
  return { bg: 'bg-stone-100', border: 'border-stone-500', text: 'text-stone-950', icon: <Minus size={14} className="text-stone-700" /> };
};

const getSeasonIcon = (season: string) => {
  switch(season) {
    case 'Spring': return <Sprout className="text-emerald-700" size={24} />;
    case 'Summer': return <Sun className="text-amber-700" size={24} />;
    case 'Fall': return <Leaf className="text-orange-800" size={24} />;
    case 'Winter': return <Snowflake className="text-blue-700" size={24} />;
    default: return <Star className="text-purple-700" size={24} />;
  }
};

export default App;
