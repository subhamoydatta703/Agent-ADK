export interface GuardrailContext {
    agentName?: string;
    userId?: string;
    sessionId?: string;
    timestamp: Date;
    input: string;
    output?: string;
    toolCalls?: any[];
}