# WhatsApp Business API Integration

Connect your chatbot to WhatsApp using Meta's official WhatsApp Business Cloud API.

## Prerequisites

- A Facebook/Meta account
- A Meta Business account (can be created during setup)
- A verified phone number for WhatsApp Business

## Setup Steps

### 1. Create a Meta Developer Account

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Log in with your Facebook account
3. Accept the developer terms if prompted

### 2. Create a Meta App

1. Click **"My Apps"** → **"Create App"**
2. Select **"Business"** as the app type
3. Enter your app details:
   - **App Name:** Your app name (e.g., "My Chatbot WhatsApp")
   - **Contact Email:** Your email
4. Click **"Create App"**

### 3. Add WhatsApp Product

1. In your app dashboard, scroll to **"Add Products"**
2. Find **"WhatsApp"** and click **"Set Up"**
3. You'll be taken to the WhatsApp Getting Started page

### 4. Get Your Credentials

From the WhatsApp API Setup page, copy these values:

| Credential | Where to Find It |
|------------|------------------|
| **Phone Number ID** | Under "From" phone number dropdown |
| **Access Token** | Click "Generate" under Temporary Access Token |

> ⚠️ **Important:** Temporary tokens expire in 24 hours. For production, create a permanent token via System Users.

### 5. Create Permanent Access Token (Recommended)

1. Go to **Business Settings** → **System Users**
2. Create a new System User
3. Assign the WhatsApp app with full control
4. Generate a new token with `whatsapp_business_messaging` permission

### 6. Configure Webhook in Meta

1. In your Meta App, go to **WhatsApp** → **Configuration**
2. Under **Webhook**, click **"Edit"**
3. Enter:
   - **Callback URL:** `https://your-domain.com/api/webhooks/whatsapp`
   - **Verify Token:** The same verify token you entered when creating the connection
4. Click **"Verify and Save"**

### 7. Subscribe to Webhook Fields

After verifying, subscribe to these webhook fields:
- ✅ `messages` - Required for receiving messages

## Configuration Fields

| Field | Description | Required |
|-------|-------------|----------|
| **Phone Number ID** | Your WhatsApp phone number ID from Meta | Yes |
| **Access Token** | Permanent access token from System User | Yes |
| **Verify Token** | A custom token you create (use the same in Meta webhook config) | Yes |
| **Business Account ID** | Your WhatsApp Business Account ID | No |

## Testing

1. Add your phone number as a test number in Meta Console
2. Send a message to your WhatsApp Business number
3. Check your FourthChat dashboard for incoming messages

## Troubleshooting

### "Webhook verification failed"
- Ensure your Verify Token matches exactly in both places
- Your server must be accessible from the internet (use ngrok for local testing)

### "Access token expired"
- Use a permanent access token from a System User instead of a temporary token

### "Phone number not registered"
- Complete the WhatsApp Business account verification in Meta Business Suite

## Rate Limits

- **Template Messages:** 1,000 per day (can be increased)
- **Session Messages:** Unlimited within 24-hour window

## Resources

- [WhatsApp Business Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Help Center](https://www.facebook.com/business/help)
