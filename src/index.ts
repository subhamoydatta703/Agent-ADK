import { Agent } from "./agent/Agent";
import { GeminiProvider } from "./providers/GeminiProvider";
import { countFile, findFile, appendFileTool, replaceFileContent } from "./tools/FileTools";
import { ToolRegistry } from "./tools/ToolRegistry";

const llm = new GeminiProvider(process.env.GOOGLE_GEMINI_API_KEY!);
const toolRegistry = new ToolRegistry();
toolRegistry.registerTool(countFile);
// toolRegistry.registerTool(createAndExecuteFile);
// toolRegistry.registerTool(gitStatus);
// toolRegistry.registerTool(search);
// toolRegistry.registerTool(readMultipleFiles);
// toolRegistry.registerTool(createAndWritePlan);
toolRegistry.registerTool(findFile);
toolRegistry.registerTool(replaceFileContent);
toolRegistry.registerTool(appendFileTool);

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

console.log(await main("Read the Math.ts file and add a function to it called power that takes two numbers as arguments and returns the first number raised to the power of the second number"));