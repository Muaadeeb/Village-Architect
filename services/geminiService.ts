import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VillageData, DetailedNPC, PointOfInterest } from "../types";

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
    2. Description: Elaborate on the general mood and prevalent dangers of the village (Shadowdark style).
    3. Dark Secret: The village's core rot or hidden horror.
    4. Morale: A single metric ('Hopeful', 'Fearful', 'Resentful', 'Apathetic', 'Defiant').
    5. Weather: A single short thematic phrase.
    6. Exactly 4 Nearby Settlement Relations: 
       - Focus on resource scarcity, border skirmishes, and espionage.
       - Each entry: settlementName, type ('Good', 'Neutral', 'Harmful'), status, description.
    7. Exactly 6-8 Festivals:
       - name, season ('Spring', 'Summer', 'Fall', 'Winter', 'Major'), timing, lore (dark origins), and modernPractice.
    8. Exactly 12 Businesses: Gritty names, rumors, encounterHooks, gmNotes, and exactly 5 marketItems each.
    9. Two major landmarks.
    10. Exactly 15 NPCs: 
       - Attributes: name, race, sex, role, alignment ('Lawful', 'Neutral', 'Chaotic').
       - Psychology: personality, motivation, trait (Characteristic), secret (Alignment Shadow Secret).
       - Stats: hp, ac.
       - IMPORTANT: Relationship matrix for ALL other 14 NPCs. Scores 1-10 (Varied mix).
    11. Main Quests (4) and Side Treks (10).
    12. Current Events (3).
    13. GM Notes.

    Output JSON schema:
    {
      "geography": "string",
      "description": "string",
      "atmosphere": "string",
      "morale": "Hopeful|Fearful|Resentful|Apathetic|Defiant",
      "weather": "string",
      "darkSecret": "string",
      "settlementRelations": [
        { "settlementName": "string", "type": "Good|Neutral|Harmful", "status": "string", "description": "string" }
      ],
      "festivals": [
        { "name": "string", "season": "Spring|Summer|Fall|Winter|Major", "timing": "string", "lore": "string", "modernPractice": "string" }
      ],
      "landmarks": [ { "name": "string", "description": "string", "encounterHook": "string" } ],
      "gmNotes": "string",
      "currentEvents": ["string", "string", "string"],
      "businesses": [
        { 
          "name": "string", "type": "string", "description": "string", "rumor": "string", "encounterHook": "string", "gmNotes": "string",
          "marketItems": [ { "name": "string", "price": "string", "availability": "Common|Rare|Scarce", "description": "string" } ],
          "owner": { "name": "string", "race": "string", "sex": "Male|Female", "role": "string", "trait": "string", "alignment": "Lawful|Neutral|Chaotic", "motivation": "string", "secret": "string" } 
        }
      ],
      "residents": [
        {
          "name": "string", "race": "string", "sex": "Male|Female", "role": "string", "personality": "string", "trait": "string", "alignment": "Lawful|Neutral|Chaotic", "motivation": "string", "secret": "string",
          "stats": { "hp": number, "ac": number, "atk": "string", "dmg": "string" },
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

export const generatePOI = async (village: VillageData): Promise<PointOfInterest> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Generate a Shadowdark RPG "Point of Interest" located 1d6 miles from the village "${village.name}".
    JSON Output Format:
    {
      "title": "Name", "type": "Dungeon|Lair|Ruin", "location": "string", "background": "string",
      "rooms": [ { "number": number, "name": "string", "description": "string", "threats": "string", "treasure": "string" } ]
    }
    Exactly 5 rooms.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
};

export const generateVillageGossip = async (village: VillageData): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate 3 gritty Shadowdark rumors for the village "${village.name}". Array of strings.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "[]");
};

export const generateMerchantVoice = async (npc: DetailedNPC): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const voices = npc.sex === 'Female' ? ['Kore', 'Zephyr'] : ['Puck', 'Charon', 'Fenrir'];
  const voice = voices[Math.floor(Math.random() * voices.length)];
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Greeting from ${npc.name}, a ${npc.role}. Personality: ${npc.personality}` }] }],
    config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const generateNPCPortrait = async (npc: DetailedNPC): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Portrait of ${npc.name}, gritty fantasy ${npc.race} ${npc.role}, dark style.` }] },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return "";
};

export const generateVillageMap = async (village: VillageData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Detailed top-down local street map of the village ${village.name}, showing individual shops, houses, and street names. Gritty, hand-drawn parchment style for a Shadowdark campaign.` }] },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return "";
};