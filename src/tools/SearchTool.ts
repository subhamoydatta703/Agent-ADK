import { tavily } from "@tavily/core";
import { z } from "zod";

const searchSchema = z.object({
    query: z.string().describe("The search query").min(1)
})
const tvly = tavily({ apiKey: process.env.TVLY_API_KEY });

export const search = {
    name: "search",
    description: "Search the web for information",
    parameters: searchSchema,
    execute: async (args: z.infer<typeof searchSchema>) => {
        if (!tvly) {
            throw new Error("TVLY_API_KEY is not set");
        }
        const parsed = searchSchema.parse(args);
        try {
            // const response = await tavily.search(parsed.query);
            const response = await tvly.search(parsed.query);

            return { message: "Search tool executed successfully\n", data: response };
        } catch (error) {
            return { message: "Search tool failed" };
        }
    }
}