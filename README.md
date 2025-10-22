# AetherMind - Smart Knowledge Navigator for Data Analysis and Research

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/AetherMind-20251022-111227)

AetherMind is designed to be the ultimate companion for researchers, analysts, and anyone needing to distill vast amounts of information into actionable insights. It provides a seamless conversational interface to an AI assistant, leveraging Cloudflare's edge capabilities for speed and responsiveness.

## Key Features

*   **Intelligent Chat Interface:** A dynamic textarea for multi-line queries, beautifully rendered messages distinguishing between user and AI, real-time streaming responses, and clear visualization of tool calls (e.g., web search, data query) with badges and icons. Elegant loading states and micro-animations enhance user engagement.
*   **Research Session Management:** A dedicated sidebar for easily viewing, selecting, and switching between active and past research sessions. Sessions are automatically titled based on the first user query, with options for manual renaming. Users can create new sessions, clear current session history, and delete individual or all sessions.
*   **AI Model Selection:** A dropdown allows users to switch between different AI models (e.g., Gemini 2.5 Flash, Gemini 2.5 Pro) to optimize for speed or accuracy based on their current task.
*   **Responsive Layout:** The entire application is meticulously designed for a fluid experience across all devices, from mobile phones to large desktop monitors, ensuring touch-friendly interactions on smaller screens and comprehensive views on larger ones.
*   **Visual Polish & Micro-interactions:** Every interactive element, from buttons to session items, features delightful hover, focus, and active states. Smooth transitions and subtle animations enhance the user experience, making interactions feel natural and intuitive. A sophisticated color palette and typography system ensure excellent readability and visual hierarchy.

## Technology Stack

AetherMind is built with a modern and robust technology stack, leveraging Cloudflare's edge capabilities for performance and scalability:

*   **Frontend:**
    *   React 18
    *   Vite
    *   Tailwind CSS 3
    *   Shadcn/UI
    *   Framer Motion
    *   Zustand (state management)
    *   Lucide React (icons)
    *   `react-router-dom`
    *   `sonner` (toasts)
    *   `date-fns`
    *   `class-variance-authority`, `clsx`, `tailwind-merge` (for styling utilities)
    *   `react-resizable-panels`, `vaul` (UI primitives)
    *   `react-hotkeys-hook`, `react-select`, `react-swipeable`, `react-use` (utility hooks/components)
    *   `recharts` (charting)
*   **Backend (Cloudflare Worker):**
    *   Hono (web framework)
    *   Cloudflare Agents SDK (for Durable Objects and agent management)
    *   Model Context Protocol (MCP) Client (for real server integration)
    *   OpenAI SDK (for AI model integration via Cloudflare AI Gateway)
    *   Durable Objects (for persistent state management and session control)
    *   TypeScript

## Setup and Installation

To get AetherMind up and running locally, follow these steps:

### Prerequisites

*   [Bun](https://bun.sh/) (package manager and runtime)
*   A Cloudflare account with Workers and AI Gateway configured.

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aethermind-knowledge-navigator.git
    cd aethermind-knowledge-navigator
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Configure Environment Variables:**
    Create a `.dev.vars` file in the root directory (or configure secrets in `wrangler.toml` for deployment) with the following environment variables:

    *   `CF_AI_BASE_URL`: Your Cloudflare AI Gateway base URL (e.g., `https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai`)
    *   `CF_AI_API_KEY`: Your Cloudflare API key for AI Gateway access.
    *   `SERPAPI_KEY`: (Optional, for `web_search` tool) Your SerpAPI key.
    *   `OPENROUTER_API_KEY`: (Optional, for other models) Your OpenRouter API key.

    **Example `.dev.vars`:**
    ```
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your_cloudflare_ai_api_key"
    SERPAPI_KEY="your_serpapi_key"
    OPENROUTER_API_KEY="your_openrouter_api_key"
    ```
    **Important:** These API keys are used server-side only within the Cloudflare Worker and are not exposed to the client.

## Development

To run the application in development mode with hot module replacement:

```bash
bun dev
```

This will start the Vite development server, and you can access the application in your browser, typically at `http://localhost:3000`.

## Usage

AetherMind provides an intuitive chat interface for interacting with an AI assistant.

1.  **Start a new session:** Simply type your first query into the input field. A new research session will automatically be created and titled based on your query.
2.  **Chat with AI:** Ask questions, request summaries, or initiate web searches. The AI will respond in real-time, streaming its output.
3.  **Tool Usage:** If the AI determines a tool is needed (e.g., `web_search`, `data_query`), it will execute it and display the tool call with its results before providing a synthesized response.
4.  **Session Management:** Use the sidebar (accessible via the hamburger menu on mobile or visible by default on desktop) to:
    *   View and switch between past research sessions.
    *   Create a new chat session.
    *   Clear the current conversation history.
    *   Delete individual or all sessions.
5.  **Model Selection:** Choose different AI models from the dropdown to optimize for speed or accuracy based on your task.

**Note:** While AetherMind leverages powerful AI capabilities, there is a limit on the number of requests that can be made to the AI servers across all user applications in a given time period.

## Deployment

AetherMind is designed for seamless deployment to Cloudflare Workers.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/AetherMind-20251022-111227)

1.  **Build the project:**
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare Workers:**
    Ensure you are logged into Cloudflare via `wrangler login` and have configured your `wrangler.toml` or `wrangler.jsonc` with your Cloudflare account ID and any necessary secrets (e.g., `CF_AI_BASE_URL`, `CF_AI_API_KEY`, `SERPAPI_KEY`).

    ```bash
    bun run deploy
    ```

    This command will build your project and deploy it to your Cloudflare Workers account.

## Project Structure

*   `src/`: Contains the React frontend application.
    *   `src/components/`: Reusable UI components, including Shadcn/UI components.
    *   `src/pages/`: Main application pages (e.g., `HomePage.tsx`).
    *   `src/lib/`: Utility functions and services (e.g., `chat.ts` for API interactions).
    *   `src/hooks/`: Custom React hooks.
*   `worker/`: Contains the Cloudflare Worker backend.
    *   `worker/agent.ts`: The core `ChatAgent` Durable Object logic.
    *   `worker/app-controller.ts`: Durable Object for session management.
    *   `worker/chat.ts`: OpenAI integration and conversation handling.
    *   `worker/tools.ts`: Tool definitions and execution logic.
    *   `worker/userRoutes.ts`: Hono routes for API endpoints.
    *   `worker/types.ts`: TypeScript type definitions.

## Contributing

We welcome contributions to AetherMind! Please feel free to open issues or submit pull requests.