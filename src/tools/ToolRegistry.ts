export interface Tool{
    name: string;
    description: string;
    parameters: any;
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
    arguments: Record<string, any>;
}