export type ActivityType = 'MultipleChoice' | 'FillTheBlank' | 'FreeResponse' | 'AnalogyCraft';

export interface ActivityBase {
  type: ActivityType;
  prompt: string;
  hint?: string;
}

export interface MultipleChoiceActivity extends ActivityBase {
  type: 'MultipleChoice';
  options: string[];
  correct: string;
}

export interface FillTheBlankActivity extends ActivityBase {
  type: 'FillTheBlank';
  correct: string;
}

export interface FreeResponseActivity extends ActivityBase {
  type: 'FreeResponse';
}

export interface AnalogyCraftActivity extends ActivityBase {
  type: 'AnalogyCraft';
}

export type Activity = MultipleChoiceActivity | FillTheBlankActivity | FreeResponseActivity | AnalogyCraftActivity;

export interface Checkpoint {
  id: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timer: number; // seconds
  activity: Activity;
}

export interface Journey {
  topic: string;
  checkpoints: Checkpoint[];
}

export interface GenerateRequest {
  topic: string;
}