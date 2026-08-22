# my_agent_adk

An AI Agent Development Kit built with TypeScript and [Bun](https://bun.com). It wraps Google's Gemini models with a function/tool calling agent loop, allowing the agent to perform complex tasks by interacting with the filesystem, executing terminal commands, managing git repositories, and performing web searches.

## Features

- **Agent Loop:** A robust agent implementation in `src/agent/` capable of managing tool execution and state.
- **Provider Support:** Integrated Google Gemini support via `@google/genai` in `src/providers/`.
- **Tooling:** A modular registry (`src/tools/`) for adding and executing various tools:
  - **Filesystem:** Tools for reading, listing, searching, creating, editing, and appending files/directories.
  - **Terminal:** Secure execution of predefined terminal commands.
  - **Git:** Git status management.
  - **Search:** Web search capabilities using Tavily.
- **Security:** Guardrail mechanisms for input and output validation to prevent prompt injection and unauthorized actions.

## Requirements

- [Bun](https://bun.com) (project was created with `bun init` in bun v1.3.14)
- A `.env` file containing:
  - `GOOGLE_GEMINI_API_KEY` — Google Gemini API key
  - `TVLY_API_KEY` — Tavily API key

## Install dependencies

```bash
bun install
```

## Running the Agent

To run the agent demo:

```bash
bun run src/index.ts
```

## Docker Lifecycle

The project includes a `docker-compose.yaml` to run a secure development sandbox.

### Standardized Docker Workflow

- **Build image**: `docker compose build`
- **Start services**: `docker compose up -d`
- **Monitor logs**: `docker compose logs -f`
- **Access Sandbox**: `docker compose exec sandbox /bin/sh`
- **Cleanup**: `docker compose down`

For more information, see `docs/DOCKER_LIFECYCLE_MANAGEMENT_PLAN.md`.

```
.
├── src
│   ├── agent/            # Core Agent loop and message handling
│   ├── providers/        # LLM Provider implementations
│   ├── tools/            # Tool registry and tool implementations
│   ├── guardrails/       # Security/Guardrail logic for input/output
│   └── index.ts          # Agent entry point
├── docs/                 # Documentation and development plans
└── package.json
```

## Security & Guardrails

The project implements specialized guardrail components in `src/guardrails/` to sanitize inputs and outputs, ensuring the agent remains secure while interacting with external tools and data.
