# my_agent_adk

An AI Agent Development Kit built with TypeScript and [Bun](https://bun.com). It wraps Google's
Gemini models with a function/tool calling agent loop, letting the agent read, list, count, create,
edit, append, and execute files, run git commands, execute commands in the terminal, and search the
web.

## Requirements

- [Bun](https://bun.com) (project was created with `bun init` in bun v1.3.14)
- A `.env` file (`.env` is gitignored) containing:
  - `GOOGLE_GEMINI_API_KEY` — Google Gemini API key
  - `TVLY_API_KEY` — Tavily API key (used by the web search tool)

## Install dependencies

```bash
bun install
```

## Run

Default `bun init` entry point:

```bash
bun run index.ts
```

Agent demo (wires Gemini + tools + agent loop and runs a sample task):

```bash
bun run src/index.ts
```

## Project structure

```
.
├── index.ts                  # Bun init default entry point
├── Math.ts                   # Arithmetic helper functions
├── src
│   ├── index.ts              # Agent demo: Gemini + ToolRegistry + Agent
│   ├── agent
│   │   ├── Agent.ts          # Agent loop (maxSteps, executes tool calls)
│   │   ├── FakeLLM.ts        # Test LLM provider that echoes input
│   │   └── Message.ts        # Message type (role / content / parts)
│   ├── providers
│   │   ├── GeminiProvider.ts # Gemini LLM provider (@google/genai)
│   │   ├── LLMProvider.ts    # LLM provider interface
│   │   └── LLMResponse.ts    # LLM response type
│   └── tools
│       ├── ToolRegistry.ts   # Tool interface + registry (register/get)
│       ├── FileTools.ts      # find/read/list/count/create/edit/append/execute tools
│       ├── GitTools.ts       # git_status tool
│       ├── TerminalTools.ts  # execute_terminal_command tool (runs shell commands via Bun)
│       └── SearchTool.ts     # web search tool (@tavily/core)
└── package.json
```

## Tools

The agent exposes tools registered on a `ToolRegistry`. Currently `count_file` and
`execute_terminal_command` are enabled in `src/index.ts` (the others are commented out there), but
the full set implemented includes:

- `count_file` — count directory entries
- `find_file` — locate a single file by name
- `read_file`, `read_multiple_files` — read one or more files
- `read_directory`, `list_files` — read or list a directory recursively
- `create_file`, `create_and_execute_file` — create, optionally run, a new file
- `append_file`, `edit_file` — modify an existing file
- `create_and_write_plan` — persist a plan to a new file
- `git_status` — run git commands
- `execute_terminal_command` — execute a command in the terminal
    - Note: The `execute_terminal_command` tool now includes a validation check against a `safeCommands` list (`git`, `bun`, `bunx`, `node`, `npm`, `npx`, `tsc`, `python`). Commands not in this list require user confirmation via a prompt.
- `search` — search the web via Tavily

## Tech stack

- **Runtime:** Bun
- **Language:** TypeScript (strict, ESNext, bundler module resolution)
- **LLM:** `@google/genai` (model `gemini-3.1-flash-lite`, AUTO function calling)
- **Validation:** `zod` (schemas converted to JSON Schema for Gemini)
- **Other:** `dotenv`, `replace-in-file`, `@tavily/core`
