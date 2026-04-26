export interface VocabCard {
  id: string;
  word: string;
  furigana: string;
  meaning: string;
  example: string;
  exampleFurigana?: string;
  exampleMeaning: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
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
  grammarPoints?: { pattern: string; explanation: string }[];
  dialogues: { role: string; text: string; textFurigana?: string; textCn?: string }[];
}

export interface StudyStats {
  totalWords: number;
  masteredWords: number;
  dueForReview: number;
  studyStreak: number;
  lastStudyDate: string;
  scenarioProgress: Record<string, boolean>;
}
