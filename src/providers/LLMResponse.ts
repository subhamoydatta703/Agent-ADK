import { type ToolCall } from "../tools/ToolRegistry";

export interface LLMResponse {
    text: string,
    toolcall: ToolCall[]
}
