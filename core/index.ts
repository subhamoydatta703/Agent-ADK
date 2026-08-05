import { Agent } from "./Agent";
import { FakeLLM } from "./FakeLLM";


async function main(content: string){
    const llm = new FakeLLM();
    const agent = new Agent(llm);
    const output = await agent.run(content);
    console.log(output);
}

main("Hello, how are you?");
main("What is your name?");
