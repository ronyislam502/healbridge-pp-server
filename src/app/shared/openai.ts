import OpenAI from "openai";
import config from "../config";


export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: config.openai_api_key,
});

export const extractDoctorFromMessage = (message: any) => {
  try {
    const content = message?.content || "";

    let parsed: any = null;

    // 1️⃣ Try to extract JSON code block
    const jsonBlockMatch = content.match(/```json([\s\S]*?)```/);
    if (jsonBlockMatch) {
      parsed = JSON.parse(jsonBlockMatch[1].trim());
    }
    // 2️⃣ If content is plain JSON
    else if (content.trim().startsWith("{") || content.trim().startsWith("[")) {
      parsed = JSON.parse(content);
    }
    // 3️⃣ Fallback: first JSON-like substring
    else {
      const jsonFallbackMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonFallbackMatch) parsed = JSON.parse(jsonFallbackMatch[1]);
    }

    // 4️⃣ Return only suggestedDoctors array if exists
    if (parsed && parsed.suggestedDoctors) {
      return parsed.suggestedDoctors;
    }

    // 5️⃣ Fallback: return null
    return null;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return null;
  }
};