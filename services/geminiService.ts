
import { GoogleGenAI } from "@google/genai";
import { Gender } from "../types";

export const getRaceCommentary = async (
  prizeName: string, 
  winnerName: string = "bạn", 
  gender: Gender = 'other'
) => {
  const env = (globalThis as any).process?.env || {};
  const apiKey = env.API_KEY;

  const pronoun = gender === 'male' ? 'anh' : gender === 'female' ? 'chị' : 'bạn';

  if (!apiKey) {
    return `Chúc mừng ${pronoun} ${winnerName} đã cực kỳ may mắn nhận được món quà tuyệt vời: ${prizeName}!`;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là MC chuyên nghiệp. 
      Người chơi "${winnerName}" (${pronoun}) vừa trúng "${prizeName}".
      
      YÊU CẦU:
      1. Viết 1 câu chúc mừng hào hứng, ngắn gọn (dưới 20 từ).
      2. Tập trung vào món quà "${prizeName}" và sự may mắn.
      3. Tuyệt đối KHÔNG nhắc đến: ngựa, đua, chạy, đường đua, phi...
      4. Ngôn ngữ thân thiện, vui vẻ.`,
      config: {
        temperature: 0.9,
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text?.trim() || `Chúc mừng ${pronoun} ${winnerName}! Món quà "${prizeName}" thật tuyệt vời!`;
  } catch (error) {
    return `Chúc mừng ${pronoun} ${winnerName}! Bạn thật sự rất may mắn khi nhận được "${prizeName}"!`;
  }
};
