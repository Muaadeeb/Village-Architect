
import React from 'react';
import * as VillageConstants from '../VillageConstants';
import { Sun } from 'lucide-react';

export const WeatherSummerSection: React.FC = () => (
  <div className="p-4 bg-amber-50 border-2 border-amber-800 rounded shadow break-inside-avoid">
    <h5 className="text-lg font-bold medieval-font text-amber-950 mb-2 flex items-center gap-2"><Sun size={18}/> d20 Summer Weather</h5>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {VillageConstants.WEATHER_SUMMER.map((w, i) => (
        <div key={i} className="text-[10px] font-bold border-b border-amber-200">
          <span className="text-amber-800 mr-2">{i+1}.</span>{w}
        </div>
      ))}
    </div>
  </div>
);
