
import { GoogleGenAI, Type } from "@google/genai";
import { VillageData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateVillageDetails = async (
  villageName: string,
  popCount: number,
  demographics: any
): Promise<VillageData> => {
  const prompt = `
    Generate a detailed fantasy village for the Shadowdark RPG. 
    Name: ${villageName}
    Population: ${popCount}
    Atmosphere: Gritty, dark, low-magic, old-school feel.
    
    The village is situated by a small river. 
    
    REQUIRED SECTIONS:
    1. A moody geographical description.
    2. A "Dark Secret" plaguing the village (the overarching plot hook).
    3. Exactly 12 shops/businesses with unique names and owners.
       - Each business MUST have a "rumor": a short, intriguing rumor whispered by locals about the place or its owner.
       - Each business MUST have "notableItems": A list of 3-5 unique, gritty, and thematically appropriate items or services sold there. For example: 'Rancid Wolf Tallow (1gp)', 'Iron Spikes (set of 10)', 'Stale Travel Rations (half price)', 'Blessed Salt'. Keep them low-magic.
    4. Two major landmarks.
    5. Exactly 15 NPCs (Non-Player Characters). 
       - Include the 12 shop owners and 3 additional residents.
       - Roles should be diverse and gritty. Include roles like: 'Guard Captain', 'Herbalist', 'Grave Digger', 'Fortune Teller', 'Bard', 'Street Urchin', 'Retired Soldier', 'Fletcher', 'Tanner', 'Rat Catcher', 'Executioner', or 'Village Drunk'.
       - For each NPC: name, race, role, a one-sentence personality.
       - FOR EACH NPC, provide a "Dark Secret": This is a short, intriguing mystery, flaw, or hidden agenda distinct from their job.
       - FOR EACH NPC, create a "Relationship Matrix": 
         - List 2-3 other NPCs they have feelings about.
         - Format: targetName, score (1-10), one-word feeling, and a FULL SENTENCE "reason" explaining why they feel that way.
    6. "GM Notes": A section providing 3-4 specific campaign hooks or adventure seeds related to this village, written directly for the Dungeon Master.

    Output must be strictly JSON following this schema:
    {
      "geography": "string",
      "atmosphere": "string",
      "darkSecret": "string",
      "landmarks": ["string"],
      "gmNotes": "string",
      "businesses": [
        {
          "name": "string",
          "type": "string",
          "description": "string",
          "rumor": "string",
          "notableItems": ["string"],
          "owner": {
            "name": "string",
            "race": "string",
            "role": "string",
            "trait": "string",
            "secret": "string"
          }
        }
      ],
      "residents": [
        {
          "name": "string",
          "race": "string",
          "role": "string",
          "personality": "string",
          "trait": "string",
          "secret": "string",
          "relationships": [
            { "targetName": "string", "score": number, "feeling": "string", "reason": "string" }
          ]
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const rawJson = JSON.parse(response.text || "{}");
  
  return {
    ...rawJson,
    name: villageName,
    population: popCount,
    demographics: demographics
  };
};
