import { z } from "zod";
import { readdir } from "fs/promises";

const countFileSchema = z.object({
    path: z.string().describe("The path to the directory to count files in").min(1)
});

export const countFile = {
    name: "count_file",
    description: "Count the number of files in a directory",
    parameters: countFileSchema,
    execute: async (args: z.infer<typeof countFileSchema>) => {
        const files = await readdir(args.path);
        return { count: files.length };
    }
};