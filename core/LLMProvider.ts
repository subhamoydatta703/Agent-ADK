import { type Message } from "./Message";

export interface LLMProvider {
    generate(messages: Message[]): Promise<Message>;
}