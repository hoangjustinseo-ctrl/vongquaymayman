
import { GoogleGenAI } from "@google/genai";

export const getRaceCommentary = async (prizeName: string, remainingPrizes: string[], winnerName: string = "bạn") => {
  // Fix: Always create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là một bình luận viên vui tính. Người trúng giải tên là "${winnerName}", vừa nhận được giải "${prizeName}".
      Hãy viết một lời chúc mừng ngắn gọn, hài hước và tràn đầy năng lượng (khoảng 1-2 câu).
      Hãy gọi tên người trúng giải một cách thân thiện.`,
      config: {
        temperature: 0.9,
        maxOutputTokens: 200,
        // Fix: Added thinkingBudget to prevent empty responses when maxOutputTokens is set
        thinkingConfig: { thinkingBudget: 100 }
      }
    });
    // Fix: Access .text property directly (do not call as a function)
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null; // Trả về null để App dùng mẫu mặc định nếu lỗi
  }
};
