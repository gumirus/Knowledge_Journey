import { useState, useEffect, useRef } from 'react';
import type { Checkpoint } from '../types';

interface CheckpointViewProps {
  checkpoint: Checkpoint;
  onComplete: (checkpointId: string, correct: boolean, usedHint: boolean, timeSpent: number) => void;
  isActive: boolean;
}

export default function CheckpointView({ checkpoint, onComplete, isActive }: CheckpointViewProps) {
  const [timeLeft, setTimeLeft] = useState(checkpoint.timer);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Calculate time spent so far
  const getTimeSpent = () => {
    return Math.max(0, checkpoint.timer - timeLeft);
  };

  const completeCheckpoint = (correct: boolean) => {
    if (isCompleted) return;
    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const timeSpent = getTimeSpent();
    setTimeout(() => onComplete(checkpoint.id, correct, usedHint, timeSpent), 500);
  };

  useEffect(() => {
    if (!isActive || isCompleted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isCompleted, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isActive && !isCompleted) {
      handleTimeout();
    }
  }, [timeLeft, isActive, isCompleted]);

  const handleTimeout = () => {
    completeCheckpoint(false); // Timeout = incorrect
  };

  const handleSubmit = () => {
    const activity = checkpoint.activity;
    const answer = userAnswer.trim();
    
    // Types that accept any answer (no validation) - considered correct
    const freeAnswerTypes = ['FreeResponse', 'AnalogyCraft', 'LogicBreakdown', 'TeachBack', 'MicroChallenge'];
    if (freeAnswerTypes.includes(activity.type)) {
      completeCheckpoint(true);
      return;
    }
    
    switch (activity.type) {
      case 'MultipleChoice':
        if (answer === activity.correct) {
          completeCheckpoint(true);
        } else {
          alert('Incorrect answer. Try again!');
        }
        break;
        
      case 'FillTheBlank':
        if (answer.toLowerCase() === activity.correct.toLowerCase()) {
          completeCheckpoint(true);
        } else {
          alert('Incorrect. Hint: ' + (activity.hint || 'Try again!'));
        }
        break;
        
      default:
        // Should not happen
        alert('Activity type not supported for validation');
        break;
    }
  };

  // Track hint usage
  const handleShowHint = () => {
    setShowHint(prev => !prev);
    setUsedHint(true);
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

      case 'LogicBreakdown':
        return (
          <div className="logic-breakdown">
            <p className="prompt">{activity.prompt}</p>
            <div className="steps">
              {activity.steps?.map((step, idx) => (
                <div key={idx} className="step">
                  <span className="step-number">{idx + 1}</span>
                  <span className="step-text">{step}</span>
                </div>
              ))}
            </div>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Explain the logical order or reasoning..."
              disabled={isCompleted}
              className="logic-textarea"
              rows={3}
            />
          </div>
        );

      case 'TeachBack':
        return (
          <div className="teach-back">
            <p className="prompt">{activity.prompt}</p>
            <p className="audience">Target audience: {activity.targetAudience}</p>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Explain as if you're teaching..."
              disabled={isCompleted}
              className="teachback-textarea"
              rows={4}
            />
          </div>
        );

      case 'MicroChallenge':
        return (
          <div className="micro-challenge">
            <p className="prompt">{activity.prompt}</p>
            <div className="challenge-description">
              <strong>Challenge:</strong> {activity.challenge}
            </div>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Describe your solution..."
              disabled={isCompleted}
              className="challenge-textarea"
              rows={4}
            />
          </div>
        );

      default:
        return <p>Unknown activity type: {(activity as any).type}</p>;
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
          {checkpoint.activity.bloomLevel && (
            <span className="bloom-badge" title="Bloom Taxonomy Level">
              {checkpoint.activity.bloomLevel}
            </span>
          )}
          {checkpoint.activity.scenario && checkpoint.activity.scenario !== 'default' && (
            <span className="scenario-badge" title="Learning Scenario">
              {checkpoint.activity.scenario}
            </span>
          )}
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
              onClick={handleShowHint}
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