import { create } from 'zustand';

type Feedback = 'idle' | 'correct' | 'wrong';

interface LessonStore {
  exerciseIndex: number;
  errorCount: number;
  input: string;
  feedback: Feedback;

  appendDigit: (digit: string) => void;
  backspace: () => void;
  submit: (correctAnswer: number) => boolean;
  nextExercise: () => void;
  resetLesson: () => void;
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  exerciseIndex: 0,
  errorCount: 0,
  input: '',
  feedback: 'idle',

  appendDigit: (digit) => {
    const { input } = get();
    if (input.length >= 2) return;
    set({ input: input + digit });
  },

  backspace: () => {
    const { input } = get();
    set({ input: input.slice(0, -1) });
  },

  submit: (correctAnswer) => {
    const { input, errorCount } = get();
    const userAnswer = parseInt(input, 10);
    const isCorrect = userAnswer === correctAnswer;
    set({
      feedback: isCorrect ? 'correct' : 'wrong',
      errorCount: isCorrect ? errorCount : errorCount + 1,
      input: '',
    });
    return isCorrect;
  },

  nextExercise: () => {
    set((state) => ({
      exerciseIndex: state.exerciseIndex + 1,
      feedback: 'idle',
      input: '',
    }));
  },

  resetLesson: () => {
    set({ exerciseIndex: 0, errorCount: 0, input: '', feedback: 'idle' });
  },
}));
