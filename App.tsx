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
  Briefcase, FileDigit, Dices, CloudRain, Sun, ThermometerSnowflake, HeartCrack, Goal,
  ZapOff, Calendar, MapPinned
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// --- Constants: 1d100 Tables ---

const PC_HOOKS = [
  "Inherited a derelict shack from a distant relative who died under mysterious circumstances.",
  "Searching for a sibling who was last seen entering the village tavern a month ago.",
  "Hired as an escort for a merchant who vanished the moment you reached the village outskirts.",
  "Born here; your family has farmed this soil for six generations, but the crop just failed.",
  "On the run from a debt collector in a distant city; this place seemed isolated enough to hide.",
  "A local NPC owes you a blood debt from a war fought years ago.",
  "You carry a letter for the local priest, but the seal is broken and the parchment is damp.",
  "You were left at the local orphanage as a babe and have finally returned to find your true name.",
  "An ancient map you found in a crypt points directly to the center of this village.",
  "You are a distant cousin of the village elder, come to attend a family funeral.",
  "A dream led you here; the village landmark from your nightmares is real.",
  "You are a disgraced soldier looking for work as a mercenary for the local businesses.",
  "Sent by a guild to investigate reports of a rare mineral found in the nearby river.",
  "Looking for the thief who stole your master's spellbook; the trail ends at the village gates.",
  "You have a recurring infection that only the local herbalist is rumored to be able to cure.",
  "Searching for the legendary 'Black Smith' of the village to repair a shattered heirloom.",
  "The village is on the path of your pilgrimage to a distant mountain shrine.",
  "You were part of a caravan that was raided nearby; you are the sole survivor.",
  "An old friend sent you a frantic message: 'Do not come to the village.' You came anyway.",
  "You are a bounty hunter trailing a dangerous chaotic mage through the region.",
  "Returning to reclaim the family home which was seized by the local lord for unpaid taxes.",
  "A local shop owner is your only contact for selling 'difficult' goods.",
  "You were cursed by a witch and told the only cure lies in the heart of this village.",
  "The local tavern is famous for a brew you've been tasked to sample for a noble.",
  "Looking for a quiet place to retire from a life of violence, but the atmosphere feels off.",
  "Your mentor's grave is here, and you've come to pay your respects.",
  "You are a tax collector sent from the capital to find out why the village is late.",
  "A fortune teller told you that you would meet your future spouse in this village.",
  "The village's 'Dark Secret' is something you've heard rumors of since childhood.",
  "Looking for an apprentice who ran away to join a cult rumored to operate nearby.",
  "You are a travelling bard looking for new stories in isolated places.",
  "Hired to deliver a chest of 'special' seeds to the local farrier.",
  "You believe your father's murderer is hiding among the local residents.",
  "A mysterious benefactor paid for your travel here and told you to 'wait for the signal.'",
  "You are an architect sent to survey the village landmarks for a historical society.",
  "Looking for a specific book in the local archive that supposedly contains the secret to a lost vault.",
  "You are a half-elf looking for the elven parent who abandoned you here.",
  "Sent to inspect the village's defenses against a rising tide of undead in the region.",
  "You have a blood-link to the village's founder and feel a strange pull toward the land.",
  "Searching for the truth about a 'ghost ship' seen on the river near the village.",
  "You were once a guard here and have returned to find out what happened to your old squad.",
  "An NPC is your former lover; things ended badly, but you need their help now.",
  "Looking for a rare herb that only grows in the shadow of the local landmarks.",
  "You are a scholar studying the unique demographics of this isolated community.",
  "You have a bounty on your head and heard the local law is 'flexible.'",
  "A merchant you trust told you that the village's blacksmith is selling enchanted steel.",
  "Your family crest is carved into one of the old stones in the village center.",
  "Sent to buy a specific type of livestock only bred in this valley.",
  "You are a monk looking for a quiet place to meditate, but the village's morale is disturbing.",
  "Searching for the components of a ritual that requires 'soil from a place of deep secrets.'",
  "You found a locket with a portrait of a local resident and want to return it.",
  "You are a spy for a rival lord, sent to assess the village's loyalty.",
  "Looking for work as a laborer; the harvest season is approaching.",
  "You were told a legendary hero lives here in hiding.",
  "Searching for your lost child; the last person to see them was a local shop owner.",
  "You carry a curse that makes you feel at home only in dark, damp places like this.",
  "Hired by a wizard to capture a 'living shadow' rumored to haunt the village outskirts.",
  "Looking for the source of a strange disease that started in this village and is spreading.",
  "You are a cartographer making a map of the Shadowdark and this is your last stop.",
  "A local resident owes you their life and you've come to collect a favor.",
  "Searching for the entrance to a 'sunken city' that is supposedly under the river.",
  "You are a former criminal looking for an honest life, but your past has followed you.",
  "Hired to bring a message of war to the village elder.",
  "You have a map to a treasure hidden within the village's own walls.",
  "Looking for a priest who can perform an exorcism on a possessed item you carry.",
  "Searching for the 'White Raven' – a legendary NPC only found in this village.",
  "You were born during an eclipse here and believe your destiny is tied to the site.",
  "Hired to investigate a series of mysterious disappearances at a nearby Point of Interest.",
  "You are a chef looking for a rare spice that grows near the riverbank.",
  "Searching for the tomb of a saint rumored to be hidden under a local landmark.",
  "You have a debt to a local business that you've finally come to repay.",
  "Looking for a safe place to stash a dangerous artifact.",
  "You are an artist wanting to capture the 'beauty of the gloom' in this village.",
  "Searching for a specific halfling who stole your family's favorite silver spoon.",
  "You are a hunter following the trail of a beast that has been terrorizing the region.",
  "Sent to deliver a crate of expensive wine to a local shop owner for a private party.",
  "You have a premonition that the village is about to be destroyed.",
  "Looking for a teacher who can help you master a strange power you've discovered.",
  "You are a halfling looking for a community that won't judge your 'special' talents.",
  "Searching for the 'Heart of the Village' – a gemstone rumored to keep the river flowing.",
  "You are a merchant looking to open a new trade route through this isolated valley.",
  "Hired to find a missing noble who was last seen entering the village.",
  "Looking for a priest who can cleanse your soul of a dark deed.",
  "Searching for a specific dwarf who knows the location of a lost mine.",
  "You are a traveller who got lost in the fog and stumbled upon the village.",
  "Hired to investigate why the local river has turned a strange shade of black.",
  "Looking for a quiet place to write your memoirs.",
  "Searching for a local legend who can tell you the history of the landmarks.",
  "You are a mercenary captain looking for new recruits in a desperate place.",
  "Hired to find out who is responsible for the 'Current Events' in the village.",
  "You are a pilgrim who has lost their way and needs shelter.",
  "Looking for a doctor who can heal a wound that won't close.",
  "Searching for a local shop owner who sold you a defective 'magic' item.",
  "You have a strange birthmark that matches the carvings on the village gates.",
  "Hired to deliver a 'message in a bottle' that you found in the river.",
  "You are a survivor of a plague looking for a new home.",
  "Searching for the truth about your parents' mysterious deaths in this village.",
  "You have been 'summoned' by a local NPC through a dream or vision.",
  "Hired to protect the village from an imminent threat mentioned in a main quest.",
  "You are here because you have nowhere else left to go."
];

const VILLAGE_EVENTS = [
  "A local child has gone missing, and their favorite toy was found near the river.",
  "The river has suddenly turned an oily black, and the fish are dying.",
  "A travelling circus has arrived, but their animals look starved and their clowns never smile.",
  "A strange fog has rolled in and hasn't lifted for three days; people are hearing voices in it.",
  "The local tavern has run out of ale, and the patrons are becoming violent.",
  "A group of fanatical cultists has set up a shrine at one of the landmarks.",
  "A local resident has been found dead, with their heart neatly removed.",
  "The village gates have been found smashed open from the *inside*.",
  "A rare eclipse is occurring, and the animals are acting in a frenzy.",
  "A mysterious merchant is selling 'dream-inducing' herbs that have the village addicted.",
  "The river level has dropped drastically, revealing ancient ruins beneath the surface.",
  "A pack of dire wolves has been howling outside the village walls every night.",
  "A local shop owner has suddenly become incredibly wealthy and refuses to say why.",
  "The village elder has fallen into a coma, and their skin is turning to stone.",
  "A fire has broken out in the warehouse, and the town's winter supplies are burning.",
  "A group of bedraggled refugees has arrived, claiming a 'shadow' is following them.",
  "The bells of the local church are ringing on their own at midnight.",
  "A local resident claims to have found a 'door to another world' in their cellar.",
  "The village's morale has plummeted after a beloved figure was accused of a crime.",
  "A strange 'black rain' is falling, and it's causing the plants to wither and die.",
  "A bounty hunter has arrived, looking for someone among the residents.",
  "The local farrier's horses have all died in their sleep, with no marks on them.",
  "A travelling bard is singing a song that contains secrets only the GM should know.",
  "A local landmark has suddenly started glowing with a sickly green light.",
  "The village well has dried up, and the residents are fighting over the last drops of water.",
  "A group of soldiers has arrived to 'tax' the village, but they look like bandits.",
  "A local shop owner has been found talking to a reflection that isn't their own.",
  "The village's 'Dark Secret' is being whispered about in the streets.",
  "A strange 'metal bird' has crashed into the river, and it's emitting a humming sound.",
  "A local resident has suddenly started speaking a language no one understands.",
  "A 'weeping' statue has been found at one of the landmarks; the tears are blood.",
  "The village's grain supply has been infested with a strange, glowing fungus.",
  "A group of 'holy' men has arrived, but they are demanding sacrifices.",
  "A local resident has been seen entering a Point of Interest and hasn't returned.",
  "The village gates have been sealed by a mysterious order of mages.",
  "A local shop owner has been accused of being a 'chaotic agent.'",
  "A strange 'clockwork' device has been found in the village square, and it's ticking.",
  "The river has started flowing backwards, carrying strange debris with it.",
  "A local resident has been found 'turned to shadow,' standing perfectly still.",
  "A group of miners has returned from the nearby mountains, looking terrified.",
  "The village's morale has suddenly turned 'Defiant' against an unseen threat.",
  "A mysterious 'plague' is causing people to lose their memories of the last year.",
  "A local shop owner has been found murdered, with a strange symbol carved into their forehead.",
  "The village's demographics are shifting as 'others' arrive in large numbers.",
  "A strange 'blue light' is seen in the sky every night, hovering over the village.",
  "A local resident claims to be the 'reincarnation' of the village founder.",
  "The village's landmarks are being vandalized with 'chaotic' symbols.",
  "A group of 'mercenaries' has arrived to protect the village, but they are causing trouble.",
  "A local shop owner has been found 'fused' to their own merchandise.",
  "The river is producing a constant, low-frequency hum that is driving people mad.",
  "A 'giant' has been seen in the distance, slowly walking toward the village.",
  "A local resident has been found 'empty' – alive but with no personality or soul.",
  "The village's 'Dark Secret' is starting to manifest physically in the environment.",
  "A group of 'halflings' has arrived, looking for a place to hide a dangerous item.",
  "A mysterious 'doorway' has appeared in the middle of the village square.",
  "A local shop owner is selling 'lucky' charms that actually bring bad luck.",
  "The river has frozen solid, even though it's the middle of summer.",
  "A 'ghost ship' has docked at the village pier, but no one is on board.",
  "A local resident has been seen 'floating' a few inches off the ground.",
  "The village's morale has turned 'Fearful' after a series of strange occurrences.",
  "A group of 'dwarves' has arrived, claiming the village is built on top of their mine.",
  "A local shop owner has been found 'inside out,' yet still alive.",
  "The village's landmarks are starting to 'move' or change position.",
  "A mysterious 'black box' has been found at the riverbank, and it's emitting heat.",
  "A local resident has been found 'transformed' into an animal.",
  "The village's grain supply is being eaten by a swarm of 'shadow insects.'",
  "A group of 'elves' has arrived, looking for a 'stolen' artifact.",
  "A local shop owner has been found 'living' in their own shadow.",
  "The river is producing 'bubbles' that contain images of the future.",
  "A 'giant eye' has opened in the sky, watching the village.",
  "A local resident has been seen 'talking' to the wind.",
  "The village's 'Dark Secret' is being broadcast through a magical resonance.",
  "A group of 'cultists' has taken over one of the businesses.",
  "A mysterious 'white wolf' has been seen leading people into the gloom.",
  "A local resident has been found 'turned to gold,' but it's cold to the touch.",
  "The village's morale has turned 'Resentful' against the current leadership.",
  "A group of 'travellers' has arrived, but they have no shadows.",
  "A local shop owner is selling 'items from the future.'",
  "The river is flowing with 'liquid light' instead of water.",
  "A 'giant hand' has emerged from the ground, holding a local resident.",
  "A local resident has been found 'merged' with a landmark.",
  "The village's 'Dark Secret' has been revealed to everyone.",
  "A group of 'bandits' has laid siege to the village.",
  "A mysterious 'portal' has opened in the tavern cellar.",
  "A local shop owner is actually a 'dragon' in disguise.",
  "The river is producing a 'fog' that makes people invisible.",
  "A 'giant snake' has been seen swimming in the river.",
  "A local resident has been found 'turned to glass.'",
  "The village's morale has turned 'Apathetic' as the darkness grows.",
  "A group of 'heroes' has arrived, but they look like they've already failed.",
  "A mysterious 'voice' is coming from the village well.",
  "A local shop owner is selling 'soul-trapping' mirrors.",
  "The river is producing 'gold coins' that disappear after an hour.",
  "A 'giant bird' has built a nest on top of a landmark.",
  "A local resident has been seen 'walking on water.'",
  "The village's 'Dark Secret' is about to consume the entire town.",
  "A group of 'demons' has been summoned by accident.",
  "A mysterious 'clock' is counting down to an unknown event.",
  "A local shop owner is selling 'the meaning of life.'",
  "The village has been 'shifted' into another dimension."
];

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

const WEATHER_TABLE = [
  "Clear skies, bright sun, gentle breeze",
  "Warm and humid, haze on the horizon",
  "Cool and crisp morning, warming by midday",
  "Overcast but dry, low gray clouds",
  "Light drizzle that comes and goes",
  "Steady rain, puddles forming",
  "Sudden downpour, visibility reduced",
  "Thunderstorm with occasional lightning",
  "Heavy fog, sound carries strangely",
  "Patchy fog that burns off by noon",
  "Strong winds, loose debris blowing",
  "Gusty winds with shifting directions",
  "Cold snap, breath visible in the air",
  "Heatwave, oppressive and draining",
  "Light snowfall, soft and quiet",
  "Heavy snow, travel slowed",
  "Sleet or freezing rain, surfaces slick",
  "Hailstorm, small pellets rattling down",
  "Unseasonably strange weather (GM’s choice)",
  "Dramatic shift: roll twice and combine"
];

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
  const [lastWeatherRoll, setLastWeatherRoll] = useState<number | null>(null);
  const [lastEventRoll, setLastEventRoll] = useState<number | null>(null);
  const [lastHookRoll, setLastHookRoll] = useState<number | null>(null);
  
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
    setLastWeatherRoll(null);
    setLastEventRoll(null);
    setLastHookRoll(null);
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

  const rollWeather = () => setLastWeatherRoll(Math.floor(Math.random() * 20) + 1);
  const rollEvent = () => setLastEventRoll(Math.floor(Math.random() * 100) + 1);
  const rollHook = () => setLastHookRoll(Math.floor(Math.random() * 100) + 1);

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
      case 'Lawful': return { icon: <Scale size={14} />, color: 'text-blue-900', bg: 'bg-blue-100' };
      case 'Chaotic': return { icon: <Zap size={14} />, color: 'text-purple-900', bg: 'bg-purple-100' };
      default: return { icon: <CircleDot size={14} />, color: 'text-stone-800', bg: 'bg-stone-200' };
    }
  };

  const getMoraleDetails = (morale: string) => {
    switch(morale) {
      case 'Hopeful': return { icon: <Sun size={24} />, color: 'text-emerald-900', bg: 'bg-emerald-100', border: 'border-emerald-800' };
      case 'Fearful': return { icon: <Skull size={24} />, color: 'text-red-900', bg: 'bg-red-100', border: 'border-red-800' };
      case 'Resentful': return { icon: <HeartCrack size={24} />, color: 'text-orange-900', bg: 'bg-orange-100', border: 'border-orange-800' };
      case 'Apathetic': return { icon: <Meh size={24} />, color: 'text-stone-700', bg: 'bg-stone-200', border: 'border-stone-500' };
      case 'Defiant': return { icon: <Shield size={24} />, color: 'text-indigo-900', bg: 'bg-indigo-100', border: 'border-indigo-800' };
      default: return { icon: <Activity size={24} />, color: 'text-stone-900', bg: 'bg-stone-100', border: 'border-stone-800' };
    }
  };

  const getRelationshipStyles = (rawScore: number) => {
    const score = Math.max(1, Math.min(10, Math.round(rawScore)));
    // Positive (Score 8+)
    if (score >= 8) return { 
      bg: 'bg-emerald-100', 
      border: 'border-emerald-600', 
      text: 'text-emerald-900', 
      icon: <Heart size={14} className="text-emerald-700" />, 
      effects: 'animate-pulse-subtle' 
    };
    // Negative (Score 3-)
    if (score <= 3) return { 
      bg: 'bg-rose-100', 
      border: 'border-rose-600', 
      text: 'text-rose-900', 
      icon: <Swords size={14} className="text-rose-700" />, 
      effects: 'matrix-desaturated' 
    };
    // Neutral (Score 4-7)
    return { 
      bg: 'bg-stone-100', 
      border: 'border-stone-400', 
      text: 'text-stone-800', 
      icon: <Minus size={14} className="text-stone-600" />, 
      effects: '' 
    };
  };

  const getStandingCategory = (npc: DetailedNPC) => {
    const avg = npc.relationships.reduce((acc, r) => acc + r.score, 0) / (npc.relationships.length || 1);
    if (avg <= 3.5) return { label: 'Pariah', color: 'text-red-900', icon: <Frown size={12}/> };
    if (avg >= 7.5) return { label: 'Pillar', color: 'text-amber-800', icon: <Crown size={12}/> };
    return { label: 'Resident', color: 'text-stone-900', icon: <Users size={12}/> };
  };

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

              <div className="mb-12 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 pb-1 uppercase">
                    <Scroll className="w-6 h-6" /> Narrative Manifest
                  </div>
                  <p className="text-2xl italic font-serif leading-relaxed text-stone-900 bg-white/30 p-8 border-l-8 border-stone-800 rounded-r shadow-inner">
                    "{village.description}"
                  </p>
                </div>
                
                {/* Morale Widget */}
                <div className="w-full md:w-64 break-inside-avoid">
                  <div className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 pb-1 uppercase">
                    <Activity className="w-6 h-6" /> Town Morale
                  </div>
                  {(() => {
                    const details = getMoraleDetails(village.morale);
                    return (
                      <div className={`p-6 rounded border-4 flex flex-col items-center justify-center text-center shadow-md ${details.bg} ${details.border} ${details.color}`}>
                        <div className="mb-2">{details.icon}</div>
                        <div className="text-2xl font-black medieval-font uppercase tracking-tighter">{village.morale}</div>
                        <p className="text-[10px] mt-2 font-bold opacity-70 italic">Collective spirit in the wake of gloom.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Current Events Section */}
              <div className="mb-12 break-inside-avoid">
                <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase">
                  <Calendar className="w-6 h-6" /> Current Events
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {village.currentEvents.map((event, idx) => (
                    <div key={idx} className="bg-amber-800/5 p-4 border-l-4 border-amber-900 shadow-sm relative overflow-hidden group">
                      <div className="text-[10px] font-black text-amber-900/40 mb-1 uppercase">SITUATION {idx + 1}</div>
                      <p className="text-base italic text-stone-900 font-bold leading-tight">"{event}"</p>
                      <ZapOff className="absolute -bottom-2 -right-2 w-8 h-8 text-amber-900/10" />
                    </div>
                  ))}
                </div>
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
                      <div className="p-6 bg-white/40 border-2 border-stone-800 font-bold italic text-stone-900 text-xl text-center flex items-center justify-center text-stone-950">
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

            {/* 1d100 ADDITIONAL VILLAGE EVENTS TABLE */}
            <section className="page-break-before print:print-page-border">
              <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-stone-800 mb-8 pb-4 gap-4">
                <h3 className="text-4xl font-bold medieval-font flex items-center gap-4 uppercase tracking-wider border-none p-0">
                  <Activity size={36} /> 1d100 Additional Village Events
                </h3>
                <button 
                  onClick={rollEvent}
                  className="no-print bg-amber-600 hover:bg-amber-700 text-white font-black py-2 px-6 rounded flex items-center gap-2 uppercase tracking-tighter shadow-lg transition-transform active:scale-95"
                >
                  <Dices size={20} /> Roll d100
                </button>
              </div>

              <div className="bg-white/40 p-1 border-2 border-stone-800 rounded-sm overflow-hidden h-auto">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible">
                  <table className="w-full text-left text-sm font-serif">
                    <thead className="bg-stone-800 text-amber-500 uppercase text-[10px] font-black sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-4 w-16 text-amber-500">d100</th>
                        <th className="py-3 px-4 text-amber-500">The Gritty Occurrence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-300">
                      {VILLAGE_EVENTS.map((event, idx) => {
                        const d100 = idx + 1;
                        const isRolled = lastEventRoll === d100;
                        return (
                          <tr 
                            key={idx} 
                            className={`transition-colors duration-500 text-stone-950 ${isRolled ? 'bg-amber-400 font-black' : 'hover:bg-amber-100/30'}`}
                          >
                            <td className="py-2 px-4 font-black border-r border-stone-300">{d100}</td>
                            <td className="py-2 px-4 italic font-bold leading-snug">{event}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-4 text-[10px] italic text-stone-600 font-bold text-right no-print">
                "Roll d100 whenever the narrative slows or a day passes."
              </p>
            </section>

            {/* 1d100 PC HOOKS TABLE */}
            <section className="page-break-before print:print-page-border">
              <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-stone-800 mb-8 pb-4 gap-4">
                <h3 className="text-4xl font-bold medieval-font flex items-center gap-4 uppercase tracking-wider border-none p-0">
                  <MapPinned size={36} /> 1d100 PC Ties & Hooks
                </h3>
                <button 
                  onClick={rollHook}
                  className="no-print bg-amber-600 hover:bg-amber-700 text-white font-black py-2 px-6 rounded flex items-center gap-2 uppercase tracking-tighter shadow-lg transition-transform active:scale-95"
                >
                  <Dices size={20} /> Roll d100
                </button>
              </div>

              <div className="bg-white/40 p-1 border-2 border-stone-800 rounded-sm overflow-hidden h-auto">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible">
                  <table className="w-full text-left text-sm font-serif">
                    <thead className="bg-stone-800 text-amber-500 uppercase text-[10px] font-black sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-4 w-16 text-amber-500">d100</th>
                        <th className="py-3 px-4 text-amber-500">The Reason You Are Here</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-300">
                      {PC_HOOKS.map((hook, idx) => {
                        const d100 = idx + 1;
                        const isRolled = lastHookRoll === d100;
                        return (
                          <tr 
                            key={idx} 
                            className={`transition-colors duration-500 text-stone-950 ${isRolled ? 'bg-amber-400 font-black' : 'hover:bg-amber-100/30'}`}
                          >
                            <td className="py-2 px-4 font-black border-r border-stone-300">{d100}</td>
                            <td className="py-2 px-4 italic font-bold leading-snug">{hook}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-4 text-[10px] italic text-stone-600 font-bold text-right no-print">
                "Roll d100 for each player character to establish their connection to the village."
              </p>
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
                      <th className="py-3 px-4 text-amber-500">Commodity Manifest</th>
                      <th className="py-3 px-4 text-amber-500">Appraised Price</th>
                      <th className="py-3 px-4 text-amber-500">Availability</th>
                      <th className="py-3 px-4 text-amber-500">Vendor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-stone-300">
                    {village.businesses.flatMap(b => b.marketItems.map((item, idx) => (
                      <tr key={`${b.name}-${idx}`} className="break-inside-avoid group text-stone-950 font-bold">
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-stone-900 text-base mb-1">{item.name}</div>
                          <div className="text-[10px] font-normal text-stone-700 italic leading-tight">{item.description}</div>
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

            {/* DM Secrets */}
            <section className="page-break-before bg-stone-900 text-stone-100 p-12 border-8 border-double border-red-900 shadow-2xl relative overflow-visible break-inside-avoid">
              <h3 className="text-4xl font-bold medieval-font mb-6 text-red-500 flex items-center gap-3 border-none pb-0 uppercase tracking-tighter">
                <Skull className="w-12 h-12" /> The Black Secret
              </h3>
              <p className="text-3xl italic font-serif leading-relaxed text-red-200">{village.darkSecret}</p>
              <div className="absolute top-2 right-4 text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Eyes Only</div>
            </section>

            {/* WEATHER TABLE SECTION */}
            <section className="page-break-before print:print-page-border">
              <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-stone-800 mb-8 pb-4 gap-4">
                <h3 className="text-4xl font-bold medieval-font flex items-center gap-4 uppercase tracking-wider border-none p-0">
                  <CloudRain size={36} /> Weather Patterns
                </h3>
                <button 
                  onClick={rollWeather}
                  className="no-print bg-amber-600 hover:bg-amber-700 text-white font-black py-2 px-6 rounded flex items-center gap-2 uppercase tracking-tighter shadow-lg transition-transform active:scale-95"
                >
                  <Dices size={20} /> Roll d20
                </button>
              </div>

              <div className="bg-white/40 p-1 border-2 border-stone-800 rounded-sm">
                <table className="w-full text-left text-sm font-serif">
                  <thead className="bg-stone-800 text-amber-500 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-3 px-4 w-16 text-amber-500">d20</th>
                      <th className="py-3 px-4 text-amber-500">Weather Manifestation</th>
                      <th className="py-3 px-4 no-print text-amber-500">Effect Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-300">
                    {WEATHER_TABLE.map((weather, idx) => {
                      const d20 = idx + 1;
                      const isRolled = lastWeatherRoll === d20;
                      return (
                        <tr 
                          key={idx} 
                          className={`transition-colors duration-500 text-stone-950 ${isRolled ? 'bg-amber-400 font-black' : 'hover:bg-amber-100/30'}`}
                        >
                          <td className="py-2 px-4 font-black border-r border-stone-300">{d20}</td>
                          <td className="py-2 px-4 italic font-bold">{weather}</td>
                          <td className="py-2 px-4 no-print">
                            {d20 <= 4 && <span className="text-[10px] font-black text-emerald-800 uppercase flex items-center gap-1"><Sun size={12}/> Clear</span>}
                            {d20 >= 5 && d20 <= 10 && <span className="text-[10px] font-black text-blue-800 uppercase flex items-center gap-1"><CloudRain size={12}/> Precipitation</span>}
                            {d20 >= 11 && d20 <= 12 && <span className="text-[10px] font-black text-stone-800 uppercase flex items-center gap-1"><Wind size={12}/> Wind</span>}
                            {d20 >= 13 && d20 <= 18 && <span className="text-[10px] font-black text-indigo-900 uppercase flex items-center gap-1"><ThermometerSnowflake size={12}/> Extremes</span>}
                            {d20 >= 19 && <span className="text-[10px] font-black text-red-900 uppercase flex items-center gap-1"><Zap size={12}/> Anomalous</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[10px] italic text-stone-600 font-bold text-right no-print">
                "Roll d20 once per game day or whenever travel resumes."
              </p>
            </section>

            {/* RESIDENTS SECTION */}
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
                            <div className={`text-xs font-black px-4 py-2 ${alignDetails.bg} rounded border-2 border-stone-800 shadow-sm flex items-center justify-center gap-2 ${alignDetails.color}`}>
                               {alignDetails.icon} {npc.alignment}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                           <div className="grid grid-cols-1 gap-10">
                              <div>
                                 <h5 className="text-xs font-black uppercase text-stone-400 mb-3 tracking-[0.2em]">Psychological Profile</h5>
                                 <p className="italic text-xl text-stone-800 border-l-8 border-stone-800 pl-6 mb-6 leading-relaxed font-serif">"{npc.personality}"</p>
                                 
                                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    <div className="px-4 py-2 bg-indigo-800 text-white text-xs font-bold rounded flex items-center justify-center gap-2 uppercase">
                                       <Goal size={12} /> {npc.motivation}
                                    </div>
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
                                          <div key={ridx} className={`p-3 rounded border-2 transition-all duration-500 ${styles.bg} ${styles.border} ${styles.effects} break-inside-avoid flex flex-col justify-between shadow-sm`}>
                                             <div className="flex justify-between font-black text-[10px] uppercase mb-1 items-center gap-1">
                                                <span className="flex items-center gap-1.5 truncate">
                                                   <span className="flex-shrink-0">{styles.icon}</span> 
                                                   <span className="truncate">{rel.targetName}</span>
                                                </span>
                                                <span className={`${styles.text} whitespace-nowrap bg-white/50 px-1 rounded`}>{rel.score} • {rel.feeling}</span>
                                             </div>
                                             <p className="italic text-xs opacity-80 leading-tight font-serif text-stone-950 font-bold">"{rel.reason}"</p>
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