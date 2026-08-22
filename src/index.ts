import { Agent } from "./agent/Agent";
import { GeminiProvider } from "./providers/GeminiProvider";
import { codeTool, codingContextTool } from "./tools/CodingTools";
import { gitStatus } from "./tools/GitTools";
import { executeCommand } from "./tools/executeTools";
import { ToolRegistry } from "./tools/ToolRegistry";
import { sandboxManager } from "./tools/ExecutionManager";

const llm = new GeminiProvider(process.env.GOOGLE_GEMINI_API_KEY!);
const toolRegistry = new ToolRegistry();
toolRegistry.registerTool(gitStatus);
toolRegistry.registerTool(codingContextTool);
toolRegistry.registerTool(codeTool);
toolRegistry.registerTool(executeCommand);

// The execute_command tool and the Agent share one ExecutionManager so the
// Docker sandbox lifecycle is owned by the Agent: it starts on first use and is
// torn down (via try/finally) when the task finishes, fails, times out, or is
// cancelled — never after every individual command.
const agent = new Agent(llm, toolRegistry, 60, "Agent", sandboxManager);

async function main(content: string) {
    const output = await agent.run(content);
    const cleaned = output!.text.replace(/^\s*\*\s*/gm, "")
        .replace(/\*\*/g, "")
        .replace(/`/g, "");
    return "\nAI AGENT: \n" + cleaned;
}

const SYSTEM_PROMPT = `For listing, finding, or reading files or directories, ALWAYS use list_files,
find_file, read_file, read_multiple_files, or read_directory. Whenever user mentioned to create a plan or make a plan or create a walkthrough or make a walkthrough then always create a file with a file name related to the plan (a detailed plan with steps and reasoning) or walkthrough (steps you implemented or performed and the reasoning) in the docs/ folder. NEVER write and
execute a script (Python, Node, or otherwise) to accomplish something one of
these tools already does — that wastes steps and creates unnecessary files.
Only use execute_command/python for tasks that genuinely require running code
(builds, tests, computations) — not for file inspection.
`;

const userQuery = process.argv[2] ?? "Check the Git status and do a git push to the main branch with a proper commit message.";

console.log(await main(SYSTEM_PROMPT + "\n" + userQuery));
