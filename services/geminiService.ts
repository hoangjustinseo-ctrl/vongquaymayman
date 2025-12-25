
import { GoogleGenAI } from "@google/genai";
import { Gender } from "../types";

export const getRaceCommentary = async (
  prizeName: string, 
  winnerName: string = "bạn", 
  gender: Gender = 'other'
) => {
  // Truy cập an toàn để tránh lỗi ReferenceError: process is not defined
  const env = (globalThis as any).process?.env || {};
  const apiKey = env.API_KEY;

  if (!apiKey) {
    return `Chúc mừng ${gender === 'male' ? 'anh' : gender === 'female' ? 'chị' : 'bạn'} ${winnerName} đã giành được ${prizeName}!`;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const pronoun = gender === 'male' ? 'anh' : gender === 'female' ? 'chị' : 'bạn';

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là bình luận viên đua ngựa hài hước. Người chơi tên "${winnerName}" (xưng hô là ${pronoun}) vừa thắng giải "${prizeName}". Hãy viết 1 câu chúc mừng kịch tính, vui vẻ và gọi đúng xưng hô ${pronoun}.`,
      config: {
        temperature: 0.9,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text?.trim() || `Chúc mừng ${pronoun} ${winnerName} đã giành chiến thắng rực rỡ!`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Xin chúc mừng ${pronoun} ${winnerName}! Một phần quà tuyệt vời dành cho người xứng đáng.`;
  }
};
