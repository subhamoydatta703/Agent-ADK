import { z } from "zod";
import { readdir } from "fs/promises";
import { type Tool } from "./ToolRegistry";
import { write } from "bun";
import { cwd } from "process";
import path, { join, resolve } from "path";

const countFileSchema = z.object({
    path: z.string().describe("The path to the directory to count files in").min(1)
});

const createAndExecuteFileSchema = z.object({
    path: z.string().describe("The path to the file to create").min(1),
    code: z.string().describe("The code to write to the file").min(1)
});


const readMultipleFilesSchema = z.object({
    dir: z
        .string()
        .min(1)
        .describe("Directory to read files from")
});
const createFileSchema = z.object({
    path: z.string().describe("The path to the file to create").min(1),
    text: z.string().describe("The text to write to the file").min(1)
});


const createAndWritePlanSchema = z.object({
    filePath: z.string().describe("The path to the file to create").min(1),
    plan: z.string().describe("The plan to write to the file").min(1)
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



export const createFile: Tool = {
    name: "create_file",
    description: "Create a file with the given text",
    parameters: createFileSchema,
    execute: async (args: z.infer<typeof createFileSchema>) => {
        const parsed = createFileSchema.parse(args);
        const filePath = parsed.path;
        const text = parsed.text;
        await write(filePath, text);
        return { output: "File created successfully" };
    }
};




export const createAndWritePlan: Tool = {
    name: "create_and_write_plan",
    description: "Create a file with the given plan",
    parameters: createAndWritePlanSchema,
    execute: async (args: z.infer<typeof createAndWritePlanSchema>) => {
        const parsed = createAndWritePlanSchema.parse(args);
        const filePath = parsed.filePath;
        const plan = parsed.plan;
        await write(filePath, plan);
        return { output: "File created and plan written successfully" };
    }
};




async function getFilePaths(dir: string): Promise<string[]> {
    const entries = await readdir(dir, {
        withFileTypes: true
    });

    const paths: string[] = [];

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isFile()) {
            paths.push(fullPath);
        }

        if (entry.isDirectory()) {
            const nestedPaths = await getFilePaths(fullPath);
            paths.push(...nestedPaths);
        }
    }

    return paths;
}


export const readMultipleFiles: Tool = {
    name: "read_multiple_files",

    description:
        "Find and read all files inside a directory and its subdirectories.",

    parameters: readMultipleFilesSchema,

    execute: async (
        args: z.infer<typeof readMultipleFilesSchema>
    ) => {
        const { dir } = readMultipleFilesSchema.parse(args);

        const paths = await getFilePaths(dir);

        const files = [];

        for (const path of paths) {
            try {
                const content = await Bun.file(path).text();

                files.push({
                    path,
                    content
                });
            } catch {
                // Skip files that cannot be read
            }
        }

        return { files };
    }
};