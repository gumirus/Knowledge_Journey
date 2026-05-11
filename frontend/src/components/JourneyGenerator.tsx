import { useState } from 'react';
import { generateJourney } from '../api';
import type { Journey } from '../types';

interface JourneyGeneratorProps {
  onJourneyGenerated: (journey: Journey) => void;
}

export default function JourneyGenerator({ onJourneyGenerated }: JourneyGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const journey = await generateJourney(topic);
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
      </form>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <p>Make sure the backend server is running on port 8000.</p>
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