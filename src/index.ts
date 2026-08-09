import { Agent } from "./agent/Agent";
import { GeminiProvider } from "./providers/GeminiProvider";
import { countFile, createAndExecuteFile } from "./tools/FileTools";
import { ToolRegistry } from "./tools/ToolRegistry";


const llm = new GeminiProvider(process.env.GEMINI_API_KEY!);
const toolRegistry = new ToolRegistry();
toolRegistry.registerTool(countFile);
toolRegistry.registerTool(createAndExecuteFile);

const agent = new Agent(llm, toolRegistry);
async function main(content: string){
    const output = await agent.run(content);
    // const lastMessage = output.text;

    return "AI: " + JSON.stringify(output.text);
    
}

console.log(await main("Create a file name hello.ts with the following code: console.log('Hey it\'s me Subhamoy...cool!!!')"));