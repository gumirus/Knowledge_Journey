from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv
import json
import os
import random
import httpx
from enum import Enum
from typing import Optional, Dict, Any

load_dotenv()

app = FastAPI()

# Configuration
class AIProvider(str, Enum):
    DEMO = "demo"
    ANTHROPIC = "anthropic"
    SOURCECRAFT = "sourcecraft"

# Determine which provider to use
PROVIDER_CONFIG = os.getenv("AI_PROVIDER", "demo").lower()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
SOURCECRAFT_API_KEY = os.getenv("SOURCECRAFT_API_KEY")
SOURCECRAFT_API_URL = os.getenv("SOURCECRAFT_API_URL", "https://api.sourcecraft.dev/v1/chat/completions")

# Select provider based on configuration
if PROVIDER_CONFIG == "anthropic" and ANTHROPIC_API_KEY:
    ACTIVE_PROVIDER = AIProvider.ANTHROPIC
    anthropic_client = Anthropic()
    print("✅ Using Anthropic API provider")
elif PROVIDER_CONFIG == "sourcecraft" and SOURCECRAFT_API_KEY:
    ACTIVE_PROVIDER = AIProvider.SOURCECRAFT
    print("✅ Using SourceCraft API provider")
else:
    ACTIVE_PROVIDER = AIProvider.DEMO
    print("⚠️  Using DEMO provider - generating mock data")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    topic: str
    provider: Optional[AIProvider] = None  # Optional override

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Knowledge Journey API",
        "active_provider": ACTIVE_PROVIDER.value,
        "endpoints": {
            "GET /": "API health check",
            "POST /generate": "Generate learning journey"
        },
        "environment": {
            "ai_provider": PROVIDER_CONFIG,
            "demo_mode": ACTIVE_PROVIDER == AIProvider.DEMO
        }
    }

@app.post("/generate")
async def generate_journey(req: GenerateRequest):
    # Use requested provider or default
    provider = req.provider if req.provider else ACTIVE_PROVIDER
    
    if provider == AIProvider.DEMO:
        return generate_mock_journey(req.topic)
    elif provider == AIProvider.ANTHROPIC:
        return await generate_with_anthropic(req.topic)
    elif provider == AIProvider.SOURCECRAFT:
        return await generate_with_sourcecraft(req.topic)
    else:
        return {"error": f"Unsupported provider: {provider}"}

async def generate_with_anthropic(topic: str):
    """Generate journey using Anthropic Claude"""
    if not ANTHROPIC_API_KEY:
        return {"error": "Anthropic API key not configured"}
    
    prompt = create_prompt(topic)
    
    try:
        message = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        text = message.content[0].text
        journey = json.loads(text)
        return journey
    except Exception as e:
        print(f"Anthropic API error: {e}")
        return generate_mock_journey(topic)  # Fallback to mock data

async def generate_with_sourcecraft(topic: str):
    """Generate journey using SourceCraft Code Assistant API"""
    if not SOURCECRAFT_API_KEY:
        return {"error": "SourceCraft API key not configured"}
    
    prompt = create_prompt(topic)
    
    # SourceCraft API request (assuming similar to OpenAI format)
    headers = {
        "Authorization": f"Bearer {SOURCECRAFT_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "sourcecraft-code-assistant",  # Adjust model name as needed
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 2000,
        "temperature": 0.7
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                SOURCECRAFT_API_URL,
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                # Extract the response text - adjust based on actual API response format
                text = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                if text:
                    journey = json.loads(text)
                    return journey
                else:
                    raise ValueError("Empty response from SourceCraft API")
            else:
                raise Exception(f"SourceCraft API error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"SourceCraft API error: {e}")
        return generate_mock_journey(topic)  # Fallback to mock data

def create_prompt(topic: str) -> str:
    """Create standardized prompt for all AI providers"""
    return f"""You are an expert educational content creator.

Analyze this topic and create a learning journey: "{topic}"

Return ONLY valid JSON, no other text:

{{
  "topic": "{topic}",
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