

import type { Message } from "../agent/Message";
import type { LLMProvider } from "../agent/LLMProvider"
import { FunctionCallingConfigMode, GoogleGenAI } from "@google/genai"
import type { LLMResponse } from "./LLMResponse";
import type { Tool } from "../tools/ToolRegistry";
import * as z from "zod";
import { ToolRegistry } from "../tools/ToolRegistry";

export class GeminiProvider implements LLMProvider {

    // private geminiSchema = z.toJSONSchema(Tool)

    private client: GoogleGenAI;
    // private tools: Tool[];
    
    constructor(apikey: string) {
        this.client = new GoogleGenAI({ apiKey: apikey });
        // this.tools = tools;
    }

    async generate(messages: Message[], tools: Tool[]): Promise<LLMResponse> {
        const functionDeclarations = tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parametersJsonSchema: z.toJSONSchema(tool.parameters)
}));

        
        const response = await this.client.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: messages.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] })),
            config: {
      toolConfig: {
        functionCallingConfig: {
          // Force it to call any function
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: tools.map(tool => tool.name),
        }
      },
      tools: [{functionDeclarations}]
    }

        });
        // console.debug(response);
        // return { role: "assistant", content: response.text || '' };
        // TODO: parse the response to extract tool calls
        // return {
        //     role: "assistant",
        //     content: response.text || '',
        //     toolcall: response.toolcall || []
        // };

        // if(response.)
        // const lasst

        return {
            role: "assistant",
            text: response.text || "",
            toolcalls: []
        };

    }

}