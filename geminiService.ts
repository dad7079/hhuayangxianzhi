import { GoogleGenAI } from "@google/genai";

// Initialize the client. 
// Note: In a real production app, ensure strict backend proxying for keys.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAssistantContent = async (
  originalText: string,
  targetType: 'annotation' | 'translation'
): Promise<string> => {
  if (!originalText) return "";

  const prompt = targetType === 'translation'
    ? `请将以下古文（出自嘉庆版《华阳县志》）翻译成现代白话文。保持文风雅致，格式清晰。请直接输出翻译内容，不要包含多余的解释：\n\n${originalText}`
    : `请为以下古文（出自嘉庆版《华阳县志》）提供详细的注释。解释生僻字、典故和地名。请使用HTML格式（如<ul><li>...</li></ul>）列出注释点：\n\n${originalText}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 助手暂时无法响应，请稍后再试。");
  }
};