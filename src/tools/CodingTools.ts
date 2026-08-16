import z from "zod";
import { ToolRegistry, type Tool } from "../tools/ToolRegistry";
import { createFile, editFile, readMultipleFiles, } from "./FileTools";


const codingContextToolSchema = z.object({
    path: z.string(),
    instruction: z.string(),
})

export const codingContextTool: Tool = {
    name: "coding_context_tool",
    description: "A tool for getting coding context",
    parameters: codingContextToolSchema,

    async execute(args: z.infer<typeof codingContextToolSchema>) {
        const { path, instruction } = codingContextToolSchema.parse(args);
        // Implementation here

        const tool = readMultipleFiles;
        const filesContent = await tool.execute({ paths: [path] });
        // console.log(files);

        return {
            path,
            files: filesContent,
            instruction,
        }
    }
}



// code tool

const codeToolSchema = z.discriminatedUnion("operation", [
    // Create a new file
    z.object({
        operation: z.literal("create"),
        path: z.string(),
        content: z.string(),
    }),

    // Replace the entire existing file
    z.object({
        operation: z.literal("write"),
        path: z.string(),
        content: z.string(),
    }),

    // Modify specific parts
    z.object({
        operation: z.literal("edit"),
        path: z.string(),
        changes: z.array(
            z.discriminatedUnion("type", [
                z.object({
                    type: z.literal("before"),
                    target: z.string(),
                    content: z.string(),
                }),

                z.object({
                    type: z.literal("after"),
                    target: z.string(),
                    content: z.string(),
                }),

                z.object({
                    type: z.literal("replace"),
                    target: z.string(),
                    content: z.string(),
                }),

                z.object({
                    type: z.literal("delete"),
                    target: z.string(),
                }),
            ])
        ),
    }),
]);


export const codeTool: Tool = {
    name: "code_tool",
  description: `
Perform code modifications.

Choose exactly one operation:

1. create
   Use when the file does not exist.
   Provide the complete file content.

2. write
   Use when an existing file must be completely rewritten.
   Provide the complete desired file content.
   This replaces the entire file.

3. edit
   Use when only specific parts of an existing file need modification.
   Provide changes containing target and content.

IMPORTANT:
- Do not use "replace" as the operation.
- "replace" is only an edit change type.
- Never use "write" for a small localized change.
- Never use "edit" when replacing the entire file.
`,
    parameters: codeToolSchema,

    async execute(args: z.infer<typeof codeToolSchema>) {
        const parsed = codeToolSchema.parse(args);

        if (parsed.operation === "create") {
            if (!createFile) return "Create file tool not registered";
            const result = await createFile.execute({ path: parsed.path, text: parsed.content });
            const verified = await readCurrentContent(parsed.path);
            return { ...result, currentFileContent: verified };
        }

        if (parsed.operation === "write") {
            if (!createFile) return "Create file tool not registered";
            const result = await createFile.execute({ path: parsed.path, text: parsed.content });
            const verified = await readCurrentContent(parsed.path);
            return { ...result, currentFileContent: verified };
        }

        if (parsed.operation === "edit") {
            if (!editFile) return "Edit file tool not registered";
            const results = [];

            for (const change of parsed.changes) {
                if (change.type === "replace" && change.target === change.content) {
                    return {
                        success: false,
                        status: "no_op",
                        message: "The requested edit would not change the file because target and replacement are identical.",
                    };
                }

                let result;
                switch (change.type) {
                    case "replace":
                        result = await editFile.execute({ path: parsed.path, target: change.target, text: change.content, position: "replace" });
                        break;
                    case "before":
                        result = await editFile.execute({ path: parsed.path, target: change.target, text: change.content, position: "before" });
                        break;
                    case "after":
                        result = await editFile.execute({ path: parsed.path, target: change.target, text: change.content, position: "after" });
                        break;
                    case "delete":
                        result = await editFile.execute({ path: parsed.path, target: change.target, text: "", position: "replace" });
                        break;
                }
                results.push(result);
            }

            // ground the response: any failed change makes the whole op non-success
            const anyFailed = results.some((r: any) => r && r.success === false);
            const verified = await readCurrentContent(parsed.path);

            return {
                success: !anyFailed,
                operation: "edit",
                path: parsed.path,
                results,
                
                currentFileContent: verified,
            };
        }
    }
};

async function readCurrentContent(path: string): Promise<string> {
    try {
        const result = await readMultipleFiles.execute({ paths: [path] });
        const file = (result as any)?.files?.find((f: any) => f.path === path);
        return file?.content ?? "(could not read file after operation)";
    } catch {
        return "(could not read file after operation)";
    }
}