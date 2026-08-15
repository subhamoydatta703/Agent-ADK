import { $ } from "bun";
import { z } from "zod";
import type { Tool } from "./ToolRegistry";
import { type CommandPolicy } from "./CommandPolicy";
import { createInterface } from "node:readline/promises";

const executeSchema = z.object({
    command: z
        .string()
        .describe("The executable name only, for example: git, bun, npm, mkdir"),

    args: z
        .array(z.string())
        .describe("Arguments for the executable, each argument as a separate string")
        .default([]),
});


const safeCommands: CommandPolicy = {
    safe: [
        "git",
        "bun",
        "bunx",
        "mkdir",
        "touch",
        "echo",
        "type",
        "cat",
        "dir",
        "ls",
        "node",
        "npm",
        "npx",
        "tsc",
        "python",
    ]
};



// validate commands

function validateCommand(command: string) {
    if (safeCommands.safe.includes(command)) {
        return "safe"
    }

    return "confirmation_required"
}




async function askForConfirmation(command: string) {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const answer = await rl.question(`Run "${command}"? (Y/N): `);

    rl.close();

    if (answer.trim().toLowerCase() === "y") {
        return true;
    }

    return false;

}



export const executeTerminalCommand: Tool = {
    name: "execute_terminal_command",
    description:
    "Execute a terminal command. The command field must contain only the executable name. Put all command arguments separately in the args array. Example: { command: 'git', args: ['add', 'src/index.ts'] }",
    parameters: executeSchema,
    execute: async (args: z.infer<typeof executeSchema>) => {
        // console.log("Args:", args);

        const parsed = executeSchema.parse(args);
        const validation = validateCommand(parsed.command);

        Bun.spawn
        if (validation !== "safe") {
            const confirmed = await askForConfirmation(parsed.command);
            if (!confirmed) {
                return {
                    output: "Command execution rejected by user."
                };
            }
        }
        // console.log("Parsed:", parsed);
        // console.log("Command:", parsed.command);
        const command = parsed.command;
        const proc = Bun.spawn([command, ...parsed.args], { stdout: "pipe", stderr: "pipe", }); 
        const stdout = await new Response(proc.stdout).text(); 
        const stderr = await new Response(proc.stderr).text(); 
        const exitCode = await proc.exited; 
        return { output: stdout || stderr, exitCode };

    }
};