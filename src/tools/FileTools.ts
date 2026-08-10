import { z } from "zod";
import { readdir } from "fs/promises";
import { type Tool } from "./ToolRegistry";
import { write } from "bun";
import { cwd } from "process";
import path, { join, resolve } from "path";
// import { appendFile } from "node:fs/promises";
import { replaceInFile } from "replace-in-file";

const countFileSchema = z.object({
    path: z.string().describe("The path to the directory to count files in").min(1)
});

const createAndExecuteFileSchema = z.object({
    path: z.string().describe("The path to the file to create").min(1),
    code: z.string().describe("The code to write to the file").min(1)
});

const appendFileSchema = z.object({
    path: z.string().describe("The path to the file to append to").min(1),
    text: z.string().describe("The text to append to the file").min(1)
});


const findFileSchema = z.object({
    name: z
        .string()
        .min(1)
        .describe("Name or part of the file name to search for")
});


export const findFile: Tool = {
    name: "find_file",

    description:
        "Find a single file by name and return its actual path.",

    parameters: findFileSchema,

    execute: async (args: z.infer<typeof findFileSchema>) => {
        const { name } = findFileSchema.parse(args);

        const paths = await getFilePaths(process.cwd());

        const matches = paths.filter(path =>
            path.toLowerCase().includes(name.toLowerCase())
        );

        if (matches.length === 0) {
            throw new Error(`No file found matching: ${name}`);
        }

        if (matches.length > 1) {
            return {
                output: "Multiple files found",
                files: matches
            };
        }

        return {
            path: matches[0]
        };
    }
};



const editFileSchema = z.object({
    path: z
        .string()
        .min(1)
        .describe("Path of the file to edit"),

    target: z
        .string()
        .optional()
        .describe(
            "Existing text to use as the target. Not required when position is start or end."
        ),

    text: z
        .string()
        .describe("Text to insert or use as replacement"),

    position: z
        .enum(["start", "end", "before", "after", "replace"])
        .describe(
            "Where to place the text: start, end, before target, after target, or replace target."
        )
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


const replaceFileContentSchema = z.object({
    path: z
        .string()
        .min(1)
        .describe("Path of the existing file to update"),

    oldText: z
        .string()
        .min(1)
        .describe("Exact text currently present in the file"),

    newText: z
        .string()
        .describe("New text that should replace the old text")
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

export const replaceFileContent: Tool = {
    name: "update_file",
    description: "Update a file with the given text",
    parameters: replaceFileContentSchema,
    execute: async (args: z.infer<typeof replaceFileContentSchema>) => {
        const parsed = replaceFileContentSchema.parse(args);
        const filePath = parsed.path;
        const oldText = parsed.oldText;
        const newText = parsed.newText;
        const results = await replaceInFile({
            files: filePath,
            from: oldText,
            to: newText
        });
        return {
            output: "File updated successfully",
            results
        };
    }
};

export const appendFileTool: Tool = {
    name: "append_file",
    description: "Append text to a file",
    parameters: appendFileSchema,
    execute: async (args: z.infer<typeof appendFileSchema>) => {
        const parsed = appendFileSchema.parse(args);
        const filePath = parsed.path;
        const file = Bun.file(filePath);
        const existingText = await file.text();
        const newText = parsed.text;
        await Bun.write(filePath, existingText + "\n" + newText);
        return { output: "File appended successfully" };
    }
};


export const editFile: Tool = {
    name: "edit_file",

    description:
        "Edit an existing file by inserting text at the start/end, inserting before/after a target, or replacing a target.",

    parameters: editFileSchema,

    execute: async (
        args: z.infer<typeof editFileSchema>
    ) => {
        const parsed = editFileSchema.parse(args);

        const file = Bun.file(parsed.path);

        // 1. Check if file exists
        if (!(await file.exists())) {
            throw new Error(
                `File does not exist: ${parsed.path}`
            );
        }

        // 2. Read existing file
        const content = await file.text();

        let updatedContent: string;

        // 3. Insert at beginning
        if (parsed.position === "start") {
            updatedContent = parsed.text + content;
        }

        // 4. Insert at end
        else if (parsed.position === "end") {
            updatedContent = content + parsed.text;
        }

        // 5. All other operations require a target
        else {
            if (!parsed.target) {
                throw new Error(
                    `Target is required when position is "${parsed.position}".`
                );
            }

            const targetIndex = content.indexOf(parsed.target);

            // Target doesn't exist
            if (targetIndex === -1) {
                throw new Error(
                    `Target text was not found in ${parsed.path}`
                );
            }

            // Insert before target
            if (parsed.position === "before") {
                updatedContent =
                    content.slice(0, targetIndex) +
                    parsed.text +
                    content.slice(targetIndex);
            }

            // Insert after target
            else if (parsed.position === "after") {
                const endOfTarget =
                    targetIndex + parsed.target.length;

                updatedContent =
                    content.slice(0, endOfTarget) +
                    parsed.text +
                    content.slice(endOfTarget);
            }

            // Replace target
            else {
                updatedContent =
                    content.slice(0, targetIndex) +
                    parsed.text +
                    content.slice(
                        targetIndex + parsed.target.length
                    );
            }
        }

        // 6. Write updated content back to the same file
        await Bun.write(
            parsed.path,
            updatedContent
        );

        return {
            success: true,
            message: "File edited successfully",
            path: parsed.path
        };
    }
};