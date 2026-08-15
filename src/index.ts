import { Agent } from "./agent/Agent";
import { GeminiProvider } from "./providers/GeminiProvider";
import { countFile, findFile, appendFileTool, editFile, createAndWritePlan, readMultipleFiles, createAndExecuteFile } from "./tools/FileTools";
import { gitStatus } from "./tools/GitTools";
import { search } from "./tools/SearchTool";
import { executeTerminalCommand } from "./tools/TerminalTools";
import { ToolRegistry } from "./tools/ToolRegistry";

const llm = new GeminiProvider(process.env.GOOGLE_GEMINI_API_KEY!);
const toolRegistry = new ToolRegistry();
// toolRegistry.registerTool(countFile);
// toolRegistry.registerTool(createAndExecuteFile);
toolRegistry.registerTool(gitStatus);
// toolRegistry.registerTool(search);
toolRegistry.registerTool(readMultipleFiles);
// toolRegistry.registerTool(createAndWritePlan);
toolRegistry.registerTool(findFile);
toolRegistry.registerTool(appendFileTool);
toolRegistry.registerTool(editFile);
toolRegistry.registerTool(executeTerminalCommand);	

const agent = new Agent(llm, toolRegistry);
async function main(content: string){
    const output = await agent.run(content);
    // const lastMessage = output.text;
const cleaned = output.text
  .replace(/^\s*\*\s*/gm, "")
  .replace(/\*\*/g, "")
  .replace(/`/g, "");
    return "AI: " + cleaned;
    
}


console.log(await main("Implement the following task: 1. Read the Git Status 2. Commit the changes with a commit message 3. Push the changes to the remote repository of main branch 4. Report the status of these tasks 5. Implement these tasks one by one 6. Do not hallucinate"))