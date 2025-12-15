export type IntegrationType =
    | "webhook"
    | "whatsapp-business"
    | "whatsapp-evolution"
    | "slack"
    | "discord"
    | "telegram"

export interface IntegrationConfigField {
    key: string
    label: string
    type: "text" | "password" | "url" | "textarea" | "select"
    placeholder?: string
    required?: boolean
    helpText?: string
    options?: { label: string; value: string }[]
}

export interface Integration {
    type: IntegrationType
    name: string
    description: string
    icon: string
    category: "messaging" | "webhook" | "social"
    status: "available" | "coming-soon" | "beta"
    configFields: IntegrationConfigField[]
    webhookEndpoint?: string
    docsPath?: string
    externalDocsUrl?: string
}

export const integrations: Integration[] = [
    {
        type: "webhook",
        name: "Custom Webhook",
        description: "Send and receive messages via HTTP webhooks. Great for custom integrations.",
        icon: "Webhook",
        category: "webhook",
        status: "available",
        configFields: [
            {
                key: "webhookUrl",
                label: "Webhook URL",
                type: "url",
                placeholder: "https://your-server.com/webhook",
                required: true,
                helpText: "URL where we'll send messages"
            },
            {
                key: "secret",
                label: "Webhook Secret",
                type: "password",
                placeholder: "Optional signing secret",
                required: false,
                helpText: "Used to sign webhook payloads (HMAC-SHA256)"
            },
            {
                key: "headers",
                label: "Custom Headers (JSON)",
                type: "textarea",
                placeholder: '{"Authorization": "Bearer token"}',
                required: false,
                helpText: "Additional headers to send with webhook"
            }
        ],
        webhookEndpoint: "/api/webhooks/incoming",
        docsPath: "/docs/integrations/webhook"
    },
    {
        type: "whatsapp-business",
        name: "WhatsApp Business",
        description: "Official Meta WhatsApp Business API. Requires Meta Business verification.",
        icon: "MessageCircle",
        category: "messaging",
        status: "available",
        configFields: [
            {
                key: "phoneNumberId",
                label: "Phone Number ID",
                type: "text",
                placeholder: "1234567890xxxxx",
                required: true,
                helpText: "From Meta Developer Console → WhatsApp → API Setup"
            },
            {
                key: "accessToken",
                label: "Access Token",
                type: "password",
                placeholder: "EAAxxxxxxx...",
                required: true,
                helpText: "Permanent access token from System User"
            },
            {
                key: "verifyToken",
                label: "Verify Token",
                type: "text",
                placeholder: "my_custom_verify_token",
                required: true,
                helpText: "A custom token you create. Use this same token when configuring the webhook in Meta."
            },
            {
                key: "businessAccountId",
                label: "Business Account ID",
                type: "text",
                placeholder: "9876543210xxxxx",
                required: false,
                helpText: "Your WhatsApp Business Account ID (optional)"
            }
        ],
        webhookEndpoint: "/api/webhooks/whatsapp",
        docsPath: "/docs/integrations/whatsapp-business",
        externalDocsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api"
    },
    {
        type: "whatsapp-evolution",
        name: "WhatsApp (Evolution API)",
        description: "Self-hosted WhatsApp via Evolution API. No Meta verification needed.",
        icon: "MessageCircle",
        category: "messaging",
        status: "available",
        configFields: [
            {
                key: "evolutionApiUrl",
                label: "Evolution API URL",
                type: "url",
                placeholder: "https://evolution.yourserver.com",
                required: true,
                helpText: "Your Evolution API server URL"
            },
            {
                key: "apiKey",
                label: "API Key",
                type: "password",
                placeholder: "Your Evolution API key",
                required: true,
                helpText: "API key for authentication"
            },
            {
                key: "instanceName",
                label: "Instance Name",
                type: "text",
                placeholder: "my-whatsapp-instance",
                required: true,
                helpText: "Name of your WhatsApp instance"
            }
        ],
        webhookEndpoint: "/api/webhooks/evolution",
        docsPath: "/docs/integrations/whatsapp-evolution",
        externalDocsUrl: "https://doc.evolution-api.com"
    },
    {
        type: "slack",
        name: "Slack",
        description: "Connect your chatbot to Slack workspaces.",
        icon: "Hash",
        category: "messaging",
        status: "coming-soon",
        configFields: [
            {
                key: "botToken",
                label: "Bot Token",
                type: "password",
                placeholder: "xoxb-...",
                required: true,
                helpText: "Slack Bot User OAuth Token"
            },
            {
                key: "signingSecret",
                label: "Signing Secret",
                type: "password",
                placeholder: "Your signing secret",
                required: true,
                helpText: "For verifying Slack requests"
            }
        ],
        webhookEndpoint: "/api/webhooks/slack",
        docsPath: "/docs/integrations/slack",
        externalDocsUrl: "https://api.slack.com/docs"
    },
    {
        type: "discord",
        name: "Discord",
        description: "Add your chatbot to Discord servers.",
        icon: "Gamepad2",
        category: "social",
        status: "coming-soon",
        configFields: [
            {
                key: "botToken",
                label: "Bot Token",
                type: "password",
                placeholder: "Your Discord bot token",
                required: true,
                helpText: "From Discord Developer Portal"
            },
            {
                key: "applicationId",
                label: "Application ID",
                type: "text",
                placeholder: "123456789012345678",
                required: true,
                helpText: "Your Discord application ID"
            }
        ],
        webhookEndpoint: "/api/webhooks/discord",
        docsPath: "/docs/integrations/discord",
        externalDocsUrl: "https://discord.com/developers/docs"
    },
    {
        type: "telegram",
        name: "Telegram",
        description: "Connect your chatbot to Telegram.",
        icon: "Send",
        category: "messaging",
        status: "coming-soon",
        configFields: [
            {
                key: "botToken",
                label: "Bot Token",
                type: "password",
                placeholder: "123456:ABC-DEF...",
                required: true,
                helpText: "From @BotFather on Telegram"
            }
        ],
        webhookEndpoint: "/api/webhooks/telegram",
        docsPath: "/docs/integrations/telegram",
        externalDocsUrl: "https://core.telegram.org/bots/api"
    }
]

export function getIntegration(type: IntegrationType): Integration | undefined {
    return integrations.find(i => i.type === type)
}

export function getAvailableIntegrations(): Integration[] {
    return integrations.filter(i => i.status === "available" || i.status === "beta")
}

export function getIntegrationsByCategory(category: Integration["category"]): Integration[] {
    return integrations.filter(i => i.category === category)
}
