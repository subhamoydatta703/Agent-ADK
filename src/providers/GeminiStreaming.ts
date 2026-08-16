import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_STREAMING_API_KEY;
if (!apiKey) {
    throw new Error("API key for Gemini Streaming is not set");
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export interface GeminiConfig {
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Streams content from Gemini.
 * @param content - The prompt or input content to send to Gemini.
 * @param config - Optional configuration for Gemini generation.
 * @returns An async generator yielding chunks of text from the stream.
 */
export async function* streamGemini(content: string, config: GeminiConfig = {}) {
    // Already validated key initialization
  let stream;
  try {
    stream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: content,
      config: {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
      }
    });
  } catch (error) {
    console.error("Error generating content stream:", error);
    throw new Error(`Failed to stream from Gemini: ${error instanceof Error ? error.message : String(error)}`);
  }

  for await (const chunk of stream) {
    const text = chunk.text;

    if (text) {
      yield text;
    }
  }
}