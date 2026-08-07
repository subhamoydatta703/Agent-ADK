import { z } from "zod";

export interface Tool{
    name: string;
    description: string;
    parameters: z.ZodSchema;
    execute: (args: any) => Promise<any>;
}


export class ToolRegistry{
    private tools: Tool[] = [];

    registerTool(tool: Tool) {
        this.tools.push(tool);
    }

    getAllTools(): Tool[] {
        return this.tools;
    }
    
    getTool(toolName: string): Tool | undefined {
        return this.tools.find(tool => tool.name === toolName);
    }
}


export interface ToolCall {
    name: string;
    params: Record<string, unknown>;
}