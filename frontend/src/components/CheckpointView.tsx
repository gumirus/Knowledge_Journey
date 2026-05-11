import { useState, useEffect } from 'react';
import type { Checkpoint } from '../types';

interface CheckpointViewProps {
  checkpoint: Checkpoint;
  onComplete: (checkpointId: string) => void;
  isActive: boolean;
}

export default function CheckpointView({ checkpoint, onComplete, isActive }: CheckpointViewProps) {
  const [timeLeft, setTimeLeft] = useState(checkpoint.timer);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isActive || isCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isCompleted, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isActive && !isCompleted) {
      handleTimeout();
    }
  }, [timeLeft, isActive, isCompleted]);

  const handleTimeout = () => {
    setIsCompleted(true);
    setTimeout(() => onComplete(checkpoint.id), 1000);
  };

  const handleSubmit = () => {
    if (checkpoint.activity.type === 'FreeResponse' || checkpoint.activity.type === 'AnalogyCraft') {
      // For free response, any answer is accepted
      setIsCompleted(true);
      setTimeout(() => onComplete(checkpoint.id), 500);
    } else if (checkpoint.activity.type === 'MultipleChoice') {
      if (userAnswer === checkpoint.activity.correct) {
        setIsCompleted(true);
        setTimeout(() => onComplete(checkpoint.id), 500);
      } else {
        alert('Incorrect answer. Try again!');
      }
    } else if (checkpoint.activity.type === 'FillTheBlank') {
      if (userAnswer.toLowerCase() === checkpoint.activity.correct.toLowerCase()) {
        setIsCompleted(true);
        setTimeout(() => onComplete(checkpoint.id), 500);
      } else {
        alert('Incorrect. Hint: ' + (checkpoint.activity.hint || 'Try again!'));
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getDifficultyColor = () => {
    switch (checkpoint.difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  };

  const renderActivity = () => {
    const activity = checkpoint.activity;

    switch (activity.type) {
      case 'MultipleChoice':
        return (
          <div className="multiple-choice">
            <p className="prompt">{activity.prompt}</p>
            <div className="options">
              {activity.options.map((option, index) => (
                <button
                  key={index}
                  className={`option ${userAnswer === option ? 'selected' : ''}`}
                  onClick={() => setUserAnswer(option)}
                  disabled={isCompleted}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'FillTheBlank':
        return (
          <div className="fill-the-blank">
            <p className="prompt">{activity.prompt.replace('___', '______')}</p>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here"
              disabled={isCompleted}
              className="blank-input"
            />
          </div>
        );

      case 'FreeResponse':
        return (
          <div className="free-response">
            <p className="prompt">{activity.prompt}</p>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your thoughts here..."
              disabled={isCompleted}
              className="response-textarea"
              rows={4}
            />
          </div>
        );

      case 'AnalogyCraft':
        return (
          <div className="analogy-craft">
            <p className="prompt">{activity.prompt}</p>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Create your analogy here..."
              disabled={isCompleted}
              className="analogy-textarea"
              rows={3}
            />
          </div>
        );

      default:
        return <p>Unknown activity type</p>;
    }
  };

  return (
    <div className={`checkpoint ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="checkpoint-header">
        <div className="checkpoint-meta">
          <span className="checkpoint-id">Checkpoint {checkpoint.id}</span>
          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor() }}
          >
            {checkpoint.difficulty.toUpperCase()}
          </span>
          <span className="concept">{checkpoint.concept}</span>
        </div>
        
        <div className="timer">
          <span className="timer-label">Time:</span>
          <span className="time-left">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="activity-container">
        {renderActivity()}
      </div>

      <div className="checkpoint-footer">
        <div className="hint-section">
          {checkpoint.activity.hint && (
            <button
              className="hint-button"
              onClick={() => setShowHint(!showHint)}
              disabled={isCompleted}
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}
          {showHint && checkpoint.activity.hint && (
            <div className="hint-text">{checkpoint.activity.hint}</div>
          )}
        </div>

        <div className="actions">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={isCompleted || (!userAnswer.trim() && checkpoint.activity.type !== 'FreeResponse' && checkpoint.activity.type !== 'AnalogyCraft')}
          >
            {isCompleted ? 'Completed!' : 'Submit Answer'}
          </button>
        </div>
      </div>

      {isCompleted && (
        <div className="completion-overlay">
          <p>Checkpoint completed! Moving to next...</p>
        </div>
      )}
    </div>
  );
}