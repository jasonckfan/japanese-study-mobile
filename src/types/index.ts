export interface VocabCard {
  id: string;
  word: string;
  furigana: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  level: 'N5' | 'N4';
  nextReview: number;
  interval: number;
  reviewCount: number;
  mastered: boolean;
}

export interface ConversationScenario {
  id: string;
  title: string;
  titleCn: string;
  icon: string;
  context: string;
  contextCn: string;
  roles: { id: string; name: string; nameCn: string }[];
  phrases: { text: string; meaning: string }[];
  dialogues: { role: string; text: string }[];
}

export interface StudyStats {
  totalWords: number;
  masteredWords: number;
  dueForReview: number;
  studyStreak: number;
  lastStudyDate: string;
  scenarioProgress: Record<string, boolean>;
}
