export type ActivityType = 'MultipleChoice' | 'FillTheBlank' | 'FreeResponse' | 'AnalogyCraft' | 'LogicBreakdown' | 'TeachBack' | 'MicroChallenge';

export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
export type ScenarioMode = 'incident' | 'startup' | 'consultant' | 'auditor' | 'researcher' | 'default';

export interface ActivityBase {
  type: ActivityType;
  prompt: string;
  hint?: string;
  bloomLevel?: BloomLevel;
  scenario?: ScenarioMode;
  evaluation?: Evaluation;
}

export interface MultipleChoiceActivity extends ActivityBase {
  type: 'MultipleChoice';
  options: string[];
  correct: string;
  distractors?: string[];
}

export interface FillTheBlankActivity extends ActivityBase {
  type: 'FillTheBlank';
  correct: string;
  blankCount?: number;
}

export interface FreeResponseActivity extends ActivityBase {
  type: 'FreeResponse';
  expectedKeywords?: string[];
}

export interface AnalogyCraftActivity extends ActivityBase {
  type: 'AnalogyCraft';
  forbiddenTerms: string[];
  exampleAnalogy?: string;
}

export interface LogicBreakdownActivity extends ActivityBase {
  type: 'LogicBreakdown';
  steps: string[];
  correctOrder?: string[];
}

export interface TeachBackActivity extends ActivityBase {
  type: 'TeachBack';
  targetAudience: string;
  timeLimit?: number;
}

export interface MicroChallengeActivity extends ActivityBase {
  type: 'MicroChallenge';
  challenge: string;
  solution?: string;
}

export type Activity = 
  | MultipleChoiceActivity 
  | FillTheBlankActivity 
  | FreeResponseActivity 
  | AnalogyCraftActivity
  | LogicBreakdownActivity
  | TeachBackActivity
  | MicroChallengeActivity;

export interface Evaluation {
  score: number; // 0-100
  strengths: string[];
  misconceptions: string[];
  suggestion: string;
  feedback: string;
  reasoningScore?: number;
  terminologyScore?: number;
  completenessScore?: number;
}

export interface Checkpoint {
  id: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timer: number; // seconds
  activity: Activity;
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
  userAnswer?: any;
  userScore?: number;
  timeSpent?: number;
}

export interface Journey {
  topic: string;
  checkpoints: Checkpoint[];
  totalScore?: number;
  totalTime?: number;
  completedAt?: string;
  scenario?: ScenarioMode;
}

export interface GenerateRequest {
  topic: string;
  provider?: string;
  scenario?: ScenarioMode;
}

// Gamification
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlockedAt: string | null;
  condition: string;
}

export interface GamificationState {
  xp: number;
  streak: number;
  multiplier: number;
  achievements: Achievement[];
  totalCorrect: number;
  totalTimeSpent: number;
  lastActivityTimestamp?: string;
}

// Atom Knowledge Unit (AKU)
export interface AtomKnowledgeUnit {
  id: string;
  concept: string;
  description: string;
  dependencies: string[]; // IDs of other AKUs
  difficulty: number; // 1-5
  commonMisconceptions: string[];
  practicalApplications: string[];
}

export interface KnowledgeGraph {
  topic: string;
  atoms: AtomKnowledgeUnit[];
  edges: { source: string; target: string; type: string }[];
}