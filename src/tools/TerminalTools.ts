import { $ } from "bun";
import { z } from "zod";
import type { Tool } from "./ToolRegistry";

const executeSchema = z.object({
    command: z.string().describe("The command to execute")
});

export const executeTerminalCommand: Tool = {
    name: "execute_terminal_command",
    description: "Execute a command in the terminal",
    parameters: executeSchema,
    execute: async (args: z.infer<typeof executeSchema>) => {
        // console.log("Args:", args);
        
        const parsed = executeSchema.parse(args);
        // console.log("Parsed:", parsed);
        // console.log("Command:", parsed.command);
        const commandArgs = parsed.command.split(" ");
        // console.log("Command args:", commandArgs);
        const result = await $`${commandArgs}`.text();
        // console.log("Result:", result);
        
        return {
            output: result
        };
    }
};