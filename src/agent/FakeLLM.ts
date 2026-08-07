import { type Message } from "./Message";
import { type LLMProvider } from "./LLMProvider";
import { type Tool } from "../tools/ToolRegistry";
import { type LLMResponse } from "../providers/LLMResponse";

// export class FakeLLM implements LLMProvider {

// async generate(messages: Message[], tools: Tool[]): Promise<LLMResponse> {
    // const lastMessage = messages[messages.length - 1];
    // return { role: "assistant", content: `${lastMessage?.content || ""}  Hello, how can I help you?`, toolcalls: [] };
// }
    
// }