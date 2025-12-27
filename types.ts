
export interface NPC {
  name: string;
  race: string;
  role: string;
  trait: string;
  secret?: string;
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
}

export interface Business {
  name: string;
  type: string;
  description: string;
  owner: NPC;
  notableItems: string[];
  rumor: string;
}

export interface Quest {
  title: string;
  description: string;
  reward: string;
}

export interface VillageData {
  name: string;
  population: number;
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
  landmarks: string[];
  residents: DetailedNPC[];
  mainQuests: Quest[];
  sideTreks: Quest[];
  gmNotes: string;
}
