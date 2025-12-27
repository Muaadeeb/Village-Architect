
import { GoogleGenAI, Type } from "@google/genai";
import { VillageData, DetailedNPC } from "../types";

export const generateVillageDetails = async (
  villageName: string,
  popCount: number,
  demographics: any
): Promise<VillageData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Generate a massive, detailed fantasy village dossier for the Shadowdark RPG. 
    Name: ${villageName}
    Population: ${popCount}
    Atmosphere: Gritty, dark, low-magic, old-school feel.
    
    REQUIRED DATA:
    1. Geography: Moody description of the site by a river.
    2. Dark Secret: The village's core rot or hidden horror.
    3. Weather: A single short, thematic phrase describing the current weather (e.g., "Eerie, bone-white fog", "Freezing, relentless rain").
    4. Exactly 12 Businesses: Gritty names, rumors, and 3-5 notable low-magic items/services each.
    5. Two major landmarks.
    6. Exactly 15 NPCs: 12 shop owners + 3 others. 
       - FOR EACH NPC: 
         - name, 
         - race (Human, Halfling, Dwarf, Elf, etc.), 
         - role (Job/Station), 
         - personality (How they behave), 
         - trait (A SINGLE DEFINING CHARACTERISTIC OR PHYSICAL QUIRK, e.g., "Whistles through a missing tooth", "Obsessed with collecting blue stones"),
         - a dark secret.
       - FULL RELATIONSHIP MATRIX: Every single NPC (out of 15) must have a relationship entry for the other 14 NPCs. 
       - Relationships must include a score (1-10), a feeling, and a concise 1-sentence reason. 
    7. Main Quests: 3 high-stakes narrative arcs.
    8. Side Treks: 10 small, gritty errands or mysteries.
    9. GM Notes: DM-specific campaign hooks.

    Output must be strictly JSON following this schema:
    {
      "geography": "string",
      "atmosphere": "string",
      "weather": "string",
      "darkSecret": "string",
      "landmarks": ["string"],
      "gmNotes": "string",
      "businesses": [
        { "name": "string", "type": "string", "description": "string", "rumor": "string", "notableItems": ["string"], "owner": { "name": "string", "race": "string", "role": "string", "trait": "string", "secret": "string" } }
      ],
      "residents": [
        {
          "name": "string", "race": "string", "role": "string", "personality": "string", "trait": "string", "secret": "string",
          "relationships": [ { "targetName": "string", "score": number, "feeling": "string", "reason": "string" } ]
        }
      ],
      "mainQuests": [ { "title": "string", "description": "string", "reward": "string" } ],
      "sideTreks": [ { "title": "string", "description": "string", "reward": "string" } ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 2000 }
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

export const generateNPCPortrait = async (npc: DetailedNPC): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A high-quality, gritty fantasy portrait for a Shadowdark RPG character. 
    Character Name: ${npc.name}.
    Race: ${npc.race}. 
    Role: ${npc.role}. 
    Personality: ${npc.personality}. 
    Defining Trait: ${npc.trait}. 
    Style: Dark, moody, oil painting, old-school fantasy art, ink and wash, detailed facial features, dramatic lighting, low-magic aesthetic. No text in image. Close-up face or bust shot.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image part.");
};
