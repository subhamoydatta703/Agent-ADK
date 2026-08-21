import { type Message } from "./Message";
import { type LLMProvider } from "../providers/LLMProvider";
import type { ToolRegistry } from "../tools/ToolRegistry";
import { streamGemini } from "../providers/GeminiStreaming";
import { type GuardrailContext } from "../guardrails/types/GuardrailContext";
import { InputGuardrails } from "../guardrails/input/InputGuardrails";
import { OutputGuardrails } from "../guardrails/output/OutputGuardrails";

export class Agent {
    private llm: LLMProvider;
    private registry: ToolRegistry;
    private messages: Message[] = [];
    private maxSteps: number;
    private name: string;
    private inputGuardrails: InputGuardrails;
    private outputGuardrails: OutputGuardrails;

    constructor(llm: LLMProvider, registry: ToolRegistry, maxSteps: number = 60, name: string = "Agent") {
        this.llm = llm;
        this.registry = registry;
        this.maxSteps = maxSteps;
        this.name = name;
        this.inputGuardrails = new InputGuardrails();
        this.outputGuardrails = new OutputGuardrails();
    }

    async run(content: string) {
        const context: GuardrailContext = {
            agentName: this.name,
            input: content,
            timestamp: new Date(),
        };

        const inputValidation = await this.inputGuardrails.validate(context);
        // if (!inputValidation.isSafe) {
        //     throw new Error(inputValidation.reason);
        // }



        this.messages.push({ role: "user", content: content });
        const tools = this.registry.getAllTools();
        let stepCount = 0;

        while (stepCount < this.maxSteps) {

            
            stepCount++;
            const response = await this.llm.generate(this.messages, tools);

            // console.log("Response: ", response);
            
            if (!response.toolcalls || response.toolcalls.length === 0) {
                this.messages.push({ role: "assistant", content: response.text });
                
                const finalResponse = await this.outputGuardrails.outputValidation(response);
                
                
                
                
                if(finalResponse.isSafe){
                    return response;
                }
                return { text: "Sorry, I cannot process your request.",
                    reason: finalResponse.reason 
                };
            }

                

            // 1. Push model turn with exact returned parts (preserves functionCall & thought_signature)
            this.messages.push({
                role: "model",
                parts: response.rawParts
            });
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

