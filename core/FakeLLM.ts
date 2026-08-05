import { type Message } from "./Message";

export class FakeLLM {
// async generate(content:string):Promise<Message[]> {
// return [{ role: "assistant", content }];
    
// }
    async respond(content:Message): Promise<Message[]> {
        return [{ role: "assistant", content: `${content.content}  Hello, how can I help you?` }];
    }
}