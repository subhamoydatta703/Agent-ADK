import { Agent } from "./agent/Agent";
import { GeminiProvider } from "./providers/GeminiProvider";
import { codeTool, codingContextTool } from "./tools/CodingTools";
import { countFile, findFile, appendFileTool, editFile, createAndWritePlan, readMultipleFiles, createAndExecuteFile } from "./tools/FileTools";
import { gitStatus } from "./tools/GitTools";
import { search } from "./tools/SearchTool";
import { executeCommand } from "./tools/executeTools";
import { ToolRegistry } from "./tools/ToolRegistry";

const llm = new GeminiProvider(process.env.GOOGLE_GEMINI_API_KEY!);
const toolRegistry = new ToolRegistry();
// toolRegistry.registerTool(countFile);
toolRegistry.registerTool(createAndExecuteFile);
toolRegistry.registerTool(gitStatus);
toolRegistry.registerTool(search);
toolRegistry.registerTool(readMultipleFiles);
toolRegistry.registerTool(createAndWritePlan);
// toolRegistry.registerTool(findFile);
toolRegistry.registerTool(appendFileTool);
toolRegistry.registerTool(editFile);
// toolRegistry.registerTool(codingContextTool);
// toolRegistry.registerTool(codeTool)
toolRegistry.registerTool(executeCommand)
// toolRegistry.registerTool(executeTerminalCommand);


const agent = new Agent(llm, toolRegistry);
async function main(content: string){
    const output = await agent.run(content);
    // const lastMessage = output.text;
const cleaned = output!.text?.replace(/^\s*\*\s*/gm, "")
  .replace(/\*\*/g, "")
  .replace(/`/g, "");
    return "AI: " + cleaned;
    
}


const prompt = `Implement the following tasks:

1. Read and fully understand docs\\gemini_streaming_fix_plan.md before making any changes.
2. Implement the plan strictly and sequentially, one step at a time.
3. Before modifying ANY existing file, read its current contents using the appropriate file-reading tool.
4. Never assume or remember the current contents of a file. Never construct an edit target from the plan, previous context, or memory.
5. When using edit_file with "before", "after", or "replace", the target MUST be copied exactly from the latest read_file result for that file.
6. After modifying a file, verify that the change was applied correctly before proceeding to the next step.
7. Use the required tools to test the implementation.
8. If a test or implementation step fails, inspect the actual current state of the relevant files, identify the cause, fix it, and retest before continuing.
9. Do not hallucinate file contents, tool results, test results, or implementation details.
10. Do not skip any step from the plan.
11. Do not modify files that are not required by the plan.
12. Do not make unrelated refactors, improvements, formatting changes, or architectural changes.
13. Keep the implementation limited to the files explicitly required by the plan, unless a dependency makes another file strictly necessary.
14. After completing the implementation, update docs\\gemini_streaming_fix_plan.md with the actual changes made and the implementation/test status.
15. Do not claim a step is complete unless it was actually implemented and verified.`


const instruction =`If an edit_file operation fails because the target text was not found:
1. Do NOT retry the same edit blindly.
2. Read the file again.
3. Re-evaluate the intended change against the actual current contents.
4. Generate a new exact target from the latest file contents.
5. Retry the edit only after verifying the target exists.`

const   SYSTEM_PROMPT =`For listing, finding, or reading files or directories, ALWAYS use list_files,
find_file, read_file, read_multiple_files, or read_directory. NEVER write and
execute a script (Python, Node, or otherwise) to accomplish something one of
these tools already does — that wastes steps and creates unnecessary files.
Only use execute_command/python for tasks that genuinely require running code
(builds, tests, computations) — not for file inspection.`


// console.log(await main(
//     "Complete these following tasks one by one: " +
//     "1. Inspect the docs/ folder in the project root and add every existing file in that folder to .gitignore in the project root so those files are ignored by Git. " +
//     "2. Do not modify any other files. " +
//     "3. Verify that the .gitignore file was updated correctly by reading it back. " +
//     "4. Do not hallucinate — only report changes you can confirm from tool results. " +
//     "5. Use appropriate tools to inspect docs/. Do not write or execute a script to do this."
// ));

console.log(await main("Now check the git status, and based on the git status perform git add and commit with appropriate message and then push to the remote repository of main branch."));