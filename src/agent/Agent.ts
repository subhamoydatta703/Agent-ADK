import { type Message } from "./Message";
import { type LLMProvider } from "./LLMProvider";
import type { ToolRegistry } from "../tools/ToolRegistry";

export class Agent {
    private llm: LLMProvider;
    private registry: ToolRegistry;
    private messages: Message[] = [];
    constructor(llm: LLMProvider, registry: ToolRegistry) {
        this.llm = llm;
        this.registry = registry;
    }

    async run(content: string) {
        this.messages.push({ role: "user", content: content });
        const tools = this.registry.getAllTools()

        while (true) {
            const response = await this.llm.generate(this.messages, tools);
            if (!response.toolcalls || response.toolcalls.length === 0) {
                this.messages.push({ role: "assistant", content: response.text });
                return response;
            }
            // 1. Push model turn with exact returned parts (preserves functionCall & thought_signature)
            this.messages.push({
                role: "model",
                parts: response.rawParts
            });
            // 2. Execute tools & push user turn with functionResponse
            for (const toolCall of response.toolcalls) {
                const tool = this.registry.getTool(toolCall.name);
                if (!tool) {
                    throw new Error(`Tool ${toolCall.name} not found`);
                }
                const result = await tool.execute(toolCall.params || {});

                this.messages.push({
                    role: "user",
                    parts: [
                        {
                            functionResponse: {
                                name: toolCall.name,
                                response: { result }
                            }
                        } as any
                    ]
                });
            }





            // this.messages.push(...response);

            // console.log("=== Msg array ===");
            // console.log(response);
            // console.log("=== End Response ===");
            // console.log(this.messages);
            // console.log("=== End Msg array ===");
            // return response;
            // console.log("Final messages:\n",this.messages);


        }
    }

}