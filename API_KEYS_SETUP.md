# API Keys Setup for Knowledge Journey

This guide explains how to set up API keys for production use of Knowledge Journey with real AI generation.

## Overview

By default, Knowledge Journey runs in **demo mode** with mock data, which doesn't require any API keys. For production use with real AI-generated content, you need to configure the following:

1. **Anthropic API Key** - For AI-powered journey generation
2. **Backend Deployment** - To serve the API in production
3. **Frontend Configuration** - To point to your deployed backend

## 1. Anthropic API Key Setup

### Getting an API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in to your Anthropic account
3. Navigate to "API Keys" section
4. Click "Create Key" and give it a name (e.g., "Knowledge Journey")
5. Copy the generated API key

### Configuring the Backend

Create a `.env` file in the `backend` directory:

```bash
cd backend
echo "ANTHROPIC_API_KEY=your_actual_api_key_here" > .env
```

**Security Note**: Never commit `.env` files to version control. The `.gitignore` already excludes `.env` files.

### Environment Variables for Production

When deploying the backend to production services (Render, Railway, Heroku, etc.), set the following environment variables:

- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `PORT`: Server port (usually set automatically by the hosting service)
- `CORS_ORIGINS`: Comma-separated list of allowed frontend URLs (optional)

## 2. Backend Deployment with API Keys

### Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your API key

### Deploying to Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will automatically detect the Python project
4. Add environment variable in the "Variables" tab:
   - `ANTHROPIC_API_KEY`: Your API key

### Deploying to Vercel (Python)

1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json` in the backend directory:
   ```json
   {
     "builds": [
       {
         "src": "main.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "main.py"
       }
     ]
   }
   ```
3. Deploy: `vercel --prod`
4. Set environment variable in Vercel dashboard

## 3. Frontend Configuration for Production

### Update API Base URL

After deploying your backend, update the `getApiBase()` function in `frontend/src/api.ts`:

```typescript
const getApiBase = (): string => {
  if (window.location.hostname.includes('github.io')) {
    // Replace with your deployed backend URL
    return 'https://your-backend-service.onrender.com';
  }
  return 'http://localhost:8000';
};
```

### Building for Production

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/` and can be deployed to any static hosting service.

## 4. Testing the Setup

### Local Testing

1. Start the backend with API key:
   ```bash
   cd backend
   source venv/bin/activate
   python -m uvicorn main:app --reload --port 8000
   ```
   You should see: `Running in PRODUCTION MODE - using Anthropic API`

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Test by generating a journey with any topic

### Production Testing

1. Deploy backend with API key
2. Update frontend API URL
3. Deploy frontend to GitHub Pages
4. Test the live application

## 5. Troubleshooting

### Common Issues

1. **"Failed to generate journey" error**
   - Check if backend is running
   - Verify API key is set correctly
   - Check CORS configuration

2. **"Invalid API Key" error**
   - Verify the API key is correct
   - Check if the key has sufficient permissions
   - Ensure no extra spaces in the key

3. **CORS errors in browser console**
   - Update `allow_origins` in `backend/main.py` to include your frontend URL
   - Or set `CORS_ORIGINS` environment variable

4. **Slow response times**
   - Anthropic API can take a few seconds to generate content
   - Consider adding loading indicators in the UI

## 6. Cost Management

Anthropic API usage is billed per token. To manage costs:

1. **Set usage limits** in Anthropic console
2. **Use demo mode** for development and testing
3. **Cache responses** (future enhancement)
4. **Monitor usage** through Anthropic dashboard

## 7. Security Best Practices

1. **Never expose API keys** in client-side code
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** (every 90 days recommended)
4. **Restrict API key permissions** if possible
5. **Use different keys** for development and production

## 8. Alternative AI Providers

To switch to a different AI provider (OpenAI, Gemini, etc.):

1. Update `backend/main.py` to use the new provider's SDK
2. Modify the prompt format accordingly
3. Update environment variable names
4. Adjust the response parsing

Example for OpenAI:
```python
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
```

## Support

For issues with API key setup:
- Check the [Anthropic API documentation](https://docs.anthropic.com/)
- Open an issue on [GitHub](https://github.com/gumirus/Knowledge_Journey/issues)
- Consult the [README.md](README.md) for general setup instructions