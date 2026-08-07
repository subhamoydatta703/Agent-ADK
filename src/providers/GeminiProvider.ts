import type { Message } from "../agent/Message";
import type { LLMProvider } from "../agent/LLMProvider";
import { FunctionCallingConfigMode, GoogleGenAI, type Part } from "@google/genai";
import type { LLMResponse } from "./LLMResponse";
import type { Tool } from "../tools/ToolRegistry";
import * as z from "zod";

export class GeminiProvider implements LLMProvider {
    private client: GoogleGenAI;
    
    constructor(apikey: string) {
        this.client = new GoogleGenAI({ apiKey: apikey });
    }

    async generate(messages: Message[], tools: Tool[]): Promise<LLMResponse> {
        const functionDeclarations = tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parametersJsonSchema: z.toJSONSchema(tool.parameters)
        }));

        // Format history according to Gemini API expectations
        const contents = messages.map(msg => {
            if (msg.parts) {
                return {
                    role: msg.role === "assistant" ? "model" : msg.role === "tool" ? "user" : msg.role,
                    parts: msg.parts
                };
            }
            return {
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content || "" }]
            };
        });

        const response = await this.client.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents,
            config: {
                toolConfig: {
                    functionCallingConfig: {
                        mode: FunctionCallingConfigMode.AUTO,
                    }
                },
                tools: [{ functionDeclarations }]
            }
        });

        const candidate = response.candidates?.[0];
        const functionCalls = response.functionCalls || [];

        return {
            role: "assistant",
            text: response.text || "",
            rawParts: candidate?.content?.parts, // Preserves thought_signature & functionCall parts
            toolcalls: functionCalls
                .filter((call): call is typeof call & { name: string } => Boolean(call.name))
                .map(call => ({
                    name: call.name,
                    params: (call.args as Record<string, unknown>) || {}
                }))
        };
    }
}

