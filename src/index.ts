import { Agent } from "./agent/Agent";
import { GeminiProvider } from "./providers/GeminiProvider";
import { countFile, findFile, appendFileTool, editFile, createAndWritePlan, readMultipleFiles, createAndExecuteFile } from "./tools/FileTools";
import { gitStatus } from "./tools/GitTools";
import { search } from "./tools/SearchTool";
import { ToolRegistry } from "./tools/ToolRegistry";

const llm = new GeminiProvider(process.env.GOOGLE_GEMINI_API_KEY!);
const toolRegistry = new ToolRegistry();
toolRegistry.registerTool(countFile);
toolRegistry.registerTool(createAndExecuteFile);
toolRegistry.registerTool(gitStatus);
toolRegistry.registerTool(search);
toolRegistry.registerTool(readMultipleFiles);
toolRegistry.registerTool(createAndWritePlan);
toolRegistry.registerTool(findFile);
toolRegistry.registerTool(appendFileTool);
toolRegistry.registerTool(editFile);

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

const errorMsg = [{
	"resource": "/e:/my_agent_adk/Math.ts",
	"owner": "typescript",
	"code": "1109",
	"severity": 8,
	"message": "Expression expected.",
	"source": "ts",
	"startLineNumber": 10,
	"startColumn": 16,
	"endLineNumber": 10,
	"endColumn": 17,
	"modelVersionId": 8,
	"origin": "extHost1"
}]

console.log(await main("I got this error message: " + JSON.stringify(errorMsg) + ". I think there is a bug in my Math.ts file. Read the " + JSON.stringify(errorMsg) + " file, find the bug and fix it and then report me the fix"))