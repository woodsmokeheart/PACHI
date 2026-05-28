export type ExerciseType = 'arithmetic' | 'word_problem' | 'counting';

export interface ArithmeticExercise {
  type: 'arithmetic';
  question: string; // e.g. "2 + 3 = ?"
  answer: number;
}

export interface WordProblemExercise {
  type: 'word_problem';
  text: string;
  answer: number;
}

export interface CountingExercise {
  type: 'counting';
  text: string;
  icon: string; // emoji, e.g. "🍎"
  count: number;
  answer: number;
}

export type Exercise = ArithmeticExercise | WordProblemExercise | CountingExercise;

export interface Lesson {
  id: string;
  title: string;
  exercises: Exercise[];
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface LessonResult {
  completed: boolean;
  stars: number; // 1, 2, or 3
  attempts: number;
}
