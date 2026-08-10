import { type Message } from "../agent/Message";
import { type Tool } from "../tools/ToolRegistry";
import type { LLMResponse } from "../providers/LLMResponse";

export interface LLMProvider {
    generate(messages: Message[], tools: Tool[]): Promise<LLMResponse>;
}