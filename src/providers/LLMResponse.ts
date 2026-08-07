import { type ToolCall } from "../tools/ToolRegistry";

export interface LLMResponse {
    role: string,
    text: string | "",
    toolcalls: ToolCall[] | undefined
}
