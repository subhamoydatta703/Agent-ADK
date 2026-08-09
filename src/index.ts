import { Agent } from "./agent/Agent";
import { GeminiProvider } from "./providers/GeminiProvider";
import { countFile, createAndExecuteFile } from "./tools/FileTools";
import { ToolRegistry } from "./tools/ToolRegistry";
import { gitStatus } from "./tools/GitTools";


const llm = new GeminiProvider(process.env.GEMINI_API_KEY!);
const toolRegistry = new ToolRegistry();
toolRegistry.registerTool(countFile);
toolRegistry.registerTool(createAndExecuteFile);
toolRegistry.registerTool(gitStatus);

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

console.log(await main("Show me the status of the git repository"));