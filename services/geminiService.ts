
import { GoogleGenAI, Type, Modality } from "@google/genai";
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
    3. Weather: A single short thematic phrase.
    4. Exactly 12 Businesses: 
       - Gritty names, rumors.
       - encounterHook: 1-2 sentences.
       - marketItems: Exactly 5 specific items for sale. Each must have:
         - name, 
         - price (Shadowdark style: "5 gp", "10 sp", "5 cp"),
         - availability ("Common", "Rare", "Scarce"),
         - description.
    5. Two major landmarks: name, description, encounterHook.
    6. Exactly 15 NPCs: 12 shop owners + 3 others. 
       - FOR EACH NPC: name, race, role, personality, trait, dark secret.
       - SHADOWDARK COMBAT STATS: hp, ac, atk, dmg.
       - FULL RELATIONSHIP MATRIX: Every NPC must have a relationship entry for the other 14 NPCs. 
       - BELL CURVE SCORING: Strict Gaussian distribution (1 to 10 scale). 
    7. Main Quests: 3 high-stakes narrative arcs.
    8. Side Treks: 10 small, gritty errands or mysteries.
    9. GM Notes: DM-specific campaign hooks.

    Output JSON schema:
    {
      "geography": "string",
      "atmosphere": "string",
      "weather": "string",
      "darkSecret": "string",
      "landmarks": [ { "name": "string", "description": "string", "encounterHook": "string" } ],
      "gmNotes": "string",
      "businesses": [
        { 
          "name": "string", "type": "string", "description": "string", "rumor": "string", "encounterHook": "string",
          "marketItems": [ { "name": "string", "price": "string", "availability": "string", "description": "string" } ],
          "owner": { "name": "string", "race": "string", "role": "string", "trait": "string", "secret": "string" } 
        }
      ],
      "residents": [
        {
          "name": "string", "race": "string", "role": "string", "personality": "string", "trait": "string", "secret": "string",
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
    return ["The shadows are growing long tonight.", "Keep your coins close and your dagger closer.", "Someone new is watching from the riverbank."];
  }
};

export const generateMerchantVoice = async (npc: DetailedNPC): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const voices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];
  const voice = voices[Math.floor(Math.random() * voices.length)];
  
  const prompt = `You are ${npc.name}, a ${npc.race} ${npc.role} in a gritty Shadowdark village. 
    Personality: ${npc.personality}. 
    Trait: ${npc.trait}.
    Say a short (5-10 word) greeting to a group of weary adventurers entering your establishment. 
    Make it sound appropriate for your personality (e.g. suspicious, greedy, or tired).`;

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
  const prompt = `A high-quality, gritty fantasy portrait for a Shadowdark RPG character. Name: ${npc.name}. Race: ${npc.race}. Role: ${npc.role}. Personality: ${npc.personality}. Trait: ${npc.trait}. Style: Dark, moody, oil painting, old-school fantasy art. No text.`;

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
  const prompt = `A top-down, hand-drawn fantasy village map of "${village.name}". Parchment style, black ink. 12 buildings along a river. RPG cartography. Locations: ${businessNames}. No colors.`;

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
