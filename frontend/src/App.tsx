import { useState, useEffect } from 'react';
import './App.css';
import JourneyGenerator from './components/JourneyGenerator';
import JourneyView from './components/JourneyView';
import type { Journey } from './types';
import { checkBackendHealth } from './api';

function App() {
  const [currentJourney, setCurrentJourney] = useState<Journey | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkBackend = async () => {
      const isHealthy = await checkBackendHealth();
      setBackendStatus(isHealthy ? 'online' : 'offline');
    };

    checkBackend();
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleJourneyGenerated = (journey: Journey) => {
    setCurrentJourney(journey);
  };

  const handleJourneyComplete = () => {
    setCurrentJourney(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Knowledge Journey</h1>
          <p className="tagline">Transform any topic into an interactive learning adventure</p>
          
          <div className={`backend-status ${backendStatus}`}>
            <div className="status-dot"></div>
            <span className="status-text">
              {backendStatus === 'checking' && 'Checking backend...'}
              {backendStatus === 'online' && 'Backend connected'}
              {backendStatus === 'offline' && 'Backend offline - start backend server'}
            </span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {!currentJourney ? (
          <div className="generator-section">
            <JourneyGenerator onJourneyGenerated={handleJourneyGenerated} />
            
            <div className="features">
              <h3>How it works</h3>
              <div className="feature-grid">
                <div className="feature">
                  <div className="feature-icon">🎯</div>
                  <h4>Personalized Learning</h4>
                  <p>AI creates a custom learning path based on your chosen topic</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">⏱️</div>
                  <h4>Timed Challenges</h4>
                  <p>Each checkpoint has a timer to keep you focused and engaged</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🧩</div>
                  <h4>Interactive Activities</h4>
                  <p>Multiple choice, fill-in-the-blank, free response, and analogy crafting</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">📈</div>
                  <h4>Progress Tracking</h4>
                  <p>Visual progress bar shows your journey completion</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="journey-section">
            <JourneyView 
              journey={currentJourney} 
              onJourneyComplete={handleJourneyComplete} 
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Knowledge Journey • Built with React, FastAPI, and Claude AI</p>
        <div className="footer-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://fastapi.tiangolo.com" target="_blank" rel="noopener noreferrer">FastAPI Docs</a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">React Docs</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
