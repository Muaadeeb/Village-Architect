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
       - Focus on resource scarcity, border skirmishes, stolen livestock, and espionage.
       - Each entry must have: settlementName, relationType ('Good', 'Neutral', 'Harmful'), status, and description.
    7. Exactly 6-8 Festivals:
       - 1 or 2 per season (Spring, Summer, Fall, Winter).
       - 2 "Major" festivals that occur twice a year (Equinoxes or Solstices).
       - Each must have: name, season, timing (Beginning/Middle/End of season), lore (dark origins), and modernPractice.
    8. Exactly 12 Businesses: Gritty names, rumors, encounterHooks, gmNotes, and exactly 5 marketItems each.
    9. Two major landmarks.
    10. Exactly 15 NPCs: 12 shop owners + 3 others. 
       - Detailed attributes: sex, alignment, motivation, secret, combat stats.
       - IMPORTANT: Provide a full relationship matrix for ALL other 14 NPCs.
       - RELATIONSHIP SCORES: Must be an integer between 1 (Extreme Hate/Fear) and 10 (Total Trust/Love). 
       - Provide a VAST MIX of scores (some high, some low, some neutral) so the village feels like a real community with friends and enemies.
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
          "marketItems": [ { "name": "string", "price": "string", "availability": "string", "description": "string" } ],
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
    Narrative context: The village description is "${village.description}" and secret is "${village.darkSecret}".
    Main Quests involve: ${village.mainQuests.map(q => q.title).join(", ")}.

    Structure: A 5-room crawl (dungeon, lair, or ruin).
    JSON Output Format:
    {
      "title": "Name of the location",
      "type": "Dungeon|Lair|Ruin",
      "location": "Distance and direction from village, plus descriptive landmark",
      "background": "Gritty history linked to the village's secret or a main quest",
      "rooms": [
        {
          "number": 1,
          "name": "Room Name",
          "description": "Atmospheric sensory details",
          "threats": "Monsters, traps, or environmental hazards (Shadowdark style)",
          "treasure": "Specific loot or useful items"
        }
      ]
    }
    Generate exactly 5 rooms.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateVillageGossip = async (village: VillageData): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Based on the village "${village.name}" with the dark secret "${village.darkSecret}", generate 3 short, gritty rumors that might be overheard in the local tavern. Each rumor should be 1-2 sentences. Respond with a JSON array of strings.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch {
    return ["The shadows are growing long tonight.", "Keep your coins close and your daggers closer.", "Someone new is watching from the riverbank."];
  }
};

export const generateMerchantVoice = async (npc: DetailedNPC): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const femaleVoices = ['Kore', 'Zephyr'];
  const maleVoices = ['Puck', 'Charon', 'Fenrir'];
  const voices = npc.sex === 'Female' ? femaleVoices : maleVoices;
  const voice = voices[Math.floor(Math.random() * voices.length)];
  
  const prompt = `You are ${npc.name}, a ${npc.sex} ${npc.race} ${npc.role} in a gritty Shadowdark village. 
    Personality: ${npc.personality}. 
    Greeting (5-10 words): Weary adventurers entered your shop.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  return base64Audio;
};

export const generateNPCPortrait = async (npc: DetailedNPC): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A high-quality, gritty fantasy portrait for a Shadowdark RPG character. Name: ${npc.name}. Style: Dark, moody, oil painting, old-school fantasy art. No text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Portrait generation failed.");
};

export const generateVillageMap = async (village: VillageData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const businessNames = village.businesses.map(b => b.name).join(", ");
  const prompt = `A top-down, hand-drawn fantasy village map of "${village.name}". Parchment style, black ink. 12 buildings along a river. No colors.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Map generation failed.");
};