import { Agent } from "./agent/Agent";
import { FakeLLM } from "./agent/FakeLLM";
import { GeminiProvider } from "./providers/GeminiProvider";

const llm = new GeminiProvider(process.env.GEMINI_API_KEY!);
const agent = new Agent(llm);
async function main(content: string){
    const output = await agent.run(content);
    const lastMessage = output.content;
    return "AI: " + lastMessage;
    
}

console.log(await main("Hi, I am Subhamoy."));
console.log(await main("What is my name?"));