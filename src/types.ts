export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  iconName: string; // references lucide icon name
  topics: Topic[];
  isCustom?: boolean;
  grade?: number; // 1 to 9
}

export interface Concept {
  title: string;
  content: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface StudyContent {
  subjectId: string;
  topicId: string;
  topicName: string;
  summary: string;
  concepts: Concept[];
  takeaways: string[];
  flashcards: Flashcard[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  subjectId: string;
  topicId: string;
  topicName: string;
  questions: QuizQuestion[];
}

export interface DailyPracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface DailyPractice {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  conceptIntro: string;
  questions: DailyPracticeQuestion[];
}

export interface ActivityLog {
  id: string;
  date: string;
  action: string; // 'read', 'quiz', 'daily'
  subjectName: string;
  topicName: string;
  details: string;
}

export interface UserProgress {
  completedTopics: string[]; // topicIds
  quizScores: Record<string, number>; // topicId -> score (0-100)
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  completedDailyPractice: string[]; // dates e.g. ["2026-07-19"]
  studyMinutes: number;
  activities: ActivityLog[];
}
