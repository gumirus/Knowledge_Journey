# API Keys Setup for Knowledge Journey

This guide explains how to set up API keys for production use of Knowledge Journey with real AI generation.

## Overview

Knowledge Journey supports multiple AI providers:
- **Demo Mode** (default) - Uses mock data, no API keys required
- **Anthropic Claude** - Uses Anthropic API for high-quality AI generation
- **SourceCraft Code Assistant** - Uses SourceCraft's AI API

## Quick Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Choose one provider: demo, anthropic, or sourcecraft
AI_PROVIDER=sourcecraft

# Anthropic Configuration (if using anthropic provider)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# SourceCraft Configuration (if using sourcecraft provider)
SOURCECRAFT_API_KEY=your_sourcecraft_api_key_here
SOURCECRAFT_API_URL=https://api.sourcecraft.dev/v1/chat/completions  # Default, adjust if needed
```

## 1. SourceCraft Code Assistant Setup

### Getting a SourceCraft API Key

1. **Sign up for SourceCraft Code Assistant** at the official SourceCraft platform
2. **Navigate to API Keys** section in your account dashboard
3. **Generate a new API key** with appropriate permissions
4. **Copy the API key** for use in your backend

### Configuring the Backend

Set the following environment variables:

```bash
AI_PROVIDER=sourcecraft
SOURCECRAFT_API_KEY=sk_your_sourcecraft_key_here
# Optional: Customize API URL if different
SOURCECRAFT_API_URL=https://api.sourcecraft.dev/v1/chat/completions
```

### SourceCraft API Response Format

The backend expects SourceCraft API to return responses in OpenAI-compatible format:

```json
{
  "choices": [
    {
      "message": {
        "content": "{\"topic\": \"...\", \"checkpoints\": [...]}"
      }
    }
  ]
}
```

If your SourceCraft API uses a different format, modify the `generate_with_sourcecraft()` function in `backend/main.py`.

## 2. Anthropic Claude Setup

### Getting an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in to your Anthropic account
3. Navigate to "API Keys" section
4. Click "Create Key" and give it a name (e.g., "Knowledge Journey")
5. Copy the generated API key

### Configuring the Backend

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 3. Demo Mode (No API Keys)

If you don't have API keys or want to test without costs:

```bash
AI_PROVIDER=demo
# No API keys required
```

## 4. Frontend Configuration

The frontend automatically detects the active provider from the backend. Users can select their preferred provider in the UI:

1. **Demo Mode**: Fast, uses mock data
2. **Anthropic Claude**: High-quality AI generation
3. **SourceCraft Assistant**: SourceCraft's specialized code assistant

### Provider Selection UI

The frontend includes a provider selection panel with:
- Radio buttons for each provider
- Descriptions of each provider's capabilities
- Real-time backend status display

## 5. Deployment

### Backend Deployment

Deploy the backend to your preferred service (Render, Railway, Vercel, Heroku):

**Required Environment Variables:**
- `AI_PROVIDER`: `demo`, `anthropic`, or `sourcecraft`
- Provider-specific API keys (if not using demo mode)
- `PORT`: Server port (auto-set by most platforms)

**Example Render Configuration:**
- Build Command: `pip install -r requirements.txt`
- Start Command: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment: `AI_PROVIDER=sourcecraft`, `SOURCECRAFT_API_KEY=your_key`

### Frontend Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `frontend/dist/` directory to:
   - GitHub Pages (automated via GitHub Actions)
   - Vercel
   - Netlify
   - Any static hosting service

## 6. Testing

### Local Testing

1. Start backend with your chosen provider:
   ```bash
   cd backend
   source venv/bin/activate
   python -m uvicorn main:app --reload --port 8000
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open http://localhost:5173 and test with different providers

### Production Testing

1. Deploy backend with API keys
2. Deploy frontend to hosting service
3. Test the live application
4. Monitor logs for any API errors

## 7. Troubleshooting

### SourceCraft API Issues

1. **"SourceCraft API key not configured"**
   - Check `SOURCECRAFT_API_KEY` environment variable
   - Ensure `AI_PROVIDER` is set to `sourcecraft`

2. **API response format errors**
   - Check the actual response format from SourceCraft API
   - Update `generate_with_sourcecraft()` function in `backend/main.py`

3. **CORS errors**
   - Update `allow_origins` in `backend/main.py` to include your frontend domain
   - Or set `CORS_ORIGINS` environment variable

### General Issues

1. **Backend not starting**
   - Check Python version (3.9+ required)
   - Verify all dependencies are installed: `pip install -r requirements.txt`
   - Check for syntax errors in `main.py`

2. **Frontend can't connect to backend**
   - Verify backend is running on correct port
   - Check CORS configuration
   - Ensure no firewall blocking connections

## 8. Cost Management

### SourceCraft API
- Check SourceCraft pricing at their official website
- Set usage limits if available
- Monitor API usage through SourceCraft dashboard

### Anthropic API
- Billed per token
- Set usage limits in Anthropic console
- Use demo mode for development/testing

## 9. Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate API keys** regularly (every 90 days)
4. **Restrict API key permissions** to minimum required
5. **Use different keys** for development and production

## 10. Support

For issues with API setup:
- **SourceCraft API**: Consult SourceCraft documentation
- **Anthropic API**: Check [Anthropic API docs](https://docs.anthropic.com/)
- **General Issues**: Open an issue on [GitHub](https://github.com/gumirus/Knowledge_Journey/issues)
- **Documentation**: See [README.md](README.md) for general setup

## 11. Advanced Configuration

### Custom Prompt Engineering

To customize the AI prompt for your use case, modify the `create_prompt()` function in `backend/main.py`.

### Adding New Providers

To add support for additional AI providers:

1. Add provider to `AIProvider` enum in `backend/main.py`
2. Implement a new generation function (e.g., `generate_with_openai()`)
3. Add provider to frontend's `AI_PROVIDERS` array in `JourneyGenerator.tsx`
4. Update documentation

### Rate Limiting

Consider implementing rate limiting for production use:
- Use FastAPI's `SlowAPI` or similar middleware
- Set appropriate limits based on your API plan
- Add request queuing for high traffic