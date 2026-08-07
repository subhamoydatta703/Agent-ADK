import { z } from "zod";
import { readdir } from "fs/promises";
import { type Tool } from "./ToolRegistry";

const countFileSchema = z.object({
    path: z.string().describe("The path to the directory to count files in").min(1)
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