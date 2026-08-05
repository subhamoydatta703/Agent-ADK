import { type Message } from "./Message";
import { type LLMProvider } from "./LLMProvider";

export class Agent {
    private llm: LLMProvider;
    private messages: Message[] = [];
    constructor(llm: LLMProvider) {
        this.llm = llm;
    }

    async run(content: string): Promise<string> {
        this.messages.push({ role: "user", content });
        const response = await this.llm.generate(this.messages);
        this.messages.push(response);
        const lastMessage = this.messages[this.messages.length - 1];
        // console.log("=== Msg array ===");
        // console.log(response);
        // console.log("=== End Response ===");
        // console.log(this.messages);
        // console.log("=== End Msg array ===");
        return "AI: " + (lastMessage?.content || "");
    }

}