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
                console.log("Before final response:", response);
                console.log("Final messages:\n", this.messages);
                
                return response;
            }
            console.log("Before raw parts:\n",  this.messages);
            
            console.log("LLM response first time\n", response)
            console.log("Raw parts by llm:\n", response.rawParts)
            // 1. Push model turn with exact returned parts (preserves functionCall & thought_signature)
            this.messages.push({
                role: "model",
                parts: response.rawParts
            });



            console.log("After raw parts push to msg:\n",  this.messages);

            console.log("After raw parts push to msg:\n",  this.messages[1]?.parts);
            // 2. Execute tools & push user turn with functionResponse
            for (const toolCall of response.toolcalls) {
                const tool = this.registry.getTool(toolCall.name);
                if (!tool) {
                    throw new Error(`Tool ${toolCall.name} not found`);
                }
                const result = await tool.execute(toolCall.params || {});

                this.messages.push({
                    role: "tool",
                    parts: [
                        {
                            functionResponse: {
                                name: toolCall.name,
                                response: { result }
                            }
                        } as any
                    ]

                    
                });

                console.log("After tool response push to msg:\n",  this.messages);
                console.log("After tool response push to msg the parts:\n",  this.messages[2]?.parts);
            }

        }
    }

}