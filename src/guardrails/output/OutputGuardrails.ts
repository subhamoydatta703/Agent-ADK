import { GoogleGenAI } from "@google/genai";
import { buildOutputGuardrailPrompt} from "./GuardrailPrompt";
import type { LLMResponse } from "../../providers/LLMResponse";
import type { GuardrailResult } from "../types/GuardrailResult";

export class OutputGuardrails {
    private aiGuard: GoogleGenAI;
    
    constructor() {
        this.aiGuard = new GoogleGenAI({ apiKey: process.env.GEMINI_GUARD_API_KEY });
    }
    async outputValidation(response: LLMResponse) {
        if(!this.aiGuard) {
            throw new Error("AI Guard is not initialized");
        }
        const llmResult = await this.outputGuardrail(response);
        return llmResult;
    }




    private async outputGuardrail(assistantResponse: LLMResponse): Promise<GuardrailResult> {
    try {
        const prompt = buildOutputGuardrailPrompt(assistantResponse);

        const response = await this.aiGuard.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
        });

        const responseText = response.text || "";
        if (!responseText) {
            throw new Error("Guardrail returned an empty response.");
        }

        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonString);

        return {
            isSafe: parsed.isSafe,
            reason: parsed.reason,
        };
    } catch (error) {
        console.error("Error at outputGuardrail: ", error);
        throw error;
    }
};
}
