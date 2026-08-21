import { Agent } from "./agent/Agent";
import { GeminiProvider } from "./providers/GeminiProvider";
import { codeTool, codingContextTool } from "./tools/CodingTools";
import { countFile, findFile, appendFileTool, editFile, createAndWritePlan, readMultipleFiles, createAndExecuteFile, createFile, deleteFile, getProjectTree } from "./tools/FileTools";
import { gitStatus } from "./tools/GitTools";
import { search } from "./tools/SearchTool";
import { executeCommand } from "./tools/executeTools";
import { ToolRegistry } from "./tools/ToolRegistry";

const llm = new GeminiProvider(process.env.GOOGLE_GEMINI_API_KEY!);
const toolRegistry = new ToolRegistry();
// toolRegistry.registerTool(countFile);
// toolRegistry.registerTool(createAndExecuteFile);
toolRegistry.registerTool(gitStatus);
// toolRegistry.registerTool(search);
// toolRegistry.registerTool(readMultipleFiles);
// toolRegistry.registerTool(createAndWritePlan);
// toolRegistry.registerTool(findFile);
// toolRegistry.registerTool(appendFileTool);
// toolRegistry.registerTool(editFile);
toolRegistry.registerTool(codingContextTool);
// toolRegistry.registerTool(codeTool)
toolRegistry.registerTool(executeCommand)
// toolRegistry.registerTool(createFile)
// toolRegistry.registerTool(executeTerminalCommand);
// toolRegistry.registerTool(deleteFile);
toolRegistry.registerTool(getProjectTree);


const agent = new Agent(llm, toolRegistry);
async function main(content: string){
    const output = await agent.run(content);
    // const lastMessage = output.text;
const cleaned = output!.text.replace(/^\s*\*\s*/gm, "")
  .replace(/\*\*/g, "")
  .replace(/`/g, "");
    return "\nAI AGENT: \n" + cleaned;
    
}



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

// console.log(await main("Actually i worked from 9 am to 7.13 pm currently without too much break and i was working on you to make you better and fix and updates your codebases. But i have too much negative power on my eyes and now i use eye drop but still feels little bit of pain and sleepyness on eyes. But i still have to do dsa and my japanese practice today. So i want your suggetion how to do? what to do with a plan or schedule in this matter. You can create a text file to genrate or show that"));
// 
// console.log(await main("Read the codebase of Agent.ts file, read its codebase and also read the codebase of GeminiStreaming.ts file, then create a file(create file where you stored the plan) to slow down the streaming speed and also improve the streaming text and structure. You can search over the internet for any kind of data related to it if needed. Do not hallucinate, Do not update any codebase. Justmake the plan with restect to Agent.ts and GeminiStreaming.ts, Did not want to modify other files. Just create the plan according to the instruction."+SYSTEM_PROMPT))

// console.log(await main("Hi"))



// console.log(await main("Implement streaming_improvement_plan.md file perfectly without any halluinations. Implement the file content in the codebase properly, and step by step. DO not update other codebases or other files that are not mentioned in the streaming_improvement_plan.md file."+SYSTEM_PROMPT))

// console.log(await main(SYSTEM_PROMPT+"\n\n"+user_prompt))

// console.log(await main("Read the codebase of Agent.ts file, read its codebase and also read the codebase of GeminiStreaming.ts file, then create a file where you show the review of both files and provide a detailed analysis of the codebase and its functionality."+SYSTEM_PROMPT))


// console.log(await main("Tell me how i can properly use GeminiStreaming inside Agent.ts without any issue and create a new plan of file in docs folder and write the plan in that file."+SYSTEM_PROMPT))


// console.log(await main("Based on docs/GEMINI_STREAMING_INTEGRATION_PLAN.md file update only 2 files: 1. LLMProvider.ts 2. GeminiStreaming.ts, and verify that the codev=base of these 2 files updated based on docs/GEMINI_STREAMING_INTEGRATION_PLAN.md file and do not update any other files or folders. After all of these steps are completed, read the Agent.ts file and create another implementation plan along to how we can implement the streaming effect in the Agent.ts based on the updated LLMProvider.ts and GeminiStreaming.ts files.along with codebase that will show how and which part to update in the Agent.ts file."+SYSTEM_PROMPT))

// console.log(await main("Read the whole codebase and create a plan (file name: SECURITY_PLAN.md in docs folder) in detail to implement guardrails redarding input, output and tools to engance security and prevent any kind of jailbreak or prompt injection attacks or any other security vulnerabilities. Read each and every folders, each and every files, do not midy any codebase and do not hallucinate."+SYSTEM_PROMPT))

// console.log(await main("Check the OutputGuardrails.ts, GuardrailPrompt.ts, GuardrailResult.ts and Agent.ts files and tell me in that why the isSafe becomes undefined when i give the final response to the outputGuardrails.ts when tool.length==0"+SYSTEM_PROMPT));
console.log(await main("Check the git status and make a make a git push to the main branch with a commit message"+SYSTEM_PROMPT));
// console.log(await main("Check the git status"+SYSTEM_PROMPT));
// console.log(await main("Check the guardrails folder and sub folder and its file structure, and  tell me does this structure is ok or not or should i change anything in the structure"+SYSTEM_PROMPT));
