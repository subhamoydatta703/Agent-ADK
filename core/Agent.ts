import { type Message } from "./Message";
import { FakeLLM } from "./FakeLLM";

export class Agent {
    private llm = new FakeLLM();
    private messages: Message[] = [];
    // constructor() {
        
    // }

    async run(content: string): Promise<Message[]> {
        this.messages.push({ role: "user", content });
        const response = await this.llm.respond({ role: "user", content });
        this.messages.push(...response);
        return this.messages;
    }

}