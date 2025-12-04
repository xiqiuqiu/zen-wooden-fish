import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getZenWisdom = async (totalMerits: number, language: Language): Promise<string> => {
  if (!ai) {
    return language === 'zh' 
      ? "心如止水。（请配置 API Key）" 
      : "Heart is clear, mind is still. (API Key missing)";
  }

  try {
    const langInstruction = language === 'zh' 
      ? "Return ONLY the Chinese text (Traditional or Simplified)." 
      : "Return ONLY the English text.";

    const prompt = `
      The user is playing a digital wooden fish (Muyu) game. 
      They have accumulated ${totalMerits} merits (clicks).
      Please generate a very short, profound, and possibly cryptic Zen Buddhist saying or poem (Koan).
      It should acknowledge their persistence if the number is high.
      Keep it under 20 words. 
      ${langInstruction}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'zh' ? "本来无一物，何处惹尘埃。" : "Originally there is nothing, where can dust alight?";
  }
};