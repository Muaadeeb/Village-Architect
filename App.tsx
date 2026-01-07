
import React, { useState, useRef } from 'react';
import { generateVillageDetails, generateVillageMap, generatePOI } from './services/geminiService';
import { VillageData, PointOfInterest, DemographicEntry } from './types';
import { Scroll, RefreshCw, Flame, Printer, Compass, Download, Upload } from 'lucide-react';

// modular utilities
import { PageNumber } from './VillageUtils';

// modular sections (Full separation of concerns)
import { NarrativeSection } from './sections/NarrativeSection';
import { CensusSection } from './sections/CensusSection';
import { MoraleSection } from './sections/MoraleSection';
import { RelationsSection } from './sections/RelationsSection';
import { FestivalsSection } from './sections/FestivalsSection';
import { AtmosphereSection } from './sections/AtmosphereSection';
import { EventsSection } from './sections/EventsSection';
import { MapSection } from './sections/MapSection';
import { LandmarksSection } from './sections/LandmarksSection';
import { QuestsSection } from './sections/QuestsSection';
import { CrawlBoxSection } from './sections/CrawlBoxSection';
import { BlackSecretSection } from './sections/BlackSecretSection';
import { NPCDossierSection } from './sections/NPCDossierSection';
import { MarketLedgerSection } from './sections/MarketLedgerSection';
import { EncountersDaySection } from './sections/EncountersDaySection';
import { EncountersNightSection } from './sections/EncountersNightSection';
import { MonstersSection } from './sections/MonstersSection';
import { ChronicleSection } from './sections/ChronicleSection';
import { WeatherSpringSection } from './sections/WeatherSpringSection';
import { WeatherSummerSection } from './sections/WeatherSummerSection';
import { WeatherFallSection } from './sections/WeatherFallSection';
import { WeatherWinterSection } from './sections/WeatherWinterSection';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [village, setVillage] = useState<VillageData | null>(null);
  const [poi, setPoi] = useState<PointOfInterest | undefined>(undefined);
  const [editableNotes, setEditableNotes] = useState("");
  const [manualDemo, setManualDemo] = useState<DemographicEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const pop = Math.floor(Math.random() * 100 + 200);
      const initialDemo = { humans: Math.floor(pop*0.8), halflings: Math.floor(pop*0.1), dwarves: Math.floor(pop*0.05), elves: Math.floor(pop*0.03), others: [] };
      const data = await generateVillageDetails("Cinderglade", pop, initialDemo);
      setVillage(data);
      setEditableNotes(data.gmNotes || "");
      setManualDemo(data.demographics);
      setPoi(undefined);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleManualRedraw = () => {
    if (!village) return;
    const totalPop = manualDemo.reduce((sum, d) => sum + d.count, 0);
    setVillage({ 
      ...village, 
      population: totalPop, 
      demographics: [...manualDemo] 
    });
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
    setLoading(true);
    try {
      const data = await generatePOI(village);
      setPoi(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const saveVillage = () => {
    if (!village) return;
    const villageToSave = {
      ...village,
      gmNotes: editableNotes,
      poi: poi // include POI if it exists
    };
    const blob = new Blob([JSON.stringify(villageToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${village.name.replace(/\s+/g, '_')}_Dossier.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadVillage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as VillageData;
        setVillage(data);
        setManualDemo(data.demographics || []);
        setEditableNotes(data.gmNotes || "");
        if (data.poi) {
          setPoi(data.poi);
        } else {
          setPoi(undefined);
        }
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        alert("Failed to load village: Invalid JSON file.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between items-center p-8 no-print">
        <h1 className="text-4xl font-bold medieval-font text-amber-500 flex items-center gap-3"><Flame /> Shadowdark Architect</h1>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={loadVillage} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            title="Import Village JSON"
            className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg font-bold border border-stone-700 hover:bg-stone-700 transition-all shadow-lg flex items-center gap-2"
          >
            <Upload size={18} /> <span className="hidden sm:inline">Import</span>
          </button>
          
          {village && (
            <button 
              onClick={saveVillage} 
              title="Download Village JSON"
              className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg font-bold border border-stone-700 hover:bg-stone-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Download size={18} /> <span className="hidden sm:inline">Download</span>
            </button>
          )}

          <button onClick={() => window.print()} className="bg-stone-800 text-amber-500 px-5 py-2 rounded-lg font-bold border border-amber-900/50 hover:bg-stone-700 transition-all shadow-lg"><Printer size={20} /></button>
          <button onClick={handleGenerate} className="bg-amber-600 text-white px-8 py-2 rounded-lg font-bold medieval-font text-xl shadow-xl hover:bg-amber-700 transition-all flex items-center gap-2">{loading ? <RefreshCw className="animate-spin" /> : <Scroll />} Manifest Village</button>
        </div>
      </div>

      {village && (
        <div className="w-full flex flex-col items-center gap-0">
          
          {/* PAGE 1: CORE IDENTITY */}
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
                <NarrativeSection description={village.description} />
                <MoraleSection morale={village.morale} />
                <AtmosphereSection atmosphere={village.atmosphere} geography={village.geography} />
              </div>
              <div className="space-y-8">
                <CensusSection village={village} manualDemo={manualDemo} setManualDemo={setManualDemo} onRedraw={handleManualRedraw} />
                <EventsSection events={village.currentEvents} />
              </div>
            </div>
          </section>

          {/* PAGE 2: RELATIONS & FESTIVALS */}
          <RelationsSection relations={village.settlementRelations} page={2} />
          <FestivalsSection festivals={village.festivals} page={3} />

          {/* PAGE 4: MAP */}
          <MapSection mapUrl={village.mapUrl} villageName={village.name} page={4} onGenerate={handleGenerateMap} />

          {/* PAGE 5: BLACK SECRET */}
          <BlackSecretSection secret={village.darkSecret} page={5} />

          {/* LANDMARKS & QUESTS PAGE */}
          <section className="parchment relative w-full max-w-5xl">
            <PageNumber n={6} />
            <div className="space-y-12">
              <LandmarksSection landmarks={village.landmarks} />
              <QuestsSection mainQuests={village.mainQuests} sideTreks={village.sideTreks} />
            </div>
          </section>

          {/* POI / CRAWL IN A BOX */}
          <CrawlBoxSection poi={poi} page={7} onGenerate={handleGeneratePOI} loading={loading} />

          {/* NPC DOSSIERS */}
          {village.residents.map((npc, idx) => (
            <NPCDossierSection key={idx} npc={npc} page={8 + idx} />
          ))}

          {/* MARKETPLACE LEDGER */}
          <MarketLedgerSection businesses={village.businesses} page={8 + village.residents.length} />

          {/* ENCOUNTER ARCHIVES */}
          <section className="parchment relative w-full max-w-5xl">
             <h3 className="text-5xl font-bold medieval-font border-b-6 border-stone-800 mb-10 pb-4 text-black flex items-center gap-6 uppercase"><Compass size={48} /> Random Encounter Archives</h3>
             <div className="grid grid-cols-1 gap-12">
                <EncountersDaySection />
                <EncountersNightSection />
                <MonstersSection />
             </div>
          </section>

          {/* WEATHER ARCHIVES */}
          <section className="parchment relative w-full max-w-5xl">
             <h3 className="text-5xl font-bold medieval-font border-b-6 border-stone-800 mb-10 pb-4 text-black flex items-center gap-6 uppercase"><Compass size={48} /> Seasonal Weather Archives</h3>
             <div className="grid grid-cols-2 gap-6">
                <WeatherSpringSection />
                <WeatherSummerSection />
                <WeatherFallSection />
                <WeatherWinterSection />
             </div>
          </section>

          {/* CHRONICLE */}
          <ChronicleSection notes={editableNotes} onChange={setEditableNotes} page={9 + village.residents.length} />
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-stone-900/98 z-50 flex items-center justify-center flex-col gap-10 p-12 backdrop-blur-md">
          <Flame className="w-48 h-48 text-amber-500 animate-pulse" />
          <h2 className="text-6xl medieval-font text-amber-500 text-center uppercase tracking-widest drop-shadow-2xl">Manifesting Dossier...</h2>
          <p className="text-stone-400 italic text-center max-w-2xl text-2xl animate-pulse">The Oracle is deep in thought, mapping the Shadowdark. Please wait while the ancient ink flows...</p>
        </div>
      )}
    </div>
  );
};

export default App;
