
import React from 'react';
import * as VillageConstants from '../VillageConstants';
import { Snowflake } from 'lucide-react';

export const WeatherWinterSection: React.FC = () => (
  <div className="p-4 bg-blue-50 border-2 border-blue-800 rounded shadow break-inside-avoid">
    <h5 className="text-lg font-bold medieval-font text-blue-950 mb-2 flex items-center gap-2"><Snowflake size={18}/> d20 Winter Weather</h5>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {VillageConstants.WEATHER_WINTER.map((w, i) => (
        <div key={i} className="text-[10px] font-bold border-b border-blue-200">
          <span className="text-blue-800 mr-2">{i+1}.</span>{w}
        </div>
      ))}
    </div>
  </div>
);
