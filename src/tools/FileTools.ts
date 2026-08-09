import { z } from "zod";
import { readdir } from "fs/promises";
import { type Tool } from "./ToolRegistry";
import { write } from "bun";

const countFileSchema = z.object({
    path: z.string().describe("The path to the directory to count files in").min(1)
});

const createAndExecuteFileSchema = z.object({
    path: z.string().describe("The path to the file to create").min(1),
    code: z.string().describe("The code to write to the file").min(1)
});





export const countFile: Tool = {
    name: "count_file",
    description: "Count the number of files in a directory",
    parameters: countFileSchema,
    execute: async (args: z.infer<typeof countFileSchema>) => {
        const parsed = countFileSchema.parse(args);
        const files = await readdir(parsed.path);
        return { count: files.length };
    }
};


export const createAndExecuteFile: Tool = {
    name: "create_and_execute_file",
    description: "Create a file and execute it",
    parameters: z.object({
        path: z.string().describe("The path to the file to create").min(1),
        code: z.string().describe("The code to write to the file").min(1)
    }),
    execute: async (args: z.infer<typeof createAndExecuteFileSchema>) => {
        const parsed = createAndExecuteFileSchema.parse(args);
        const filePath = parsed.path;
        const code = parsed.code;

        // const filePath = parsed.path;
        // const code = parsed.code;

        // 1. Write the file
        await write(filePath, code);

        // 2. Spawn a background process to execute it
        Bun.spawn([
            "cmd.exe",
            "/c",
            "start",
            "cmd.exe",
            "/k",
            "bun",
            "run",
            filePath,
        ]);

        // 3. Capture the output text
        // const output = await new Response(process.stdout).text();
        // console.log(output);
        // console.info(output);

        return { output: "File created and executed successfully" };
    }
};
