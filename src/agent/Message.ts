import type { Part } from "@google/genai";

export interface Message {
    role: "user" | "model" | "assistant" | "tool";
    content?: string;
    parts?: Part[];
}
