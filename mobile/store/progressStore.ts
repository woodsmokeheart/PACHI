import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LessonResult } from '../types';

export function calcStars(errors: number): number {
  if (errors === 0) return 3;
  if (errors <= 2) return 2;
  return 1;
}

interface ProgressStore {
  progress: Record<string, LessonResult>;
  saveLesson: (lessonId: string, stars: number) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  getLessonStars: (lessonId: string) => number;
  getChapterProgress: (lessonIds: string[]) => { completed: number; total: number };
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},

      saveLesson: (lessonId, stars) => {
        const current = get().progress[lessonId];
        const bestStars = current ? Math.max(current.stars, stars) : stars;
        const attempts = current ? current.attempts + 1 : 1;
        set((state) => ({
          progress: {
            ...state.progress,
            [lessonId]: { completed: true, stars: bestStars, attempts },
          },
        }));
      },

      isLessonCompleted: (lessonId) => {
        return get().progress[lessonId]?.completed ?? false;
      },

      getLessonStars: (lessonId) => {
        return get().progress[lessonId]?.stars ?? 0;
      },

      getChapterProgress: (lessonIds) => {
        const completed = lessonIds.filter((id) => get().isLessonCompleted(id)).length;
        return { completed, total: lessonIds.length };
      },
    }),
    {
      name: 'pachi-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
