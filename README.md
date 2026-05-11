# Knowledge Journey

An interactive AI-powered learning platform that transforms any topic into a personalized educational journey with timed checkpoints, interactive activities, and progress tracking.

## 🚀 Live Demo

- **Frontend**: [GitHub Pages](https://gumirus.github.io/Knowledge_Journey/) (after deployment)
- **Backend API**: Localhost `http://localhost:8000` (or your deployed backend)

## ✨ Features

- **AI-Powered Journey Generation**: Create personalized learning paths from any topic
- **Interactive Checkpoints**: Multiple activity types (Multiple Choice, Fill in the Blank, Free Response, Analogy Craft)
- **Timed Challenges**: Each checkpoint has a countdown timer
- **Progress Tracking**: Visual progress bar and completion tracking
- **Demo Mode**: Works without API keys using mock data
- **Responsive Design**: Modern UI that works on desktop and mobile
- **SourceCraft Integration**: Designed to work with SourceCraft Code Assistant ecosystem

## 🏗️ Architecture

```
knowledge-journey/
├── frontend/           # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── api.ts      # API client
│   │   └── types.ts    # TypeScript types
│   └── package.json
└── backend/            # FastAPI Python backend
    ├── main.py         # FastAPI application
    └── requirements.txt
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/gumirus/Knowledge_Journey.git
cd Knowledge_Journey
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run Development Servers

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### 5. Open the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Health Check: http://localhost:8000/

## 🔧 Configuration

### API Keys (Optional)

For production use with real AI generation:

1. Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
2. Create a `.env` file in the `backend` directory:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```
3. Restart the backend server

**Note**: Without an API key, the app runs in demo mode with mock data.

### CORS Configuration

The backend is configured to allow requests from `http://localhost:5173`. To change this, modify `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your frontend URL
    # ...
)
```

## 📦 Deployment

### Frontend Deployment (GitHub Pages)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. The built files will be in `frontend/dist/`

3. Deploy to GitHub Pages:
   - Go to repository Settings → Pages
   - Set source to "GitHub Actions"
   - Or use the included GitHub Actions workflow

### Backend Deployment

The backend can be deployed to:

- **Render**: Create a Web Service with Python environment
- **Railway**: One-click deployment with `railway up`
- **Vercel**: Using Python runtime
- **Heroku**: With Procfile and requirements.txt

**Environment Variables for Production:**
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `PORT`: Server port (default: 8000)

## 🔌 API Reference

### Endpoints

- `GET /` - Health check and API info
- `POST /generate` - Generate a learning journey

### Generate Request

```json
{
  "topic": "Machine Learning"
}
```

### Generate Response

```json
{
  "topic": "Machine Learning",
  "checkpoints": [
    {
      "id": "1",
      "concept": "Introduction to Machine Learning",
      "difficulty": "easy",
      "timer": 180,
      "activity": {
        "type": "MultipleChoice",
        "prompt": "What is supervised learning?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": "Option A",
        "hint": "Think about labeled data"
      }
    }
  ]
}
```

## 🛠️ Development

### Project Structure

- `frontend/src/components/` - React components
  - `JourneyGenerator.tsx` - Topic input and journey generation
  - `CheckpointView.tsx` - Individual checkpoint with timer
  - `JourneyView.tsx` - Complete journey with progress tracking
- `frontend/src/api.ts` - API client functions
- `frontend/src/types.ts` - TypeScript type definitions
- `backend/main.py` - FastAPI application with demo mode

### Adding New Activity Types

1. Add the activity type to `ActivityType` in `frontend/src/types.ts`
2. Implement the activity rendering in `CheckpointView.tsx`
3. Update the mock data generator in `backend/main.py`

## 🤝 SourceCraft Integration

This project is designed to integrate with SourceCraft Code Assistant:

- **As a Learning Tool**: SourceCraft can use this platform to create educational content for developers
- **As a Component**: The journey generation can be embedded in other SourceCraft projects
- **API Integration**: SourceCraft can call the `/generate` endpoint to create learning paths

### Future Integration Points

1. **SourceCraft Plugin**: Direct integration as a VS Code extension
2. **Code Analysis**: Generate learning journeys from codebases
3. **Skill Assessment**: Track developer progress across multiple journeys

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [FastAPI](https://fastapi.tiangolo.com/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/) (optional)
- Icons from [Lucide](https://lucide.dev/)
- Inspired by modern learning platforms and adaptive education systems

## 📞 Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/gumirus/Knowledge_Journey/issues)
- Check the [discussions](https://github.com/gumirus/Knowledge_Journey/discussions) for common questions