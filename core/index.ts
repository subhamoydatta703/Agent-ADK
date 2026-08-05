import { Agent } from "./Agent";
import { FakeLLM } from "./FakeLLM";
import { GeminiProvider } from "../providers/GeminiProvider";

const llm = new GeminiProvider(process.env.GEMINI_API_KEY!);
const agent = new Agent(llm);
async function main(content: string){
    const op = await agent.run(content);
    return op
    
}

console.log(await main("Hi, I am Subhamoy."));
console.log(await main("What is my name?"));