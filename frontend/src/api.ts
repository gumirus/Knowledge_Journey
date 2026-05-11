import type { Journey, GenerateRequest } from './types';

// Determine API base URL based on environment
const getApiBase = (): string => {
  // In production (GitHub Pages), use relative path or configured backend URL
  if (window.location.hostname.includes('github.io')) {
    // For demo purposes, we'll use a mock backend or you can set your deployed backend URL
    // return 'https://your-backend-url.herokuapp.com';
    return 'http://localhost:8000'; // Fallback - will show error in production
  }
  // In development, use localhost
  return 'http://localhost:8000';
};

const API_BASE = getApiBase();

export type AIProvider = 'demo' | 'anthropic' | 'sourcecraft';

export async function generateJourney(topic: string, provider?: AIProvider): Promise<Journey> {
  const request: GenerateRequest = {
    topic,
    ...(provider && { provider })
  };
  
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate journey: ${response.statusText}. ${errorText}`);
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

export async function getBackendInfo(): Promise<{active_provider: string, status: string}> {
  try {
    const response = await fetch(`${API_BASE}/`);
    return response.json();
  } catch {
    return { active_provider: 'unknown', status: 'offline' };
  }
}

// Check if we're in production (GitHub Pages)
export const isProduction = window.location.hostname.includes('github.io');