
import { GoogleGenAI } from "@google/genai";
import { Gender } from "../types";

export const getRaceCommentary = async (
  prizeName: string, 
  winnerName: string = "bạn", 
  gender: Gender = 'other'
) => {
  let pronoun = 'bạn';
  if (gender === 'male') pronoun = 'anh';
  else if (gender === 'female') pronoun = 'chị';
  else if (gender === 'teacher_male') pronoun = 'thầy';
  else if (gender === 'teacher_female') pronoun = 'cô';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là MC chuyên nghiệp. 
      Người chơi "${winnerName}" (${pronoun}) vừa trúng "${prizeName}".
      
      YÊU CẦU:
      1. Viết 1 câu chúc mừng hào hứng, ngắn gọn (dưới 20 từ).
      2. Sử dụng danh xưng "${pronoun}" một cách trang trọng và thân thiện.
      3. Tập trung vào món quà "${prizeName}" và sự may mắn.
      4. Tuyệt đối KHÔNG nhắc đến: ngựa, đua, chạy, đường đua, phi...
      5. Ngôn ngữ thân thiện, vui vẻ.`,
      config: {
        temperature: 0.9,
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text?.trim() || `Chúc mừng ${pronoun} ${winnerName}! Món quà "${prizeName}" thật tuyệt vời!`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Chúc mừng ${pronoun} ${winnerName}! Bạn thật sự rất may mắn khi nhận được "${prizeName}"!`;
  }
};
