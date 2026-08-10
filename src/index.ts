import { Agent } from "./agent/Agent";
import { GeminiProvider } from "./providers/GeminiProvider";
import { countFile, createAndExecuteFile, readMultipleFiles, createAndWritePlan } from "./tools/FileTools";
import { ToolRegistry } from "./tools/ToolRegistry";
import { gitStatus } from "./tools/GitTools";
import { search } from "./tools/SearchTool";

const llm = new GeminiProvider(process.env.GEMINI_API_KEY!);
const toolRegistry = new ToolRegistry();
toolRegistry.registerTool(countFile);
toolRegistry.registerTool(createAndExecuteFile);
toolRegistry.registerTool(gitStatus);
toolRegistry.registerTool(search);
toolRegistry.registerTool(readMultipleFiles);
toolRegistry.registerTool(createAndWritePlan);

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

console.log(await main("Check the current git status"));