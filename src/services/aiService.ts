import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function enhancePrompt(prompt: string): Promise<string> {
  if (!prompt.trim()) return "";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional prompt engineer for AI image generation. 
      The user provides a simple prompt: "${prompt}". 
      Expand it into a more detailed, highly descriptive prompt that results in a beautiful, high-quality image. 
      Focus on lighting, texture, artistic style, and composition. 
      Keep the enhanced prompt under 200 words. 
      Return ONLY the expanded prompt text, no explanations.`,
    });
    return response.text || prompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return prompt;
  }
}

export async function generateImages(prompt: string, aspectRatio: string = "1:1"): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    const imageUrls: string[] = [];
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          imageUrls.push(`data:image/png;base64,${base64EncodeString}`);
        }
      }
    }
    return imageUrls;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
