
import React from 'react';
import * as VillageConstants from '../VillageConstants';
import { Sprout } from 'lucide-react';

export const WeatherSpringSection: React.FC = () => (
  <div className="p-4 bg-emerald-50 border-2 border-emerald-800 rounded shadow break-inside-avoid">
    <h5 className="text-lg font-bold medieval-font text-emerald-950 mb-2 flex items-center gap-2"><Sprout size={18}/> d20 Spring Weather</h5>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {VillageConstants.WEATHER_SPRING.map((w, i) => (
        <div key={i} className="text-[10px] font-bold border-b border-emerald-200">
          <span className="text-emerald-800 mr-2">{i+1}.</span>{w}
        </div>
      ))}
    </div>
  </div>
);
