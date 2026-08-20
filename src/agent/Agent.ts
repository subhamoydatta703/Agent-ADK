import { type Message } from "./Message";
import { type LLMProvider } from "../providers/LLMProvider";
import type { ToolRegistry } from "../tools/ToolRegistry";
import { streamGemini } from "../providers/GeminiStreaming";

export class Agent {
    private llm: LLMProvider;
    private registry: ToolRegistry;
    private messages: Message[] = [];
    private maxSteps: number;

    constructor(llm: LLMProvider, registry: ToolRegistry, maxSteps: number = 60) {
        this.llm = llm;
        this.registry = registry;
        this.maxSteps = maxSteps;
    }

    async run(content: string) {
        this.messages.push({ role: "user", content: content });
        const tools = this.registry.getAllTools();
        let stepCount = 0;

        while (stepCount < this.maxSteps) {

            
            stepCount++;
            const response = await this.llm.generate(this.messages, tools);

            // console.log("Response: ", response);
            
            if (!response.toolcalls || response.toolcalls.length === 0) {
                this.messages.push({ role: "assistant", content: response.text });
                // console.log("Assistant: ", response.text);

                return response;
            }

            // if(response.role==="assistant" || response.role==="model"){
            //     console.log("Assistant: ", response.text);
            //     process.stdout.write(response.text);
            // }

            // 1. Push model turn with exact returned parts (preserves functionCall & thought_signature)
            this.messages.push({
                role: "model",
                parts: response.rawParts
            });
            // console.log("Response: ", this.messages[this.messages.length - 1]?.parts?.filter(part => part.functionCall),"\n\n");
            // console.dir(response.rawParts, {
            //     depth: null,
            //     colors: true,
            // });
            // 2. Execute tools & push tool turn with functionResponse
            for (const toolCall of response.toolcalls) {
                const tool = this.registry.getTool(toolCall.name);

                if (!tool) {
                    // throw new Error(`Tool ${toolCall.name} not found`);
                    this.messages.push({
                        role: "tool",
                        parts: [
                            {
                                functionResponse: {
                                    name: toolCall.name,
                                    response: { result: `Tool ${toolCall.name} not found` }
                                }
                            } as any
                        ]
                    });
                    continue;
                }
                let result;
                try {
                    result = await tool.execute(toolCall.params || {});
                } catch (error) {
                    result = `Error executing tool: ${error instanceof Error ? error.message : String(error)}`;
                }
                 // console.log("Tool result: \n", result);


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
            }
        }

        throw new Error(`Agent exceeded maximum execution step limit of ${this.maxSteps}.`);
    }
}
