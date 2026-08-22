import { type ToolCall } from "../tools/ToolRegistry";

export interface LLMResponse {
    role: string;
    text: string;
    rawParts?: any[];
    toolcalls?: ToolCall[];
     error?: {
        type: "LLM_GENERATION_FAILED";
        message: string;
    };
}
