
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

// --- Encounter and Weather Data ---
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
  { icon: <Axe size={16} />, who: "Woodchopper", text: "Dragging a massive log that seems to be bleeding." },
  { icon: <Landmark size={16} />, who: "Statue of Loss", text: "A stone figure that seems to have moved." },
  { icon: <Crown size={16} />, who: "Tax Collector", text: "Demands a 'gate fee' from the party." },
  { icon: <Ghost size={16} />, who: "Mourning Widow", text: "She clutches a PC's hand, mistaking them for kin." },
  { icon: <Heart size={16} />, who: "Charismatic Bard", text: "Singing a song with secret details of a PC's past." },
  { icon: <CloudRain size={16} />, who: "Sudden Deluge", text: "The sky opens; visibility drops significantly." }
];

const ENCOUNTERS_NIGHT_INSIDE = [
  { icon: <UserSearch size={16} />, who: "Roof Stalker", text: "A silhouette leaps between rooftops." },
  { icon: <Ghost size={16} />, who: "Muffled Scream", text: "A cry for help echoes from an alley." },
  { icon: <Users size={16} />, who: "Hooded Cultists", text: "Six figures carry a heavy, blood-stained sack." },
  { icon: <ZapOff size={16} />, who: "Sleeping Sentry", text: "A guard is fast asleep against a rain barrel." },
  { icon: <Activity size={16} />, who: "Giant Rat", text: "A massive rat with glowing eyes gnaws a bone." },
  { icon: <Moon size={16} />, who: "The Night Watch", text: "A patrol with lanterns demands a night pass." },
  { icon: <Fingerprint size={16} />, who: "Lock-picker", text: "A thief is caught jemmying open a shop door." },
  { icon: <Ghost size={16} />, who: "Spectral Child", text: "A translucent girl chases a ghostly ball." },
  { icon: <Skull size={16} />, who: "Ghoul", text: "A rubbery undead stalks the dark corners." },
  { icon: <CloudRain size={16} />, who: "Choking Fog", text: "Thick yellow fog rolls in, smelling of sulfur." },
  { icon: <Zap size={16} />, who: "Will-o'-Wisp", text: "Lures the curious into a deep sewer grate." },
  { icon: <ShieldAlert size={16} />, who: "Panic Call", text: "A resident bolts from a house, screaming." },
  { icon: <Wind size={16} />, who: "Howling Wind", text: "Blows out all non-magical torches for 1 round." },
  { icon: <Bone size={16} />, who: "Scavenger", text: "A hunched figure collecting teeth from the gutter." },
  { icon: <Target size={16} />, who: "Assassin", text: "Waits in a doorway with a poisoned blade." },
  { icon: <Activity size={16} />, who: "Street Dog swarm", text: "Hungry curs surround the party, snarling." },
  { icon: <CloudFog size={16} />, who: "Grave Mist", text: "Cold vapor that slows movement." },
  { icon: <Frown size={16} />, who: "Lost Drunk", text: "Stumbles into the party, smelling of bile." },
  { icon: <Spark size={16} />, who: "Eerie Glow", text: "A green light flickers in a boarded window." },
  { icon: <Skull size={16} />, who: "The Reaper", text: "A hooded figure points a bony finger at a PC." }
];

const UNIQUE_MONSTERS = [
  "A patch of darkness detaches from a wall (Shadow).", "Rubbery-skinned undead dragging a limb (Ghoul).", "A massive rat with mangy fur (Giant Rat).", "Lumbering brute chewing on a raw horse leg (Ogre).", "A half-man, half-wolf predator (Werewolf).", "A puddle of acidic slime moving toward metal (Gray Ooze).", "Rattling bones rising from refuse (Skeleton).", "A bloated, water-logged corpse (Zombie).", "A green figure aiming a blowgun (Goblin).", "A hairy brute with a heavy mace (Bugbear).", "Ancient warrior with life-draining eyes (Wight).", "A mosquito-bird hybrid diving for a neck (Stirge).", "A massive arachnid dropping from a web (Giant Spider).", "A translucent horror that bypasses armor (Wraith).", "A rubbery-skinned giant with regeneration (Troll).", "A beast firing iron spikes from its tail (Manticore).", "An eight-legged lizard with a petrifying stare (Basilisk).", "A skeletal mage chanting necrotic words (Lich Apprentice).", "A towering brute looking for a snack (Hill Giant).", "A corrosive mass that splits when struck (Black Pudding).", "A multi-headed serpent with acidic breath (Hydra).", "A winged lion with a human face (Chimera).", "A floating eye with smaller eyestalks (Beholder Kin).", "A massive, armored toxic centipede (Giant Centipede).", "A creature disguised as a treasure chest (Mimic).", "A winged serpent that hums with static (Couatl).", "A heap of rotting vegetation moving (Shambling Mound).", "A creature made of living flame (Fire Elemental).", "A spirit bound to rusted plate (Animated Armor).", "A massive bear with an owl head (Owlbear).", "A tiny, mischievous demon (Imp).", "A half-man, half-bull with a great axe (Minotaur).", "A floating skull wreathed in green fire (Flameskull).", "A beautiful woman with snakes for hair (Medusa).", "A giant scorpion with a purple glowing stinger.", "A swarm of tiny, blood-drinking bats.", "A creature made of clay and dirt (Golem).", "A headless rider on a phantom steed (Dullahan).", "A massive, burrowing worm (Ankheg).", "A group of tiny aggressive lizardfolk (Kobolds).", "A woman with the lower body of a spider (Drider).", "A massive eagle with a 30-foot wingspan.", "A creature that looks like a man but has no face (Doppelganger).", "A floating entity with tentacles (Mind Flayer).", "A massive toad that can swallow a PC whole.", "A spirit that screams like dying men (Banshee).", "A group of small stone-eating creatures (Xorn).", "A massive multi-colored winged lizard (Wyvern).", "A creature of shadow that drains strength.", "A giant constrictor snake hiding in rafters.", "A rusted clockwork soldier clicking rhythmically.", "A group of primitives with bone spears.", "A massive crab with barnacle eyes.", "A floating jellyfish drifting through air (Gas Spore).", "A creature made of crawling insects.", "A man-sized moth with hypnotic patterns.", "A giant owl watching silently from a tree.", "A group of feral blue dwarfs (Dark Creepers).", "A massive elk with antlers of obsidian.", "A creature that mimics a crying baby.", "A swarm of glowing beetles that burn.", "A massive one-eyed giant throwing boulders (Cyclops).", "A spirit that possesses party shadows.", "A creature made of animated bloody chains.", "A giant intelligent raven speaking riddles.", "A group of cultists with masks of skin.", "A massive burrowing mole with iron claws.", "A floating translucent brain (Intellect Devourer).", "A creature looking like a heap of coins.", "A giant bat with a deafening sonar cry.", "A group of undead sailors with seawater.", "A massive white-furred ape (Yeti).", "A creature made of sharp jagged glass shards.", "A giant wasp with a dagger-sized stinger.", "A group of small imps that steal light (Darkmantle).", "A massive three-eyed poisonous toad.", "A spirit bound to a mirror showing death.", "A giant multi-colored humming centipede.", "A group of ghouls in wedding finery.", "A massive stone-skinned boar with tusks.", "A creature made of living pulsing shadows.", "A giant dragonfly that can hover silently.", "A group of small mechanical spiders.", "A massive white worm that breathes frost.", "A spirit looking like a lost loved one.", "A giant black wolf with glowing eyes.", "A group of skeletons playing rusted trumpets.", "A massive armored beetle spitting acid.", "A creature made of interlocking bones.", "A giant blue-skinned four-armed humanoid.", "A spirit that drains heat from the room.", "A giant translucent slug leaving salt trails.", "A group of tiny flying demons with teeth.", "A massive winged gargoyle like a statue.", "A creature with no body, only a head.", "A giant red-eyed salamander dripping lava.", "A spirit making a PC forget their name.", "A giant multi-legged lizard climbing walls.", "A group of zombies with an iron coffin.", "A massive ancient shadow swallowing light."
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
  const [manualDemo, setManualDemo] = useState({ h: 170, ha: 16, d: 8, e: 4, o: 0 });
  const [portraitLoading, setPortraitLoading] = useState<Record<number, boolean>>({});
  const [voiceLoading, setVoiceLoading] = useState<Record<number, boolean>>({});
  
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
        <h1 className="text-4xl font-bold medieval-font text-amber-500 flex items-center gap-3"><Flame /> Shadowdark Architect</h1>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="bg-stone-800 text-amber-500 px-5 py-2 rounded-lg font-bold border border-amber-900/50 hover:bg-stone-700 transition-all shadow-lg"><Printer size={20} /></button>
          <button onClick={handleGenerate} className="bg-amber-600 text-white px-8 py-2 rounded-lg font-bold medieval-font text-xl shadow-xl hover:bg-amber-700 transition-all flex items-center gap-2">{loading ? <RefreshCw className="animate-spin" /> : <Scroll />} Manifest Village</button>
        </div>
      </div>

      {village && (
        <div className="w-full flex flex-col items-center gap-0">
          
          {/* PAGE 1: TITLE & CENSUS - TIGHTENED FOR PDF */}
          <section className="parchment relative w-full max-w-5xl">
            <PageNumber n={1} />
            <div className="text-center mb-8 border-b-8 border-double border-stone-800 pb-6">
              <h2 className="text-8xl font-bold medieval-font uppercase text-black leading-none mb-2">{village.name}</h2>
              <div className="flex items-center justify-center gap-4 text-base font-black uppercase tracking-[0.5em] text-stone-600">
                <span>Shadowdark RPG Dossier</span>
                <div className="w-2 h-2 rounded-full bg-stone-800"></div>
                <span>Volume I</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <div className="space-y-8">
                <h3 className="text-2xl font-bold medieval-font border-b-4 border-stone-800 pb-1 uppercase text-black">Narrative Manifest</h3>
                <p className="text-2xl italic font-serif leading-relaxed text-black bg-white/40 p-10 border-l-[10px] border-stone-800 shadow-inner font-bold">"{village.description}"</p>
                <div className="p-8 bg-stone-100 border-4 border-stone-800 rounded-lg flex flex-col items-center shadow-xl break-inside-avoid">
                  <h4 className="text-xs font-black uppercase text-stone-500 mb-1 tracking-widest">Town Morale</h4>
                  <div className="text-6xl font-black medieval-font uppercase text-black">{village.morale}</div>
                </div>
              </div>
              <div className="space-y-8 break-inside-avoid">
                <h3 className="text-2xl font-bold medieval-font border-b-4 border-stone-800 pb-1 uppercase text-black">Census</h3>
                <div className="h-[350px] w-full bg-white/30 p-6 border-4 border-stone-800 rounded shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={60} outerRadius={100} dataKey="value" stroke="#fff" strokeWidth={2}>
                        {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Legend layout="vertical" align="right" verticalAlign="middle" iconType="square" 
                              formatter={(val, entry: any) => <span className="text-sm font-black text-black uppercase ml-1">{val}: {entry.payload.value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* PAGE 2: RELATIONS */}
          <section className="parchment relative w-full max-w-5xl">
            <PageNumber n={2} />
            <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-3 uppercase text-black flex items-center gap-4"><Globe size={40} /> Nearby Settlement Relations</h3>
            <div className="grid grid-cols-2 gap-8">
              {village.settlementRelations.map((rel, idx) => (
                <div key={idx} className="p-8 bg-white/40 border-4 border-stone-800 rounded-lg shadow-lg flex flex-col break-inside-avoid h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-3xl font-bold medieval-font text-black">{rel.settlementName}</h4>
                    <span className={`text-xs font-black px-3 py-1 rounded border-2 uppercase ${rel.type === 'Harmful' ? 'bg-red-100 border-red-800 text-red-900' : 'bg-stone-200 border-stone-800 text-stone-900'}`}>{rel.type}</span>
                  </div>
                  <p className="text-xs font-black uppercase text-stone-500 mb-4 italic border-b border-stone-300 pb-1">Status: {rel.status}</p>
                  <p className="text-lg italic text-black font-bold leading-relaxed">"{rel.description}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 3: FESTIVALS */}
          <section className="parchment relative w-full max-w-5xl">
            <PageNumber n={3} />
            <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-3 uppercase text-black flex items-center gap-4"><CalendarDays size={40} /> Cycle of Tradition: Local Festivals</h3>
            <div className="grid grid-cols-2 gap-6">
              {village.festivals.map((fest, idx) => (
                <div key={idx} className="p-6 bg-white/40 border-2 border-stone-400 rounded-sm relative break-inside-avoid">
                  <div className="flex justify-between items-center mb-3 border-b border-stone-300 pb-1">
                    <span className="font-bold text-black uppercase medieval-font text-2xl">{fest.name}</span>
                    {getSeasonIcon(fest.season)}
                  </div>
                  <p className="text-xs font-black text-stone-600 uppercase mb-3">{fest.timing} of {fest.season}</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-amber-950 uppercase tracking-widest mb-0.5">Ancient Lore</p>
                      <p className="text-base italic font-bold text-stone-950 leading-snug">"{fest.lore}"</p>
                    </div>
                    <div className="bg-stone-100 p-3 border border-stone-300 rounded">
                      <p className="text-[9px] font-black text-stone-500 uppercase">Modern Ritual</p>
                      <p className="text-sm font-bold text-stone-900">Practice: {fest.modernPractice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAGE 4: MAP */}
          <section className="parchment relative w-full max-w-5xl flex flex-col justify-center">
            <PageNumber n={4} />
            <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-6 pb-3 uppercase text-black"><Map size={40} className="inline mr-4" /> Local Chart (Map)</h3>
            <p className="text-lg italic font-black text-stone-600 mb-6">Hand-drawn street map of {village.name} detailing shops and points of survival.</p>
            <div className="w-full aspect-[16/9] bg-stone-900/10 border-8 border-stone-800 rounded shadow-2xl overflow-hidden relative">
              {village.mapUrl && <img src={village.mapUrl} className="w-full h-full object-cover" />}
            </div>
          </section>

          {/* PAGE 5: BLACK SECRET - INCREASED CONTRAST FOR PRINT */}
          <section className="parchment relative w-full max-w-5xl bg-stone-950 flex flex-col items-center justify-center text-center">
            <PageNumber n={5} />
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
               <div className="grid grid-cols-10 gap-6 p-8">{Array(80).fill(0).map((_, i) => <Skull key={i} size={40} className="text-red-900" />)}</div>
            </div>
            <div className="relative z-10 p-16">
               <h3 className="text-7xl font-bold medieval-font mb-12 text-red-700 flex items-center justify-center gap-6 uppercase"><Skull size={80} /> The Black Secret</h3>
               <p className="text-6xl italic font-serif leading-tight text-red-300 font-bold drop-shadow-[0_4px_10px_rgba(0,0,0,1)]">"{village.darkSecret}"</p>
            </div>
          </section>

          {/* NPC DOSSIERS - ONE PER PAGE */}
          {village.residents.map((npc, idx) => (
            <section key={idx} className="parchment relative w-full max-w-5xl npc-section">
              <PageNumber n={6 + idx} />
              <div className="flex flex-col gap-6">
                <div className="p-8 border-4 border-stone-800 bg-white/60 rounded-sm shadow-2xl flex flex-col md:flex-row gap-8 items-start break-inside-avoid">
                  {/* IDENTITY */}
                  <div className="w-full md:w-1/3 flex flex-col items-center shrink-0">
                    <div className="relative w-full aspect-square bg-stone-900/10 mb-6 border-6 border-stone-800 overflow-hidden shadow-2xl">
                      {npc.portraitUrl ? <img src={npc.portraitUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><UserCircle size={100} /></div>}
                    </div>
                    <h4 className="text-5xl font-bold medieval-font text-black uppercase leading-tight mb-1 text-center">{npc.name}</h4>
                    <p className="text-base font-black text-stone-600 uppercase mb-6 tracking-[0.25em]">{npc.sex} • {npc.race} • {npc.role}</p>
                    <div className="flex flex-col gap-3 w-full">
                      <div className={`text-xs font-black px-5 py-3 border-2 border-stone-800 rounded bg-white w-full flex items-center justify-center gap-3 shadow-md ${getStandingCategory(npc).color}`}>{getStandingCategory(npc).icon} {getStandingCategory(npc).label}</div>
                      <div className={`text-xs font-black px-5 py-3 border-2 rounded w-full flex items-center justify-center gap-3 uppercase tracking-[0.3em] shadow-md ${npc.alignment === 'Lawful' ? 'bg-blue-100 border-blue-800 text-blue-900' : npc.alignment === 'Chaotic' ? 'bg-red-100 border-red-800 text-red-900' : 'bg-stone-100 border-stone-800 text-stone-900'}`}><Scale size={16}/> {npc.alignment}</div>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h5 className="text-[10px] font-black uppercase text-stone-500 mb-2 tracking-[0.4em] flex items-center gap-3"><BookOpen size={16}/> Psychological Profile</h5>
                      <p className="italic text-3xl text-black font-bold leading-relaxed border-l-[10px] border-stone-800 pl-8 bg-white/40 p-8 rounded shadow-inner">"{npc.personality}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-stone-800 text-amber-500 rounded-lg border-2 border-stone-900 shadow-xl">
                        <span className="block opacity-60 mb-1 uppercase text-[9px] tracking-[0.3em]">Motivation</span>
                        <p className="text-lg font-bold flex items-center gap-2 truncate"><Goal size={18}/> {npc.motivation}</p>
                      </div>
                      <div className="p-6 bg-stone-800 text-amber-500 rounded-lg border-2 border-stone-900 shadow-xl">
                        <span className="block opacity-60 mb-1 uppercase text-[9px] tracking-[0.3em]">Characteristic</span>
                        <p className="text-lg font-bold flex items-center gap-2 truncate"><Fingerprint size={18}/> {npc.trait}</p>
                      </div>
                      
                      {/* STATS BOX */}
                      <div className="p-6 bg-white border-4 border-stone-800 rounded shadow-2xl flex justify-around items-center">
                        <div className="flex flex-col items-center">
                          <Shield size={32} className="text-stone-800 mb-1" />
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs uppercase font-bold text-stone-500">AC</span>
                            <span className="text-4xl font-black">{npc.stats.ac}</span>
                          </div>
                        </div>
                        <div className="w-0.5 h-12 bg-stone-200 rounded-full"></div>
                        <div className="flex flex-col items-center">
                          <Heart size={32} className="text-red-700 mb-1" />
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs uppercase font-bold text-stone-500">HP</span>
                            <span className="text-4xl font-black">{npc.stats.hp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-red-100 text-red-950 rounded border-2 border-red-800 shadow-2xl border-dashed">
                        <span className="block opacity-70 mb-1 uppercase text-[9px] tracking-[0.3em] text-red-800">Shadow Secret</span>
                        <p className="text-base font-bold italic line-clamp-2"><Skull size={18} className="inline mr-2 text-red-900"/> {npc.secret}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SOCIAL MATRIX - FULL WIDTH */}
                <div className="w-full">
                  <h5 className="text-sm font-black uppercase text-stone-500 mb-4 tracking-[0.4em] flex items-center gap-3 border-b-4 border-stone-300 pb-2"><Swords size={20}/> Social Matrix Connections</h5>
                  <div className="grid grid-cols-4 gap-3">
                    {npc.relationships.slice(0, 12).map((rel, r) => (
                      <div key={r} className={`p-3 border-2 rounded shadow flex flex-col min-h-[100px] break-inside-avoid bg-white/80 ${getRelationshipStyles(rel.score).bg} ${getRelationshipStyles(rel.score).border}`}>
                        <div className="flex justify-between items-start text-[10px] font-black text-black uppercase mb-1">
                          <span className="truncate w-[70%] flex items-center gap-1 font-bold">{getRelationshipStyles(rel.score).icon} {rel.targetName}</span>
                          <span className="bg-white px-1.5 border rounded font-black text-base leading-none">{rel.score}</span>
                        </div>
                        <p className="text-[10px] italic font-bold text-stone-900 leading-tight line-clamp-3 mt-auto">"{rel.reason}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* LEDGER PAGE */}
          <section className="parchment relative w-full max-w-5xl">
            <h3 className="text-5xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-3 uppercase text-black flex items-center gap-5"><ShoppingBag size={48} /> Marketplace Ledger</h3>
            <div className="grid grid-cols-1 gap-8">
              {village.businesses.slice(0, 4).map((biz, b) => (
                <div key={b} className="p-8 bg-white/60 border-4 border-stone-800 rounded shadow-2xl break-inside-avoid">
                  <div className="flex justify-between items-end border-b-4 border-stone-800 pb-4 mb-6">
                    <div><h4 className="text-4xl font-bold medieval-font text-black uppercase">{biz.name}</h4><p className="text-xs font-black text-stone-500 uppercase tracking-widest">{biz.type}</p></div>
                    <span className="text-sm font-black uppercase text-stone-700 bg-white px-6 py-2 border-2 border-stone-800 rounded-full shadow-lg">Proprietor: {biz.owner.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-6">
                    {biz.marketItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xl border-b-2 border-dashed border-stone-300 pb-2">
                        <div className="flex items-center gap-3 font-black">
                          <CircleDot size={12} className="text-stone-400" />
                          <span className="text-lg">{item.name}</span>
                        </div>
                        <span className="font-black medieval-font text-3xl">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-amber-100/60 rounded border-l-[12px] border-amber-800 shadow-inner flex gap-6 items-center">
                    <ShieldAlert className="text-amber-900 shrink-0" size={32} />
                    <p className="text-xl italic font-bold text-amber-950">"{biz.rumor}"</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TABLES PAGE */}
          <section className="parchment relative w-full max-w-5xl">
             <h3 className="text-5xl font-bold medieval-font border-b-6 border-stone-800 mb-10 pb-4 text-black flex items-center gap-6 uppercase"><Compass size={48} /> Random Encounter Archives</h3>
             <div className="grid grid-cols-1 gap-12">
                {[
                  { title: "Day: Inside Walls", table: ENCOUNTERS_DAY_INSIDE, size: 20 },
                  { title: "Night: Inside Walls", table: ENCOUNTERS_NIGHT_INSIDE, size: 20 }
                ].map((cat, ci) => (
                  <div key={ci} className="break-inside-avoid">
                    <h4 className="text-3xl font-bold medieval-font text-black uppercase mb-6 border-l-[12px] border-stone-800 pl-6">{cat.title}</h4>
                    <table className="w-full text-left font-serif border-4 border-stone-800 shadow-xl">
                      <thead className="bg-stone-800 text-amber-500 font-black uppercase text-base">
                        <tr><th className="py-4 px-6 border-r-2 border-stone-700 w-24">d{cat.size}</th><th className="py-4 px-6">Encounter Detail</th></tr>
                      </thead>
                      <tbody className="bg-white/80 text-xl">
                        {cat.table.map((e, ei) => (
                          <tr key={ei} className="border-b border-stone-200">
                            <td className="py-4 px-6 text-center border-r-2 border-stone-300 font-black">{ei+1}</td>
                            <td className="py-4 px-6 font-bold italic leading-tight">"{e.text}"</td>
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
          <p className="text-stone-400 italic text-center max-w-2xl text-2xl animate-pulse">TheOracle is deep in thought, mapping the Shadowdark. Please wait while the ancient ink flows...</p>
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
