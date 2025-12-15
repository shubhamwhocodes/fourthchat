export const AI_PROVIDERS = [
    {
        id: "gemini",
        name: "Google Gemini",
        description: "Google's most capable AI models",
        models: [
            { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", description: "Latest and fastest" },
            { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Best for complex tasks" },
            { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast and efficient" },
        ],
        placeholder: "AIzaSy...",
        docsUrl: "https://ai.google.dev/gemini-api/docs/api-key"
    },
    {
        id: "openai",
        name: "OpenAI",
        description: "GPT-4 and ChatGPT models",
        models: [
            { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
            { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable" },
            { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "High performance" },
            { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Legacy model" },
        ],
        placeholder: "sk-...",
        docsUrl: "https://platform.openai.com/api-keys"
    },
    {
        id: "anthropic",
        name: "Anthropic",
        description: "Claude AI models",
        models: [
            { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Best balance" },
            { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most capable" },
            { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", description: "Fastest" },
        ],
        placeholder: "sk-ant-...",
        docsUrl: "https://console.anthropic.com/settings/keys"
    },
    {
        id: "groq",
        name: "Groq",
        description: "Ultra-fast inference",
        models: [
            { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", description: "Latest Llama" },
            { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", description: "Ultra fast" },
            { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", description: "Great for coding" },
        ],
        placeholder: "gsk_...",
        docsUrl: "https://console.groq.com/keys"
    }
]
