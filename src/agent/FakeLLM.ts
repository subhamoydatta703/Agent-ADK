import { type Message } from "./Message";
import { type LLMProvider } from "../providers/LLMProvider";
import { type Tool } from "../tools/ToolRegistry";
import { type LLMResponse } from "../providers/LLMResponse";

export class FakeLLM implements LLMProvider {
    async generate(messages: Message[], _tools: Tool[]): Promise<LLMResponse> {
        const lastMessage = messages[messages.length - 1];
        const textContent = lastMessage?.content || "Hello";

        return {
            role: "assistant",
            text: `[FakeLLM Response] Echo: "${textContent}". How can I assist you further?`,
            toolcalls: []
        };
    }
}