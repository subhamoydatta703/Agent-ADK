import { type Message } from "./Message";
import { type LLMProvider } from "./LLMProvider";

export class Agent {
    private llm: LLMProvider;
    private messages: Message[] = [];
    constructor(llm: LLMProvider) {
        this.llm = llm;
    }

    async run(content: string): Promise<Message[]> {
        this.messages.push({ role: "user", content });
        const response = await this.llm.generate(this.messages);
        this.messages.push(response);
        return this.messages;
    }

}