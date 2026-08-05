import { Agent } from "./Agent";


async function main(content: string){
    const agent = new Agent();
    const output = await agent.run(content);
    console.log(output);
}

main("Hello, how are you?");

