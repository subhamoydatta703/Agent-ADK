import { z } from "zod";
import type { Tool } from "./ToolRegistry";
import { createInterface } from "node:readline/promises";

const executeSchema = z.object({
    command: z
        .string()
        .describe(
            "The actual executable name only, such as git, bun, node, npm, npx, tsc, or python. " +
            "Do not use shell built-ins or aliases such as ls, cat, dir, type, cd, echo, mkdir, find, cmd, grep, pwd."
        ),

    args: z
        .array(z.string())
        .describe(
            "Arguments for the executable. Each argument must be a separate string."
        )
        .default([]),
});

export type CommandPolicy = {
    // Executables that run without confirmation.
    safe: string[];
    // Shell built-ins / aliases that don't exist as standalone executables
    // (or behave differently when spawned without a shell). Always rejected,
    // never even offered for confirmation.
    blocked: string[];
};

const commandPolicy: CommandPolicy = {
    safe: [
        "git",
        "bun",
        "bunx",
        "node",
        "npm",
        "npx",
        "tsc",
        "python",
    ],
    blocked: [
        "ls",
        "cat",
        "dir",
        "type",
        "cd",
        "echo",
        "mkdir",
        "rmdir",
        "find",
        "cmd",
        "grep",
        "pwd",
        "rm",
        "cp",
        "mv",
        "touch",
        "which",
        "where",
    ],
};

type Validation = "safe" | "blocked" | "confirmation_required";

function validateCommand(command: string): Validation {
    const cmd = command.trim().toLowerCase();

    if (commandPolicy.blocked.includes(cmd)) {
        return "blocked";
    }

    if (commandPolicy.safe.includes(cmd)) {
        return "safe";
    }

    return "confirmation_required";
}

async function askForConfirmation(command: string, args: string[]): Promise<boolean> {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const display = [command, ...args].join(" ");
    const answer = await rl.question(`Run "${display}"? (Y/N): `);

    rl.close();

    return answer.trim().toLowerCase() === "y";
}

function blockedResponse(command: string) {
    return {
        success: false,
        status: "blocked" as const,
        command,
        error:
            `"${command}" is not usable here — it's a shell built-in or alias that does not run ` +
            `as a standalone executable on this platform. Do not retry this command or a similar ` +
            `shell alternative (ls/cat/dir/type/find/cmd/grep/etc are all blocked). ` +
            `Use find_file to locate a file, read_file or read_multiple_files to read contents, ` +
            `read_directory to read an entire directory recursively, or list_files to enumerate ` +
            `file paths without reading contents.`,
    };
}

function rejectedResponse(command: string) {
    return {
        success: false,
        status: "rejected" as const,
        command,
        error: "Command execution was rejected by the user.",
    };
}

export const executeCommand: Tool = {
    name: "execute_command",

    description:
        "Execute a real, standalone executable directly (no shell involved). " +
        "USE THIS only for build/run/package-manager/VCS tools such as git, bun, node, npm, npx, tsc, python. " +
        "DO NOT use this for file inspection or shell built-ins/aliases " +
        "(ls, cat, dir, type, cd, echo, mkdir, rmdir, find, cmd, grep, pwd, rm, cp, mv, touch, which, where) " +
        "— these are blocked and will always return an error instead of running. " +
        "To inspect files instead, use find_file, read_file, read_multiple_files, read_directory, or list_files. " +
        "command must be the executable name only; put every argument as a separate string in args.",

    parameters: executeSchema,

    execute: async (args: z.infer<typeof executeSchema>) => {
        const parsed = executeSchema.parse(args);
        const command = parsed.command.trim();
        const validation = validateCommand(command);

        if (validation === "blocked") {
            return blockedResponse(command);
        }

        if (validation === "confirmation_required") {
            const confirmed = await askForConfirmation(command, parsed.args);
            if (!confirmed) {
                return rejectedResponse(command);
            }
        }

        try {
            const proc = Bun.spawn([command, ...parsed.args], {
                stdout: "pipe",
                stderr: "pipe",
            });

            const stdout = await new Response(proc.stdout).text();
            const stderr = await new Response(proc.stderr).text();
            const exitCode = await proc.exited;

            return {
                success: exitCode === 0,
                status: "executed" as const,
                command,
                args: parsed.args,
                exitCode,
                stdout,
                stderr,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const looksLikeMissingBinary = /ENOENT|not recognized|not found|no such file/i.test(message);

            return {
                success: false,
                status: "failed" as const,
                command,
                args: parsed.args,
                exitCode: null,
                stdout: "",
                stderr: message,
                hint: looksLikeMissingBinary
                    ? `"${command}" was not found as an executable on this system. If you were trying to ` +
                      `inspect files or directories, use find_file / read_file / read_multiple_files / ` +
                      `read_directory / list_files instead of a shell command.`
                    : undefined,
            };
        }
    },
};