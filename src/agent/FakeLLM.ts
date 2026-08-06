import { type Message } from "./Message";
import { type LLMProvider } from "./LLMProvider";

export class FakeLLM implements LLMProvider {

async generate(messages: Message[]): Promise<Message> {
    const lastMessage = messages[messages.length - 1];
    return { role: "assistant", content: `${lastMessage?.content || ""}  Hello, how can I help you?` };
}
    
}