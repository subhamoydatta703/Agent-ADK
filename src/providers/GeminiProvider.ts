

import type { Message } from "../agent/Message";
import type { LLMProvider } from "../agent/LLMProvider"
import { GoogleGenAI } from "@google/genai"

export class GeminiProvider implements LLMProvider {

    private client: GoogleGenAI;
    
    constructor(apikey: string) {
        this.client = new GoogleGenAI({ apiKey: apikey });
    }

    async generate(messages: Message[]): Promise<Message> {

        
        const response = await this.client.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: messages.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] })),
        });
        // console.debug(response);
        return { role: "assistant", content: response.text || '' };
    }

}