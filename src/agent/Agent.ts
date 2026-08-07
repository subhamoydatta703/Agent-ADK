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
        this.messages.push({ role: "user", content });
        const tools = this.registry.getAllTools()
        
        while(true) {
            const response = await this.llm.generate(this.messages, tools);
            console.log(response);
            console.log("Function calls\n", response.toolcalls);
            
            

        // if(response.toolcalls && response.toolcalls.length > 0) {
        //     // TODO: execute tool calls
        //     const toolName = response.toolcalls.map(tc => tc.name);
        //     const toolArg = response.toolcalls.map(tc => tc.params);
        //     for(const name of toolName) {
        //         // TODO: execute tool
        //         const toolArgs = response.toolcalls.find(tc => tc.name === name)?.params;
        //         const tool = this.registry.getTool(name);
        //         if(tool) {
        //             const result = await tool.execute(toolArgs || {});
        //             this.messages.push({ role: "assistant", content: result });
        //         }
        //     }

        // }

        if(response.toolcalls!.length === 0) {
            this.messages.push({ role: "assistant", content: response.text });
            return response;
        }
        

            for (const toolCall of response.toolcalls!) {

                const tool = this.registry.getTool(toolCall.name);
                if (!tool) {
                    console.error(`Tool ${toolCall.name} not found`);
                    throw new Error(`Tool ${toolCall.name} not found`);
                }

                const result = await tool.execute(toolCall.params || {});
                this.messages.push({ role: "tool", content: result });
                
            }
            
        



        // this.messages.push(...response);

        // console.log("=== Msg array ===");
        // console.log(response);
        // console.log("=== End Response ===");
        // console.log(this.messages);
        // console.log("=== End Msg array ===");
        // return response;
        }
        }

}