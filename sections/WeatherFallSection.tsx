
import React from 'react';
import * as VillageConstants from '../VillageConstants';
import { Leaf } from 'lucide-react';

export const WeatherFallSection: React.FC = () => (
  <div className="p-4 bg-orange-50 border-2 border-orange-800 rounded shadow break-inside-avoid">
    <h5 className="text-lg font-bold medieval-font text-orange-950 mb-2 flex items-center gap-2"><Leaf size={18}/> d20 Fall Weather</h5>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {VillageConstants.WEATHER_FALL.map((w, i) => (
        <div key={i} className="text-[10px] font-bold border-b border-orange-200">
          <span className="text-orange-800 mr-2">{i+1}.</span>{w}
        </div>
      ))}
    </div>
  </div>
);
