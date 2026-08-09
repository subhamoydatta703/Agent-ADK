import { z } from "zod";
import { type Tool } from "./ToolRegistry";


const gitToolsSchema = z.object({
    command: z.string().describe("The git command to execute").min(1)
})

export const gitStatus: Tool = {
    name: "git_status",
    description: "Get the status of the git repository",
    parameters: gitToolsSchema,
    execute: async (args: z.infer<typeof gitToolsSchema>) => {
        const parsed = gitToolsSchema.parse(args);
        try {
            const command = parsed.command;
            const cleanCommand = command.trim().startsWith("git ")
                ? command.trim()
                : `git ${command.trim()}`;

            // 2. Split the string into an array for safe execution
            const commandArgs = cleanCommand.split(" ");

            // 3. Execute using Bun's fast process launcher
            const process = Bun.spawn(commandArgs, {
                stdout: "pipe",
                stderr: "pipe",
            });

            // 4. Capture both success and error outputs
            const stdout = await new Response(process.stdout).text();
            const stderr = await new Response(process.stderr).text();
            await process.exited; // Wait for the command to finish

            if (process.exitCode !== 0) {
                return `[Git Error - Code ${process.exitCode}]\n${stderr || stdout}`;
            }

            return `[Git Success]\n${stdout || "Command completed with no output."}`;

        } catch (error: any) {
            return { status: "error", message: error.message };
        }
    }
}