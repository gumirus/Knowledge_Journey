import type { Journey, GenerateRequest } from './types';

const API_BASE = 'http://localhost:8000';

export async function generateJourney(topic: string): Promise<Journey> {
  const request: GenerateRequest = { topic };
  
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate journey: ${response.statusText}`);
  }

  return response.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/`);
    return response.ok;
  } catch {
    return false;
  }
}