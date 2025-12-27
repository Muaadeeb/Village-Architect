
export interface NPC {
  name: string;
  race: string;
  role: string;
  trait: string;
  sex: 'Male' | 'Female';
  alignment: 'Lawful' | 'Neutral' | 'Chaotic';
  secret?: string;
}

export interface MarketItem {
  name: string;
  price: string;
  availability: 'Common' | 'Rare' | 'Scarce';
  description: string;
}

export interface CombatStats {
  hp: number;
  ac: number;
  atk: string;
  dmg: string;
}

export interface Relationship {
  targetName: string;
  score: number;
  feeling: string;
  reason: string;
}

export interface DetailedNPC extends NPC {
  personality: string;
  relationships: Relationship[];
  portraitUrl?: string;
  audioGreeting?: string;
  stats: CombatStats;
}

export interface Business {
  name: string;
  type: string;
  description: string;
  owner: NPC;
  notableItems: string[];
  marketItems: MarketItem[];
  rumor: string;
  encounterHook: string;
  gmNotes: string;
}

export interface Landmark {
  name: string;
  description: string;
  encounterHook: string;
}

export interface Quest {
  title: string;
  description: string;
  reward: string;
}

export interface Room {
  number: number;
  name: string;
  description: string;
  threats: string;
  treasure: string;
}

export interface PointOfInterest {
  title: string;
  type: string;
  location: string;
  background: string;
  rooms: Room[];
}

export interface VillageData {
  name: string;
  population: number;
  description: string;
  demographics: {
    humans: number;
    halflings: number;
    dwarves: number;
    elves: number;
    others: { race: string; count: number }[];
  };
  geography: string;
  atmosphere: string;
  weather: string;
  darkSecret: string;
  businesses: Business[];
  landmarks: Landmark[];
  residents: DetailedNPC[];
  mainQuests: Quest[];
  sideTreks: Quest[];
  gmNotes: string;
  mapUrl?: string;
  poi?: PointOfInterest;
}
