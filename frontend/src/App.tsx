import { useState, useEffect } from 'react';
import './App.css';
import JourneyGenerator from './components/JourneyGenerator';
import JourneyView from './components/JourneyView';
import type { Journey, GamificationState } from './types';
import { checkBackendHealth } from './api';

// Initial gamification state
const initialGamificationState: GamificationState = {
  xp: 0,
  streak: 0,
  multiplier: 1,
  achievements: [
    { id: 'first_blood', name: 'First Blood', description: 'First correct answer', unlockedAt: null, condition: 'first_correct' },
    { id: 'no_hints', name: 'No Hints', description: 'Complete a checkpoint without hints', unlockedAt: null, condition: 'no_hints' },
    { id: 'speed_runner', name: 'Speed Runner', description: '3 answers faster than 30% timer', unlockedAt: null, condition: 'speed_runner' },
    { id: 'deep_thinker', name: 'Deep Thinker', description: 'Max score on FreeResponse', unlockedAt: null, condition: 'deep_thinker' },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Complete journey without errors', unlockedAt: null, condition: 'perfectionist' },
  ],
  totalCorrect: 0,
  totalTimeSpent: 0,
};

function App() {
  const [currentJourney, setCurrentJourney] = useState<Journey | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [gamification, setGamification] = useState<GamificationState>(initialGamificationState);

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
    // Reset streak? Keep as is.
  };

  const handleJourneyComplete = () => {
    setCurrentJourney(null);
    // Award XP for completing journey
    addXP(50);
    // Check for perfectionist achievement
    if (gamification.totalCorrect === (currentJourney?.checkpoints.length || 0)) {
      unlockAchievement('perfectionist');
    }
  };

  // Gamification functions
  const addXP = (amount: number) => {
    setGamification(prev => ({
      ...prev,
      xp: prev.xp + amount * prev.multiplier,
    }));
  };

  const incrementStreak = () => {
    setGamification(prev => ({
      ...prev,
      streak: prev.streak + 1,
      multiplier: prev.streak >= 4 ? 2 : prev.streak >= 2 ? 1.5 : 1,
    }));
  };

  const resetStreak = () => {
    setGamification(prev => ({
      ...prev,
      streak: 0,
      multiplier: 1,
    }));
  };

  const unlockAchievement = (achievementId: string) => {
    setGamification(prev => {
      const updated = prev.achievements.map(ach =>
        ach.id === achievementId && !ach.unlockedAt
          ? { ...ach, unlockedAt: new Date().toISOString() }
          : ach
      );
      return { ...prev, achievements: updated };
    });
  };

  const handleCheckpointComplete = (correct: boolean, usedHint: boolean, timeSpent: number) => {
    if (correct) {
      addXP(10);
      incrementStreak();
      setGamification(prev => ({ ...prev, totalCorrect: prev.totalCorrect + 1 }));
      if (!usedHint) {
        unlockAchievement('no_hints');
      }
      if (timeSpent < 30) { // example condition
        // speed runner logic
      }
    } else {
      resetStreak();
    }
    setGamification(prev => ({ ...prev, totalTimeSpent: prev.totalTimeSpent + timeSpent }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Knowledge Journey</h1>
          <p className="tagline">Transform any topic into an interactive learning adventure</p>
          
          <div className="header-right">
            <div className={`backend-status ${backendStatus}`}>
              <div className="status-dot"></div>
              <span className="status-text">
                {backendStatus === 'checking' && 'Checking backend...'}
                {backendStatus === 'online' && 'Backend connected'}
                {backendStatus === 'offline' && 'Backend offline - start backend server'}
              </span>
            </div>

            <div className="gamification-bar">
              <div className="xp-display">
                <span className="xp-label">XP:</span>
                <span className="xp-value">{gamification.xp}</span>
              </div>
              <div className="streak-display">
                <span className="streak-label">Streak:</span>
                <span className="streak-value">{gamification.streak}</span>
                {gamification.multiplier > 1 && (
                  <span className="multiplier">x{gamification.multiplier}</span>
                )}
              </div>
              <div className="achievements-count">
                <span className="achievements-label">Achievements:</span>
                <span className="achievements-value">
                  {gamification.achievements.filter(a => a.unlockedAt).length}/{gamification.achievements.length}
                </span>
              </div>
            </div>
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
              onCheckpointComplete={handleCheckpointComplete}
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
