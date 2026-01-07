
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Label } from 'recharts';
import { VillageData, DemographicEntry } from '../types';
import { Plus, Trash2, Users } from 'lucide-react';

interface Props {
  village: VillageData;
  manualDemo: DemographicEntry[];
  setManualDemo: (val: DemographicEntry[]) => void;
  onRedraw: () => void;
}

// Vibrant Primary and Secondary Color Palette for RPG demographics
const RACE_COLORS = [
  '#1a1a1a', // Black
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#78350f', // Brown
  '#71717a', // Zinc
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
      <h3 className="text-2xl font-bold medieval-font border-b-4 border-stone-800 pb-2 uppercase text-black flex items-center gap-3">
        <Users size={24} className="shrink-0" /> Census
      </h3>
      
      {/* Chart Section */}
      <div className="h-[480px] w-full bg-white/30 p-4 border-4 border-stone-800 rounded shadow-inner flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={chartData} 
              innerRadius={80} 
              outerRadius={120} 
              dataKey="value" 
              stroke="#fff" 
              strokeWidth={3}
              animationDuration={800}
              cx="50%" 
              cy="45%"
              paddingAngle={2}
            >
              {chartData.map((e, i) => (
                <Cell key={`cell-${i}`} fill={e.color} />
              ))}
              <Label 
                position="center"
                content={(props: any) => {
                  const { viewBox } = props;
                  if (!viewBox) return null;
                  const { cx, cy } = viewBox;
                  return (
                    <g>
                      <text
                        x={cx}
                        y={cy - 12}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-stone-500 font-black uppercase tracking-widest"
                        style={{ fontSize: '12px', fontWeight: 900 }}
                      >
                        TOTAL POP
                      </text>
                      <text
                        x={cx}
                        y={cy + 28}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-black font-black medieval-font"
                        style={{ fontSize: '56px', fontWeight: 900 }}
                      >
                        {village.population}
                      </text>
                    </g>
                  );
                }}
              />
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
                <span className="text-[10px] font-black text-stone-800 uppercase ml-1">
                  {val}: {entry.payload.value}
                </span>
              )} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Manual Entry Section - Dynamic Inputs */}
      <div className="no-print p-6 bg-stone-800/5 border-2 border-dashed border-stone-400 rounded-lg">
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {manualDemo.map((demo, idx) => (
            <div key={idx} className="flex gap-2 items-end group">
              <div className="flex-1">
                <label className="text-[9px] font-black uppercase text-stone-500 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: RACE_COLORS[idx % RACE_COLORS.length] }}></div>
                  Race Designation
                </label>
                <input 
                  className="w-full border-2 border-stone-800 px-3 py-1.5 rounded text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                  type="text" 
                  value={demo.race} 
                  onChange={e => handleRaceChange(idx, 'race', e.target.value)}
                  placeholder="e.g. Human"
                />
              </div>
              <div className="w-24">
                <label className="text-[9px] font-black uppercase text-stone-500">Count</label>
                <input 
                  className="w-full border-2 border-stone-800 px-3 py-1.5 rounded text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                  type="number" 
                  value={demo.count} 
                  onChange={e => handleRaceChange(idx, 'count', parseInt(e.target.value) || 0)}
                />
              </div>
              {manualDemo.length > 1 && (
                <button 
                  onClick={() => removeRace(idx)} 
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                  title="Remove Entry"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          {manualDemo.length < 10 && (
            <button 
              onClick={addRace} 
              className="flex-1 bg-stone-200 text-stone-700 py-2.5 rounded uppercase font-black text-xs flex items-center justify-center gap-2 hover:bg-stone-300 transition-all border border-stone-300 shadow-sm"
            >
              <Plus size={16} /> Add Race
            </button>
          )}
          <button 
            onClick={onRedraw} 
            className="flex-[2] bg-stone-800 text-amber-500 py-2.5 rounded uppercase font-black text-xs shadow-lg hover:bg-stone-700 hover:scale-[1.02] active:scale-[0.98] transition-all border border-stone-950 flex items-center justify-center gap-2"
          >
            Update Manifest
          </button>
        </div>
        <p className="text-[9px] font-black uppercase text-stone-400 mt-4 text-center italic tracking-widest">Shadowdark Census Protocol: Maximum 10 Castes</p>
      </div>
    </div>
  );
};
