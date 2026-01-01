
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { VillageData } from '../types';
import { PageNumber } from '../VillageUtils';

interface Props {
  village: VillageData;
  manualDemo: any;
  setManualDemo: (val: any) => void;
  onRedraw: () => void;
}

export const HeaderSection: React.FC<Props> = ({ village, manualDemo, setManualDemo, onRedraw }) => {
  const chartData = [
    { name: 'Humans', value: village.demographics.humans, color: '#1a1a1a' },
    { name: 'Halflings', value: village.demographics.halflings, color: '#44403c' },
    { name: 'Dwarves', value: village.demographics.dwarves, color: '#78716c' },
    { name: 'Elves', value: village.demographics.elves, color: '#a8a29e' },
  ].filter(d => d.value > 0);

  return (
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
          <div className="no-print p-6 bg-stone-800/5 border-2 border-dashed border-stone-400 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase">
              <label><span>Humans</span><input className="w-full border-2 border-stone-800 px-1 rounded" type="number" value={manualDemo.h} onChange={e => setManualDemo({...manualDemo, h: parseInt(e.target.value) || 0})}/></label>
              <label><span>Halflings</span><input className="w-full border-2 border-stone-800 px-1 rounded" type="number" value={manualDemo.ha} onChange={e => setManualDemo({...manualDemo, ha: parseInt(e.target.value) || 0})}/></label>
              <label><span>Dwarves</span><input className="w-full border-2 border-stone-800 px-1 rounded" type="number" value={manualDemo.d} onChange={e => setManualDemo({...manualDemo, d: parseInt(e.target.value) || 0})}/></label>
              <label><span>Elves</span><input className="w-full border-2 border-stone-800 px-1 rounded" type="number" value={manualDemo.e} onChange={e => setManualDemo({...manualDemo, e: parseInt(e.target.value) || 0})}/></label>
            </div>
            <button onClick={onRedraw} className="w-full bg-stone-800 text-amber-500 py-1.5 rounded uppercase mt-3 font-bold text-xs">Re-Draw Census</button>
          </div>
        </div>
      </div>
    </section>
  );
};
