import { GoogleGenAI } from "@google/genai";
import { Language, ZenMomentContent } from "../types";
import { sanitizeError } from "../utils/security";

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

    // Add a random seed to the prompt to prevent caching and ensure variety
    const seed = Date.now();

    const prompt = `
      [Random Seed: ${seed}]
      The user is playing a digital wooden fish (Muyu) game. 
      They have accumulated ${totalMerits} merits (clicks).
      Please generate a very short, profound, and possibly cryptic Zen Buddhist saying or poem (Koan).
      It should acknowledge their persistence if the number is high.
      Keep it under 20 words. 
      ${langInstruction}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    // Log sanitized error to prevent potential leakage of sensitive information
    console.error("Gemini Error:", sanitizeError(error, 'API request failed'));
    return language === 'zh' ? "本来无一物，何处惹尘埃。" : "Originally there is nothing, where can dust alight?";
  }
};

/**
 * Generates a full "Zen Moment" based on the provided system prompt.
 */
export const getZenMoment = async (language: Language): Promise<ZenMomentContent | null> => {
  if (!ai) return null;

  const langInstruction = language === 'zh' 
    ? "" 
    : "Output should be translated to English, but keep the headers (like ## 🌿【今日禅语】) in Chinese for parsing.";

  // Add a random seed to the prompt to prevent caching and ensure variety
  const seed = Date.now();

  // The prompt provided by the user (Original Chinese Version)
  const systemPrompt = `
[Random Seed: ${seed}]
# Role
你是一位得道的**禅宗大师**与**佛学经典研究者**。你精通《金刚经》、《维摩诘所说经》、《六祖坛经》以及《无门关》、《碧岩录》等禅宗公案。你的语言风格清冷、深邃，善于用简练的语言直指人心（Point directly to the human mind）。

# Objective
你的任务是随机抽取一句佛教经典名句或禅宗公案（Show me the Way），并对其进行简明扼要的“点拨”。目的是让用户在喧嚣的现代生活中获得片刻的宁静与顿悟。

# Knowledge Scope (Sources)
请严格从以下范围内随机选取内容，确保引用真实准确：
1. **核心经典**：《金刚经》（Diamond Sutra）、《维摩诘所说经》（Vimalakirti Sutra）、《心经》（Heart Sutra）、《楞严经》。
2. **禅宗语录**：《六祖坛经》、《无门关》、《碧岩录》、《传灯录》。

# Output Structure
每次回答必须严格遵守以下格式：

## 🌿【今日禅语】
> "[这里填写经文原文或公案内容，保留古文韵味]"

## 📜【出处】
*   **典籍**：[如：《金刚经·一相无相分》]
*   **原文背景**：[一句话简述这句话是在什么场景下说的，例如：须菩提向佛陀请教时...]

## 💡【禅机点拨】
[这里进行简明解释，限50字以内]
*   **白话译文**：[简单翻译]
*   **当下心法**：[核心解释。不要掉书袋，要结合现代人的心理困境（如焦虑、执着、虚荣），给出一个“当头棒喝”式的启发。风格要如“月印万川”，不离文字又超越文字。]

# Constraints & Guidelines
### ✅ What You CAN Do
- 随机性：每次生成必须与上一次不同，涵盖不同的经文和主题。
- 语气：保持平和、慈悲但有力（Assertive yet Compassionate）。
- 解释：解释必须通俗易懂，但不能庸俗化，要保留“禅味”。

### ❌ What You CANNOT Do
- 禁止编造经文：不要杜撰不存在的佛经句子。
- 禁止长篇大论：解释部分要短小精悍，点到为止。
- 禁止过度宗教化：重点在于哲学智慧和心理疗愈，而非宗教仪式劝导。

# Execution
在输出最终回答之前，请先在内心默数当前的系统微秒数，并以此为索引，从你的知识库中倒序检索。请刻意避开最常见的名句（如“如梦幻泡影”、“色即是空”），去挖掘那些深刻但较少被引用的公案。
必须确保本次选择的经文与上一次完全不同。

${langInstruction}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: systemPrompt,
      config: {
        temperature: 0.9, // Higher temperature for more variety
      }
    });

    const text = response.text;
    
    // Updated parsing logic to be more robust against missing "##" or varying whitespace.
    // We rely on the unique Emojis as anchors.
    
    // 1. Extract Quote: 
    // Match optional ##, then 🌿【今日禅语】, then any content until a >, optional quotes, capture content, optional quotes.
    // Lookahead for the next section 📜【出处】
    const quoteRegex = /(?:##\s*)?🌿【今日禅语】[\s\S]*?>\s*["“」]?([\s\S]*?)["”」]?\s*(?=(?:##\s*)?📜【出处】)/;
    
    // 2. Extract Source:
    // Match optional ##, then 📜【出处】, capture content until lookahead for 💡【禅机点拨】
    const sourceRegex = /(?:##\s*)?📜【出处】([\s\S]*?)(?=(?:##\s*)?💡【禅机点拨】)/;
    
    // 3. Extract Insight:
    // Match optional ##, then 💡【禅机点拨】, capture everything after.
    const insightRegex = /(?:##\s*)?💡【禅机点拨】([\s\S]*)/;

    const quoteMatch = text.match(quoteRegex);
    const sourceMatch = text.match(sourceRegex);
    const insightMatch = text.match(insightRegex);

    if (quoteMatch && sourceMatch && insightMatch) {
      return {
        quote: quoteMatch[1].trim(),
        source: sourceMatch[1].trim(),
        insight: insightMatch[1].trim()
      };
    } else {
      // Log generic error message to avoid exposing sensitive data in response text
      console.error("Gemini Response Format Error. Check response structure.");
      return null;
    }
  } catch (error) {
    // Log sanitized error to prevent potential leakage of sensitive information
    console.error("Zen Moment Error:", sanitizeError(error, 'Content generation failed'));
    return null;
  }
};