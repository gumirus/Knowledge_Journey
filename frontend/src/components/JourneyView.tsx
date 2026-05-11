import { useState } from 'react';
import type { Journey, Checkpoint } from '../types';
import CheckpointView from './CheckpointView';

interface JourneyViewProps {
  journey: Journey;
  onJourneyComplete: () => void;
}

export default function JourneyView({ journey, onJourneyComplete }: JourneyViewProps) {
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<string>>(new Set());

  const currentCheckpoint = journey.checkpoints[currentCheckpointIndex];
  const progress = journey.checkpoints.length > 0 
    ? (completedCheckpoints.size / journey.checkpoints.length) * 100 
    : 0;

  const handleCheckpointComplete = (checkpointId: string) => {
    const newCompleted = new Set(completedCheckpoints);
    newCompleted.add(checkpointId);
    setCompletedCheckpoints(newCompleted);

    // Move to next checkpoint after a delay
    setTimeout(() => {
      if (currentCheckpointIndex < journey.checkpoints.length - 1) {
        setCurrentCheckpointIndex(currentCheckpointIndex + 1);
      } else {
        // All checkpoints completed
        setTimeout(() => onJourneyComplete(), 1000);
      }
    }, 1000);
  };

  const handleSkipCheckpoint = () => {
    if (currentCheckpointIndex < journey.checkpoints.length - 1) {
      setCurrentCheckpointIndex(currentCheckpointIndex + 1);
    }
  };

  const handlePreviousCheckpoint = () => {
    if (currentCheckpointIndex > 0) {
      setCurrentCheckpointIndex(currentCheckpointIndex - 1);
    }
  };

  return (
    <div className="journey-view">
      <div className="journey-header">
        <h2>Learning Journey: {journey.topic}</h2>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {completedCheckpoints.size} of {journey.checkpoints.length} checkpoints completed
          </div>
        </div>
      </div>

      <div className="checkpoints-container">
        <div className="checkpoints-list">
          {journey.checkpoints.map((checkpoint, index) => (
            <div 
              key={checkpoint.id}
              className={`checkpoint-indicator ${
                index === currentCheckpointIndex ? 'current' : ''
              } ${completedCheckpoints.has(checkpoint.id) ? 'completed' : 'pending'}`}
              onClick={() => setCurrentCheckpointIndex(index)}
            >
              <div className="indicator-number">{index + 1}</div>
              <div className="indicator-label">
                <span className="concept">{checkpoint.concept}</span>
                <span className="difficulty">{checkpoint.difficulty}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="current-checkpoint">
          {currentCheckpoint ? (
            <CheckpointView
              checkpoint={currentCheckpoint}
              onComplete={handleCheckpointComplete}
              isActive={true}
            />
          ) : (
            <p>No checkpoints available</p>
          )}
        </div>
      </div>

      <div className="journey-controls">
        <button
          className="control-button previous"
          onClick={handlePreviousCheckpoint}
          disabled={currentCheckpointIndex === 0}
        >
          ← Previous Checkpoint
        </button>
        
        <div className="checkpoint-counter">
          Checkpoint {currentCheckpointIndex + 1} of {journey.checkpoints.length}
        </div>
        
        <button
          className="control-button skip"
          onClick={handleSkipCheckpoint}
          disabled={currentCheckpointIndex >= journey.checkpoints.length - 1}
        >
          Skip Checkpoint →
        </button>
      </div>

      {completedCheckpoints.size === journey.checkpoints.length && journey.checkpoints.length > 0 && (
        <div className="journey-complete">
          <h3>🎉 Journey Complete!</h3>
          <p>You've successfully completed all checkpoints for "{journey.topic}".</p>
          <button className="restart-button" onClick={onJourneyComplete}>
            Start New Journey
          </button>
        </div>
      )}
    </div>
  );
}