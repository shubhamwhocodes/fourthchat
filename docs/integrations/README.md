# FourthChat Integrations

Connect your AI chatbot to various platforms and services.

## Available Integrations

| Integration | Status | Description |
|-------------|--------|-------------|
| [Custom Webhook](./webhook.md) | ✅ Available | Connect to any HTTP-based system |
| [WhatsApp Business](./whatsapp-business.md) | ✅ Available | Official Meta WhatsApp Cloud API |
| [WhatsApp (Evolution API)](./whatsapp-evolution.md) | ✅ Available | Self-hosted WhatsApp via Evolution API |
| Slack | 🔜 Coming Soon | Connect to Slack workspaces |
| Discord | 🔜 Coming Soon | Add chatbot to Discord servers |
| Telegram | 🔜 Coming Soon | Connect to Telegram |

## Quick Start

1. Go to your **Chatbot** → **Connections**
2. Click **"New Connection"**
3. Select the integration type
4. Fill in the required configuration
5. Click **"Create Connection"**

## How Connections Work

Each connection links an external platform to a specific chatbot:

```
External Platform → Webhook → Your Chatbot → AI Response → Platform
```

- **One chatbot** can have **multiple connections**
- Each connection has its **own credentials** stored securely
- Messages are tracked per-connection for analytics

## Webhook URLs

Your FourthChat instance provides these webhook endpoints:

| Integration | Webhook URL |
|-------------|-------------|
| Custom Webhook | `https://your-domain.com/api/webhooks/incoming` |
| WhatsApp Business | `https://your-domain.com/api/webhooks/whatsapp` |
| Evolution API | `https://your-domain.com/api/webhooks/evolution` |

## Need Help?

- Check the individual integration guides above
- Review the [FourthChat Documentation](/docs)
- Open an issue on GitHub
