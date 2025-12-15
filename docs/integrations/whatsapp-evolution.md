# WhatsApp Integration (Evolution API)

Connect your chatbot to WhatsApp using the self-hosted Evolution API. No Meta Business verification required.

## What is Evolution API?

Evolution API is an open-source WhatsApp API that uses WhatsApp Web under the hood. It allows you to send and receive WhatsApp messages without Meta Business verification.

## Prerequisites

- A server or VPS (DigitalOcean, Hetzner, AWS, etc.)
- Docker installed on your server
- A WhatsApp account (personal or business)

## Setup Steps

### 1. Deploy Evolution API

**Using Docker (Recommended):**

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=your-secret-api-key \
  -v evolution_data:/evolution/instances \
  atendai/evolution-api
```

**Using Docker Compose:**

```yaml
version: '3.8'
services:
  evolution-api:
    image: atendai/evolution-api
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_API_KEY=your-secret-api-key
    volumes:
      - evolution_data:/evolution/instances
    restart: always

volumes:
  evolution_data:
```

### 2. Access Evolution API

Once running, access the API at:
- **API:** `http://your-server-ip:8080`
- **Manager:** `http://your-server-ip:8080/manager`

### 3. Create a WhatsApp Instance

1. Open the Evolution API Manager
2. Create a new instance with a unique name (e.g., `my-chatbot`)
3. Scan the QR code with your WhatsApp app
4. Wait for the connection to establish

### 4. Configure Webhook in Evolution API

Set up the webhook to forward messages to FourthChat:

```bash
curl -X POST "http://your-evolution-api:8080/webhook/set/your-instance" \
  -H "apikey: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "url": "https://your-fourthchat-domain.com/api/webhooks/evolution",
    "events": ["messages.upsert"]
  }'
```

### 5. Create Connection in FourthChat

In your FourthChat dashboard:
1. Go to your Chatbot → Connections
2. Click "New Connection"
3. Select "WhatsApp (Evolution API)"
4. Fill in:
   - **Evolution API URL:** `https://evolution.yourserver.com`
   - **API Key:** Your Evolution API key
   - **Instance Name:** The name you used when creating the instance

## Configuration Fields

| Field | Description | Required |
|-------|-------------|----------|
| **Evolution API URL** | URL of your Evolution API server | Yes |
| **API Key** | Your AUTHENTICATION_API_KEY | Yes |
| **Instance Name** | Name of your WhatsApp instance | Yes |

## Server Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **CPU** | 1 vCPU | 2 vCPU |
| **RAM** | 1 GB | 2 GB |
| **Storage** | 10 GB | 20 GB |
| **OS** | Ubuntu 20.04+ | Ubuntu 22.04 |

## Hosting Options

| Provider | Cost | Notes |
|----------|------|-------|
| **Hetzner** | ~€4/month | Best value |
| **DigitalOcean** | ~$6/month | Easy setup |
| **Vultr** | ~$5/month | Good performance |
| **AWS EC2** | ~$8/month | If already on AWS |

## Troubleshooting

### "Instance not connected"
- Re-scan the QR code in Evolution API Manager
- Check if your WhatsApp account is logged out on your phone
- Ensure the instance hasn't been idle too long

### "Webhook not receiving messages"
- Verify your FourthChat server is publicly accessible
- Check the webhook URL in Evolution API settings
- Look at Evolution API logs for errors

### "Message failed to send"
- Check your API key is correct
- Verify the instance name matches exactly
- Ensure the phone number format is correct (with country code)

## Security Considerations

- Use HTTPS for your Evolution API
- Keep your API key secret
- Consider using a firewall to restrict access
- Regularly backup your instance data

## Resources

- [Evolution API Documentation](https://doc.evolution-api.com)
- [Evolution API GitHub](https://github.com/EvolutionAPI/evolution-api)
- [Docker Hub](https://hub.docker.com/r/atendai/evolution-api)
