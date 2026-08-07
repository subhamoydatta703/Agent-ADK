import { Agent } from "./agent/Agent";
import { GeminiProvider } from "./providers/GeminiProvider";
import { countFile } from "./tools/FileTools";
import { ToolRegistry } from "./tools/ToolRegistry";


const llm = new GeminiProvider(process.env.GEMINI_API_KEY!);
const toolRegistry = new ToolRegistry();
toolRegistry.registerTool(countFile);
const agent = new Agent(llm, toolRegistry);
async function main(content: string){
    const output = await agent.run(content);
    // const lastMessage = output.text;

    return "AI: " + JSON.stringify(output.text);
    
}

console.log(await main("count the number of files in the directory of E:\\my_agent_adk"));