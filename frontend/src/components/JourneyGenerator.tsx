import { useState, useEffect } from 'react';
import { generateJourney, getBackendInfo, type AIProvider } from '../api';
import type { Journey } from '../types';

interface JourneyGeneratorProps {
  onJourneyGenerated: (journey: Journey) => void;
}

const AI_PROVIDERS: { id: AIProvider; name: string; description: string }[] = [
  { id: 'demo', name: 'Demo Mode', description: 'Uses mock data - no API key required' },
  { id: 'anthropic', name: 'Anthropic Claude', description: 'Uses Anthropic API for AI generation' },
  { id: 'sourcecraft', name: 'SourceCraft Assistant', description: 'Uses SourceCraft Code Assistant API' },
];

export default function JourneyGenerator({ onJourneyGenerated }: JourneyGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('demo');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendInfo, setBackendInfo] = useState<{active_provider: string, status: string} | null>(null);

  useEffect(() => {
    const fetchBackendInfo = async () => {
      const info = await getBackendInfo();
      setBackendInfo(info);
    };
    fetchBackendInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const journey = await generateJourney(topic, selectedProvider);
      onJourneyGenerated(journey);
      setTopic('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate journey');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="journey-generator">
      <h2>Create Your Learning Journey</h2>
      <p className="subtitle">Enter a topic you want to learn about, and we'll create a personalized learning path for you.</p>
      
      {backendInfo && (
        <div className="backend-info">
          <div className={`backend-status ${backendInfo.status === 'online' ? 'online' : 'offline'}`}>
            <div className="status-dot"></div>
            <span className="status-text">
              Backend: {backendInfo.status} | Provider: {backendInfo.active_provider}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Machine Learning, Quantum Physics, Renaissance Art..."
            disabled={isLoading}
            className="topic-input"
          />
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="generate-button"
          >
            {isLoading ? 'Generating...' : 'Generate Journey'}
          </button>
        </div>

        <div className="provider-selection">
          <h3>AI Provider</h3>
          <p className="provider-subtitle">Choose which AI service to use for journey generation</p>
          
          <div className="provider-options">
            {AI_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className={`provider-option ${selectedProvider === provider.id ? 'selected' : ''}`}
                onClick={() => !isLoading && setSelectedProvider(provider.id)}
              >
                <div className="provider-radio">
                  <div className={`radio-dot ${selectedProvider === provider.id ? 'selected' : ''}`}></div>
                </div>
                <div className="provider-details">
                  <h4>{provider.name}</h4>
                  <p>{provider.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <p>Make sure the backend server is running on port 8000 and the selected provider is configured.</p>
        </div>
      )}

      <div className="examples">
        <p>Try these examples:</p>
        <div className="example-tags">
          {['Python Programming', 'Climate Change', 'Ancient Rome', 'Neuroscience Basics'].map((example) => (
            <button
              key={example}
              type="button"
              className="example-tag"
              onClick={() => setTopic(example)}
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}