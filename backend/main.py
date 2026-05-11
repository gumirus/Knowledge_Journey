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
    return f"""You are an expert educational content creator and instructional designer.

Analyze the topic "{topic}" and create a comprehensive learning journey.

First, break down the topic into Atom Knowledge Units (AKUs) — minimal concepts that can be explained, verified, and applied. Identify dependencies between them.

Then, design a learning journey with 4-5 checkpoints. Each checkpoint should focus on one key concept, with an activity that matches the cognitive level (Bloom taxonomy) and a scenario mode to make it engaging.

Return ONLY valid JSON, no other text:

{{
  "topic": "{topic}",
  "scenario": "default",
  "checkpoints": [
    {{
      "id": "1",
      "concept": "concept name",
      "difficulty": "easy",
      "timer": 180,
      "status": "pending",
      "activity": {{
        "type": "MultipleChoice",
        "prompt": "question text",
        "options": ["A", "B", "C", "D"],
        "correct": "A",
        "distractors": ["B", "C", "D"],
        "hint": "hint text",
        "bloomLevel": "remember",
        "scenario": "default"
      }}
    }}
  ]
}}

Rules:
1. Create 4-5 checkpoints, progressing from simple to complex.
2. Activity types: MultipleChoice, FillTheBlank, FreeResponse, AnalogyCraft, LogicBreakdown, TeachBack, MicroChallenge.
3. Use different activity types; avoid repetition.
4. Each activity must include:
   - "bloomLevel": one of "remember", "understand", "apply", "analyze", "evaluate", "create"
   - "scenario": one of "default", "incident", "startup", "consultant", "auditor", "researcher"
   - "hint": a helpful hint
5. For MultipleChoice: provide 4 options, one correct, three distractors based on common misconceptions.
6. For FillTheBlank: prompt contains ___ where answer goes, "correct" is the missing word/phrase.
7. For FreeResponse: no "options" or "correct". Include "expectedKeywords" (array of strings).
8. For AnalogyCraft: include "forbiddenTerms" (array of technical terms to avoid) and optionally "exampleAnalogy".
9. For LogicBreakdown: include "steps" (array of steps in correct order) and "correctOrder".
10. For TeachBack: include "targetAudience" (e.g., "a beginner", "a colleague").
11. For MicroChallenge: include "challenge" description and optional "solution".
12. Timer in seconds (120-300).
13. Difficulty: "easy", "medium", "hard".
14. Ensure activities are engaging, practical, and test deep understanding, not just recall.
"""

def generate_mock_journey(topic: str):
    """Generate mock journey for demo purposes with enhanced fields"""
    scenarios = ["default", "incident", "startup", "consultant", "auditor", "researcher"]
    bloom_levels = ["remember", "understand", "apply", "analyze", "evaluate", "create"]
    concepts = [
        "Introduction and Basics",
        "Core Principles and Mechanisms",
        "Advanced Concepts and Nuances",
        "Real-world Applications and Case Studies",
        "Future Trends and Innovations"
    ]
    
    activity_types = ["MultipleChoice", "FillTheBlank", "FreeResponse", "AnalogyCraft", "LogicBreakdown", "TeachBack", "MicroChallenge"]
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
            "status": "pending",
            "activity": activity
        }
        checkpoints.append(checkpoint)
    
    return {
        "topic": topic,
        "scenario": random.choice(scenarios),
        "checkpoints": checkpoints,
        "totalScore": 0,
        "totalTime": 0
    }

def create_mock_activity(activity_type: str, topic: str, concept: str):
    """Create mock activity based on type with enhanced fields"""
    bloom_levels = ["remember", "understand", "apply", "analyze", "evaluate", "create"]
    scenarios = ["default", "incident", "startup", "consultant", "auditor", "researcher"]
    
    base_activity = {
        "type": activity_type,
        "prompt": f"About {concept.lower()} of {topic}",
        "hint": "Think deeply about the concept",
        "bloomLevel": random.choice(bloom_levels),
        "scenario": random.choice(scenarios)
    }
    
    if activity_type == "MultipleChoice":
        base_activity.update({
            "prompt": f"Which of the following best describes {concept.lower()} in {topic}?",
            "options": [
                "A fundamental principle",
                "An advanced technique",
                "A historical context",
                "A practical application"
            ],
            "correct": "A fundamental principle",
            "distractors": ["An advanced technique", "A historical context", "A practical application"]
        })
    elif activity_type == "FillTheBlank":
        base_activity.update({
            "prompt": f"The most important aspect of {concept.lower()} is ___.",
            "correct": "understanding",
            "blankCount": 1
        })
    elif activity_type == "FreeResponse":
        base_activity.update({
            "prompt": f"Explain {concept.lower()} in your own words.",
            "expectedKeywords": ["principle", "mechanism", "application"]
        })
    elif activity_type == "AnalogyCraft":
        base_activity.update({
            "prompt": f"Create an analogy that explains {concept.lower()}.",
            "forbiddenTerms": ["technical jargon", "academic terms"],
            "exampleAnalogy": "Like a recipe that guides you step by step"
        })
    elif activity_type == "LogicBreakdown":
        base_activity.update({
            "prompt": f"Break down the logic behind {concept.lower()} into steps.",
            "steps": ["Identify the core idea", "Analyze components", "Synthesize relationships"],
            "correctOrder": ["Identify the core idea", "Analyze components", "Synthesize relationships"]
        })
    elif activity_type == "TeachBack":
        base_activity.update({
            "prompt": f"Explain {concept.lower()} as if you were teaching it to a beginner.",
            "targetAudience": "a beginner with no prior knowledge",
            "timeLimit": 120
        })
    elif activity_type == "MicroChallenge":
        base_activity.update({
            "prompt": f"Solve this micro‑challenge about {concept.lower()}.",
            "challenge": f"Design a simple example that illustrates {concept.lower()}.",
            "solution": "Example solution provided after attempt"
        })
    
    return base_activity