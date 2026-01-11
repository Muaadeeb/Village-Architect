
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { VillageData, DemographicEntry } from '../types';
import { Plus, Trash2, Users } from 'lucide-react';

interface Props {
  village: VillageData;
  manualDemo: DemographicEntry[];
  setManualDemo: (val: DemographicEntry[]) => void;
  onRedraw: () => void;
}

const RACE_COLORS = [
  '#1a1a1a', 
  '#ef4444', 
  '#3b82f6', 
  '#10b981', 
  '#f59e0b', 
  '#8b5cf6', 
  '#ec4899', 
  '#06b6d4', 
  '#78350f', 
  '#71717a',
];

export const CensusSection: React.FC<Props> = ({ village, manualDemo, setManualDemo, onRedraw }) => {
  const chartData = village.demographics.map((d, i) => ({
    name: d.race,
    value: d.count,
    color: RACE_COLORS[i % RACE_COLORS.length]
  })).filter(d => d.value > 0);

  const handleRaceChange = (index: number, field: 'race' | 'count', value: string | number) => {
    const updated = [...manualDemo];
    if (field === 'race') {
      updated[index].race = value as string;
    } else {
      updated[index].count = Math.max(0, value as number);
    }
    setManualDemo(updated);
  };

  const addRace = () => {
    if (manualDemo.length < 10) {
      setManualDemo([...manualDemo, { race: 'New Race', count: 10 }]);
    }
  };

  const removeRace = (index: number) => {
    const updated = manualDemo.filter((_, i) => i !== index);
    setManualDemo(updated);
  };

  return (
    <div className="space-y-4 break-inside-avoid">
      <h3 className="text-3xl font-bold medieval-font border-b-4 border-stone-800 pb-2 uppercase text-black flex items-center gap-3">
        <Users size={28} className="shrink-0" /> Census
      </h3>
      
      <div className="dossier-card min-h-[400px] w-full p-8 flex flex-col items-center justify-center bg-white">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie 
              data={chartData} 
              innerRadius={80} 
              outerRadius={120} 
              dataKey="value" 
              stroke="#fff" 
              strokeWidth={4}
              isAnimationActive={false} /* CRITICAL: Disabled animation for print stability */
              cx="50%" 
              cy="45%"
              paddingAngle={2}
            >
              {chartData.map((e, i) => (
                <Cell key={`cell-${i}`} fill={e.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend 
              layout="horizontal" 
              align="center" 
              verticalAlign="bottom" 
              iconType="circle"
              formatter={(val, entry: any) => (
                <span className="text-[11px] font-black text-stone-800 uppercase ml-1">
                  {val}: {entry.payload.value}
                </span>
              )} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="no-print p-6 bg-stone-800/5 border-2 border-dashed border-stone-400 rounded-lg mt-4">
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          {manualDemo.map((demo, idx) => (
            <div key={idx} className="flex gap-2 items-end group">
              <div className="flex-1">
                <label className="text-[9px] font-black uppercase text-stone-500">Designation</label>
                <input 
                  className="w-full border-2 border-stone-800 px-3 py-1.5 rounded text-xs font-bold" 
                  type="text" 
                  value={demo.race} 
                  onChange={e => handleRaceChange(idx, 'race', e.target.value)}
                />
              </div>
              <div className="w-24">
                <label className="text-[9px] font-black uppercase text-stone-500">Count</label>
                <input 
                  className="w-full border-2 border-stone-800 px-3 py-1.5 rounded text-xs font-bold" 
                  type="number" 
                  value={demo.count} 
                  onChange={e => handleRaceChange(idx, 'count', parseInt(e.target.value) || 0)}
                />
              </div>
              {manualDemo.length > 1 && (
                <button onClick={() => removeRace(idx)} className="p-2 text-stone-400 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={addRace} className="flex-1 bg-stone-200 text-stone-700 py-2 rounded uppercase font-black text-xs">Add Caste</button>
          <button onClick={onRedraw} className="flex-[2] bg-stone-800 text-amber-500 py-2 rounded uppercase font-black text-xs">Commit Manifest</button>
        </div>
      </div>
    </div>
  );
};
