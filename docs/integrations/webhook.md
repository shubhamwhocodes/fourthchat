# Custom Webhook Integration

Connect your chatbot to any external system using custom webhooks.

## Overview

Custom webhooks allow you to integrate FourthChat with any system that can send and receive HTTP requests. This is perfect for:

- Custom CRM integrations
- Internal business tools
- Automation platforms (Zapier, Make, n8n)
- Mobile apps
- IoT devices

## How It Works

```
Your System                          FourthChat
    │                                    │
    │  POST /api/webhooks/incoming       │
    │  + API Key + Message ───────────►  │
    │                                    │
    │                                    │  Process message
    │                                    │  Generate AI response
    │                                    │
    │  ◄─────────────── POST to your     │
    │                   webhook URL      │
    │                                    │
```

## Setup Steps

### 1. Create a Webhook Connection

1. Go to your Chatbot → Connections
2. Click "New Connection"
3. Select "Custom Webhook"
4. Fill in the configuration

### 2. Get Your Incoming Webhook URL

After creating the connection, you'll receive:
- **Webhook URL:** `https://your-domain.com/api/webhooks/incoming`
- **Connection ID:** Used to identify this connection

### 3. Send Messages to FourthChat

Send a POST request to the incoming webhook:

```bash
curl -X POST "https://your-domain.com/api/webhooks/incoming" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "connectionId": "your-connection-id",
    "message": "Hello, I need help!",
    "userId": "user-123",
    "metadata": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'
```

### 4. Receive Responses

FourthChat will send AI responses to your configured webhook URL:

```json
POST https://your-webhook-url.com/webhook

{
  "connectionId": "your-connection-id",
  "conversationId": "conv-123",
  "message": {
    "role": "assistant",
    "content": "Hello John! How can I help you today?"
  },
  "userId": "user-123",
  "timestamp": "2024-01-15T10:30:00Z"
}

Headers:
  X-Webhook-Signature: sha256=abc123...
  X-Webhook-Timestamp: 2024-01-15T10:30:00Z
```

## Configuration Fields

| Field | Description | Required |
|-------|-------------|----------|
| **Webhook URL** | URL where FourthChat sends responses | Yes |
| **Secret** | HMAC secret for signature verification | No |
| **Custom Headers** | Additional headers to include (JSON) | No |

## Verifying Webhook Signatures

If you set a secret, verify incoming webhooks:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

// In your webhook handler:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  
  if (!verifySignature(req.body, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the message
  
  res.status(200).send('OK');
});
```

## Request/Response Format

### Incoming (Your System → FourthChat)

```json
{
  "connectionId": "string (required)",
  "message": "string (required)",
  "userId": "string (optional - for conversation tracking)",
  "metadata": {
    "any": "additional data"
  }
}
```

### Outgoing (FourthChat → Your System)

```json
{
  "connectionId": "string",
  "conversationId": "string",
  "message": {
    "id": "string",
    "role": "assistant",
    "content": "string"
  },
  "userId": "string (if provided)",
  "timestamp": "ISO 8601 timestamp",
  "metadata": {}
}
```

## Custom Headers

Add custom headers to outgoing webhooks:

```json
{
  "Authorization": "Bearer your-api-key",
  "X-Custom-Header": "custom-value"
}
```

## Testing Your Webhook

Use the "Test" button in the connections page to send a test payload:

```json
{
  "test": true,
  "message": "This is a test webhook from your chatbot!",
  "timestamp": "2024-01-15T10:30:00Z",
  "connectionId": "your-connection-id",
  "connectionName": "My Webhook"
}
```

## Error Handling

FourthChat retries failed webhook deliveries:

| Attempt | Delay |
|---------|-------|
| 1st retry | 30 seconds |
| 2nd retry | 2 minutes |
| 3rd retry | 10 minutes |

After 3 failed attempts, the delivery is marked as failed.

## Troubleshooting

### "Connection refused"
- Ensure your webhook URL is publicly accessible
- Check firewall settings
- Use ngrok for local testing

### "Invalid signature"
- Verify the secret matches in both places
- Ensure you're using the raw request body for verification

### "Timeout"
- Your webhook should respond within 10 seconds
- Process messages asynchronously if needed

## Use Cases

### CRM Integration
Send customer queries to your chatbot and sync responses back to your CRM.

### Mobile App
Build a custom chat UI in your mobile app that connects to your AI chatbot.

### Automation
Trigger AI responses based on events from Zapier, Make, or n8n.
