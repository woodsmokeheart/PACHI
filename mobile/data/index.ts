import { Chapter, Lesson } from '../types';
import ch1 from './ch1';
import ch2 from './ch2';

export const chapters: Chapter[] = [ch1, ch2];

export function getChapterById(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}

export function getLessonById(lessonId: string): { chapter: Chapter; lesson: Lesson } | undefined {
  for (const chapter of chapters) {
    const lesson = chapter.lessons.find((l) => l.id === lessonId);
    if (lesson) return { chapter, lesson };
  }
  return undefined;
}
