from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv
import json
import os
import random

load_dotenv()

app = FastAPI()

# Try to initialize Anthropic client, fallback to demo mode if no API key
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
DEMO_MODE = ANTHROPIC_API_KEY is None or ANTHROPIC_API_KEY == ""

if not DEMO_MODE:
    client = Anthropic()
else:
    client = None
    print("⚠️  Running in DEMO MODE - using mock data")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    topic: str

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Knowledge Journey API",
        "demo_mode": DEMO_MODE,
        "endpoints": {
            "GET /": "API health check",
            "POST /generate": "Generate learning journey"
        }
    }

@app.post("/generate")
async def generate_journey(req: GenerateRequest):
    # If in demo mode, return mock data
    if DEMO_MODE:
        return generate_mock_journey(req.topic)
    
    # Otherwise use real Anthropic API
    prompt = f"""You are an expert educational content creator.

Analyze this topic and create a learning journey: "{req.topic}"

Return ONLY valid JSON, no other text:

{{
  "topic": "{req.topic}",
  "checkpoints": [
    {{
      "id": "1",
      "concept": "concept name",
      "difficulty": "easy",
      "timer": 180,
      "activity": {{
        "type": "MultipleChoice",
        "prompt": "question text",
        "options": ["A", "B", "C", "D"],
        "correct": "A",
        "hint": "hint text"
      }}
    }}
  ]
}}

Rules:
- Create 4-5 checkpoints
- Go from simple to complex
- Activity types: MultipleChoice, FillTheBlank, FreeResponse, AnalogyCraft
- Use different activity types, not all MultipleChoice
- timer is seconds (180 = 3 min)
- difficulty: easy / medium / hard
- For FreeResponse and AnalogyCraft — no options field, no correct field
- For FillTheBlank — prompt contains ___ where answer goes, correct is the word
"""

    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    text = message.content[0].text
    journey = json.loads(text)
    return journey

def generate_mock_journey(topic: str):
    """Generate mock journey for demo purposes"""
    concepts = [
        "Introduction",
        "Core Principles",
        "Advanced Concepts",
        "Real-world Applications",
        "Future Trends"
    ]
    
    activity_types = ["MultipleChoice", "FillTheBlank", "FreeResponse", "AnalogyCraft"]
    difficulties = ["easy", "medium", "hard"]
    
    checkpoints = []
    for i, concept in enumerate(concepts[:random.randint(4, 5)]):
        activity_type = activity_types[i % len(activity_types)]
        activity = create_mock_activity(activity_type, topic, concept)
        
        checkpoint = {
            "id": str(i + 1),
            "concept": f"{concept} of {topic}",
            "difficulty": difficulties[i % len(difficulties)],
            "timer": random.choice([120, 180, 240, 300]),
            "activity": activity
        }
        checkpoints.append(checkpoint)
    
    return {
        "topic": topic,
        "checkpoints": checkpoints
    }

def create_mock_activity(activity_type: str, topic: str, concept: str):
    """Create mock activity based on type"""
    base_prompt = f"About {concept.lower()} of {topic}"
    
    if activity_type == "MultipleChoice":
        return {
            "type": "MultipleChoice",
            "prompt": f"Which of the following best describes {concept.lower()} in {topic}?",
            "options": [
                "A fundamental principle",
                "An advanced technique",
                "A historical context",
                "A practical application"
            ],
            "correct": "A fundamental principle",
            "hint": "Think about the basics"
        }
    elif activity_type == "FillTheBlank":
        return {
            "type": "FillTheBlank",
            "prompt": f"The most important aspect of {concept.lower()} is ___.",
            "correct": "understanding",
            "hint": "It's about comprehension"
        }
    elif activity_type == "FreeResponse":
        return {
            "type": "FreeResponse",
            "prompt": f"Explain {concept.lower()} in your own words.",
            "hint": "Focus on key ideas"
        }
    else:  # AnalogyCraft
        return {
            "type": "AnalogyCraft",
            "prompt": f"Create an analogy that explains {concept.lower()}.",
            "hint": "Compare it to something familiar"
        }