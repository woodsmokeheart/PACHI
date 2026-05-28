# Math Kids App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React Native + Expo (TypeScript) offline app teaching first-grade arithmetic to Russian children, with chapter-based static content, custom numeric keyboard, star gamification, and local progress persistence.

**Architecture:** Expo app lives in `mobile/` subdirectory. Static content exported from TypeScript data files. Zustand manages runtime lesson state (ephemeral, resets each lesson) and persisted progress (AsyncStorage middleware). Expo Router v3 provides file-based stack navigation. No backend — fully offline.

**Tech Stack:** Expo SDK 52+, React Native, TypeScript, Expo Router v3, Zustand 4, @react-native-async-storage/async-storage, jest-expo

---

## File Structure

```
mobile/
  app/
    _layout.tsx             ← Stack root + SafeAreaProvider
    index.tsx               ← Home: chapter card grid
    chapter/[id].tsx        ← Chapter: lesson list with lock/stars
    lesson/[id].tsx         ← Lesson: sequential exercise flow
    result.tsx              ← Result: animated stars + continue button
    progress.tsx            ← Progress: all chapters overview
    settings.tsx            ← Settings: sound toggle
  components/
    ChapterCard.tsx         ← Pressable card: title + progress bar + lock
    LessonItem.tsx          ← Row: title + star icons + lock icon
    NumericKeyboard.tsx     ← Custom 0–9 + ⌫ + OK pad
    ExerciseArithmetic.tsx  ← "2 + 3 = ?" layout
    ExerciseWordProblem.tsx ← Text problem layout
    ExerciseCounting.tsx    ← Emoji grid layout
    StarRating.tsx          ← Animated 1–3 stars
    ProgressBar.tsx         ← Horizontal fill bar (prop: fill 0.0–1.0)
  store/
    progressStore.ts        ← Zustand persist: best stars per lessonId
    lessonStore.ts          ← Zustand ephemeral: index, errors, input, feedback
  data/
    index.ts                ← exports chapters: Chapter[]
    ch1.ts                  ← Chapter 1: Числа от 1 до 5
    ch2.ts                  ← Chapter 2: Числа от 6 до 10
  types/
    index.ts                ← Exercise, Lesson, Chapter, LessonResult types
  constants/
    theme.ts                ← COLORS, FONT, SIZES
  __tests__/
    progressStore.test.ts   ← unit: stars calc, chapter unlock, best-result
    lessonStore.test.ts     ← unit: input, backspace, submit, error count
  app.json
  package.json
  tsconfig.json
  jest.config.js
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `mobile/` (via Expo CLI)
- Modify: `mobile/app.json`
- Modify: `mobile/package.json`
- Create: `mobile/jest.config.js`

- [ ] **Step 1: Scaffold Expo project**

Run from `/Users/deniskukobin/pachi/`:
```bash
npx create-expo-app@latest mobile --template blank-typescript
```

Expected output: `✅ Your project is ready at mobile/`

- [ ] **Step 2: Install dependencies**

```bash
cd mobile
npx expo install expo-router zustand @react-native-async-storage/async-storage react-native-safe-area-context react-native-screens
npm install --save-dev jest-expo @testing-library/react-native @types/jest
```

- [ ] **Step 3: Configure app.json**

Replace `mobile/app.json` contents:
```json
{
  "expo": {
    "name": "PACHI",
    "slug": "pachi",
    "version": "1.0.0",
    "scheme": "pachi",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#FFF8E7"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFF8E7"
      },
      "package": "com.woodsmokeheart.pachi"
    },
    "plugins": ["expo-router"]
  }
}
```

- [ ] **Step 4: Configure package.json**

In `mobile/package.json`, add/update two fields:
```json
{
  "main": "expo-router/entry",
  "jest": {
    "preset": "jest-expo"
  }
}
```

Keep all other existing fields unchanged.

- [ ] **Step 5: Create jest.config.js**

Create `mobile/jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|zustand)',
  ],
};
```

- [ ] **Step 6: Create AsyncStorage mock for tests**

Create `mobile/__mocks__/@react-native-async-storage/async-storage.js`:
```javascript
const asyncStorageMock = {
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
};

export default asyncStorageMock;
```

- [ ] **Step 7: Verify setup**

```bash
cd mobile
npx expo start --no-dev --minify 2>&1 | head -5
```

Expected: no fatal errors (may show QR code or bundling info).

- [ ] **Step 8: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/
git commit -m "feat: scaffold Expo project in mobile/"
```

---

### Task 2: Types & Theme

**Files:**
- Create: `mobile/types/index.ts`
- Create: `mobile/constants/theme.ts`

- [ ] **Step 1: Create types**

Create `mobile/types/index.ts`:
```typescript
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
  stars: number;   // 1, 2, or 3
  attempts: number;
}
```

- [ ] **Step 2: Create theme constants**

Create `mobile/constants/theme.ts`:
```typescript
export const COLORS = {
  background: '#FFF8E7',
  card: '#FFFFFF',
  primary: '#FF6B35',
  primaryLight: '#FFE0D4',
  success: '#4CAF50',
  error: '#F44336',
  star: '#FFD700',
  starEmpty: '#E0E0E0',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E8E8E8',
  locked: '#BDBDBD',
  keyBackground: '#F5F5F5',
  keyBorder: '#DDDDDD',
} as const;

export const FONT = {
  sizeXL: 36,
  sizeLG: 28,
  sizeMD: 24,
  sizeSM: 18,
  sizeXS: 14,
  weightBold: '700' as const,
  weightRegular: '400' as const,
} as const;

export const SIZES = {
  padding: 16,
  paddingLG: 24,
  radius: 12,
  radiusLG: 20,
  buttonHeight: 56,
  keySize: 72,
  iconSize: 32,
} as const;
```

- [ ] **Step 3: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/types/ mobile/constants/
git commit -m "feat: add types and theme constants"
```

---

### Task 3: Content Data

**Files:**
- Create: `mobile/data/ch1.ts`
- Create: `mobile/data/ch2.ts`
- Create: `mobile/data/index.ts`

- [ ] **Step 1: Create Chapter 1 data**

Create `mobile/data/ch1.ts`:
```typescript
import { Chapter } from '../types';

const ch1: Chapter = {
  id: 'ch1',
  title: 'Числа от 1 до 5',
  lessons: [
    {
      id: 'ch1_l1',
      title: 'Урок 1. Число 1 и 2',
      exercises: [
        { type: 'arithmetic', question: '1 + 1 = ?', answer: 2 },
        { type: 'counting', text: 'Сколько яблок?', icon: '🍎', count: 1, answer: 1 },
        { type: 'word_problem', text: 'На столе лежало 1 яблоко. Положили ещё 1. Сколько яблок стало?', answer: 2 },
        { type: 'arithmetic', question: '2 - 1 = ?', answer: 1 },
        { type: 'counting', text: 'Сколько шаров?', icon: '🎈', count: 2, answer: 2 },
      ],
    },
    {
      id: 'ch1_l2',
      title: 'Урок 2. Число 3',
      exercises: [
        { type: 'arithmetic', question: '2 + 1 = ?', answer: 3 },
        { type: 'arithmetic', question: '3 - 1 = ?', answer: 2 },
        { type: 'counting', text: 'Сколько грибов?', icon: '🍄', count: 3, answer: 3 },
        { type: 'word_problem', text: 'В корзине 2 гриба. Нашли ещё 1. Сколько грибов в корзине?', answer: 3 },
        { type: 'arithmetic', question: '3 - 2 = ?', answer: 1 },
      ],
    },
    {
      id: 'ch1_l3',
      title: 'Урок 3. Числа 4 и 5',
      exercises: [
        { type: 'arithmetic', question: '3 + 1 = ?', answer: 4 },
        { type: 'arithmetic', question: '4 + 1 = ?', answer: 5 },
        { type: 'counting', text: 'Сколько звёзд?', icon: '⭐', count: 4, answer: 4 },
        { type: 'word_problem', text: 'На ветке сидели 3 птицы. Прилетела ещё 1. Сколько птиц стало?', answer: 4 },
        { type: 'arithmetic', question: '5 - 2 = ?', answer: 3 },
        { type: 'counting', text: 'Сколько цветков?', icon: '🌸', count: 5, answer: 5 },
      ],
    },
  ],
};

export default ch1;
```

- [ ] **Step 2: Create Chapter 2 data**

Create `mobile/data/ch2.ts`:
```typescript
import { Chapter } from '../types';

const ch2: Chapter = {
  id: 'ch2',
  title: 'Числа от 6 до 10',
  lessons: [
    {
      id: 'ch2_l1',
      title: 'Урок 1. Числа 6 и 7',
      exercises: [
        { type: 'arithmetic', question: '5 + 1 = ?', answer: 6 },
        { type: 'arithmetic', question: '6 + 1 = ?', answer: 7 },
        { type: 'counting', text: 'Сколько ягод?', icon: '🍓', count: 6, answer: 6 },
        { type: 'word_problem', text: 'В вазе 5 цветков. Поставили ещё 1. Сколько цветков стало?', answer: 6 },
        { type: 'arithmetic', question: '7 - 1 = ?', answer: 6 },
      ],
    },
    {
      id: 'ch2_l2',
      title: 'Урок 2. Числа 8 и 9',
      exercises: [
        { type: 'arithmetic', question: '7 + 1 = ?', answer: 8 },
        { type: 'arithmetic', question: '8 + 1 = ?', answer: 9 },
        { type: 'counting', text: 'Сколько рыбок?', icon: '🐟', count: 8, answer: 8 },
        { type: 'word_problem', text: 'В пруду плавали 7 рыбок. Приплыла ещё 1. Сколько рыбок стало?', answer: 8 },
        { type: 'arithmetic', question: '9 - 1 = ?', answer: 8 },
      ],
    },
    {
      id: 'ch2_l3',
      title: 'Урок 3. Число 10',
      exercises: [
        { type: 'arithmetic', question: '9 + 1 = ?', answer: 10 },
        { type: 'arithmetic', question: '10 - 1 = ?', answer: 9 },
        { type: 'counting', text: 'Сколько пальцев?', icon: '🖐️', count: 10, answer: 10 },
        { type: 'word_problem', text: 'В корзине 9 яблок. Положили ещё 1. Сколько яблок стало?', answer: 10 },
        { type: 'arithmetic', question: '10 - 5 = ?', answer: 5 },
      ],
    },
  ],
};

export default ch2;
```

- [ ] **Step 3: Create data index**

Create `mobile/data/index.ts`:
```typescript
import { Chapter } from '../types';
import ch1 from './ch1';
import ch2 from './ch2';

export const chapters: Chapter[] = [ch1, ch2];

export function getChapterById(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}

export function getLessonById(lessonId: string): { chapter: Chapter; lesson: import('../types').Lesson } | undefined {
  for (const chapter of chapters) {
    const lesson = chapter.lessons.find((l) => l.id === lessonId);
    if (lesson) return { chapter, lesson };
  }
  return undefined;
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/data/
git commit -m "feat: add chapter 1 and 2 content data"
```

---

### Task 4: Progress Store + Tests

**Files:**
- Create: `mobile/store/progressStore.ts`
- Create: `mobile/__tests__/progressStore.test.ts`

- [ ] **Step 1: Write failing tests first**

Create `mobile/__tests__/progressStore.test.ts`:
```typescript
import { act } from 'react-test-renderer';

// Reset store between tests
beforeEach(() => {
  jest.resetModules();
});

describe('progressStore', () => {
  it('initially has no progress', async () => {
    const { useProgressStore } = require('../store/progressStore');
    const store = useProgressStore.getState();
    expect(store.progress).toEqual({});
  });

  it('saves lesson with correct stars', () => {
    const { useProgressStore } = require('../store/progressStore');
    act(() => {
      useProgressStore.getState().saveLesson('ch1_l1', 3);
    });
    const store = useProgressStore.getState();
    expect(store.progress['ch1_l1']).toEqual({ completed: true, stars: 3, attempts: 1 });
  });

  it('keeps best stars on repeated attempts', () => {
    const { useProgressStore } = require('../store/progressStore');
    act(() => {
      useProgressStore.getState().saveLesson('ch1_l1', 3);
      useProgressStore.getState().saveLesson('ch1_l1', 1);
    });
    expect(useProgressStore.getState().progress['ch1_l1'].stars).toBe(3);
  });

  it('increments attempts', () => {
    const { useProgressStore } = require('../store/progressStore');
    act(() => {
      useProgressStore.getState().saveLesson('ch1_l1', 2);
      useProgressStore.getState().saveLesson('ch1_l1', 3);
    });
    expect(useProgressStore.getState().progress['ch1_l1'].attempts).toBe(2);
  });

  it('reports lesson as completed after save', () => {
    const { useProgressStore } = require('../store/progressStore');
    act(() => {
      useProgressStore.getState().saveLesson('ch1_l1', 1);
    });
    expect(useProgressStore.getState().isLessonCompleted('ch1_l1')).toBe(true);
  });

  it('reports lesson as not completed before save', () => {
    const { useProgressStore } = require('../store/progressStore');
    expect(useProgressStore.getState().isLessonCompleted('ch1_l1')).toBe(false);
  });

  it('calculates chapter progress correctly', () => {
    const { useProgressStore } = require('../store/progressStore');
    act(() => {
      useProgressStore.getState().saveLesson('ch1_l1', 3);
      useProgressStore.getState().saveLesson('ch1_l2', 2);
    });
    const result = useProgressStore.getState().getChapterProgress(['ch1_l1', 'ch1_l2', 'ch1_l3']);
    expect(result).toEqual({ completed: 2, total: 3 });
  });

  it('calculates stars for 0 errors as 3', () => {
    const { calcStars } = require('../store/progressStore');
    expect(calcStars(0)).toBe(3);
  });

  it('calculates stars for 1-2 errors as 2', () => {
    const { calcStars } = require('../store/progressStore');
    expect(calcStars(1)).toBe(2);
    expect(calcStars(2)).toBe(2);
  });

  it('calculates stars for 3+ errors as 1', () => {
    const { calcStars } = require('../store/progressStore');
    expect(calcStars(3)).toBe(1);
    expect(calcStars(10)).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd mobile
npx jest __tests__/progressStore.test.ts --no-coverage 2>&1 | tail -10
```

Expected: FAIL — "Cannot find module '../store/progressStore'"

- [ ] **Step 3: Implement the store**

Create `mobile/store/progressStore.ts`:
```typescript
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd mobile
npx jest __tests__/progressStore.test.ts --no-coverage 2>&1 | tail -10
```

Expected: PASS — all 10 tests green

- [ ] **Step 5: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/store/progressStore.ts mobile/__tests__/progressStore.test.ts
git commit -m "feat: add progress store with tests"
```

---

### Task 5: Lesson Store + Tests

**Files:**
- Create: `mobile/store/lessonStore.ts`
- Create: `mobile/__tests__/lessonStore.test.ts`

- [ ] **Step 1: Write failing tests**

Create `mobile/__tests__/lessonStore.test.ts`:
```typescript
import { act } from 'react-test-renderer';

beforeEach(() => {
  jest.resetModules();
});

describe('lessonStore', () => {
  it('starts with empty input and index 0', () => {
    const { useLessonStore } = require('../store/lessonStore');
    const s = useLessonStore.getState();
    expect(s.input).toBe('');
    expect(s.exerciseIndex).toBe(0);
    expect(s.errorCount).toBe(0);
    expect(s.feedback).toBe('idle');
  });

  it('appendDigit adds digit to input', () => {
    const { useLessonStore } = require('../store/lessonStore');
    act(() => useLessonStore.getState().appendDigit('3'));
    expect(useLessonStore.getState().input).toBe('3');
  });

  it('appendDigit does not exceed 2 digits', () => {
    const { useLessonStore } = require('../store/lessonStore');
    act(() => {
      useLessonStore.getState().appendDigit('1');
      useLessonStore.getState().appendDigit('2');
      useLessonStore.getState().appendDigit('3');
    });
    expect(useLessonStore.getState().input).toBe('12');
  });

  it('backspace removes last digit', () => {
    const { useLessonStore } = require('../store/lessonStore');
    act(() => {
      useLessonStore.getState().appendDigit('5');
      useLessonStore.getState().appendDigit('3');
      useLessonStore.getState().backspace();
    });
    expect(useLessonStore.getState().input).toBe('5');
  });

  it('submit returns true and sets correct feedback on right answer', () => {
    const { useLessonStore } = require('../store/lessonStore');
    act(() => useLessonStore.getState().appendDigit('5'));
    let result: boolean;
    act(() => { result = useLessonStore.getState().submit(5); });
    expect(result!).toBe(true);
    expect(useLessonStore.getState().feedback).toBe('correct');
    expect(useLessonStore.getState().errorCount).toBe(0);
  });

  it('submit returns false and increments errorCount on wrong answer', () => {
    const { useLessonStore } = require('../store/lessonStore');
    act(() => useLessonStore.getState().appendDigit('3'));
    let result: boolean;
    act(() => { result = useLessonStore.getState().submit(5); });
    expect(result!).toBe(false);
    expect(useLessonStore.getState().feedback).toBe('wrong');
    expect(useLessonStore.getState().errorCount).toBe(1);
  });

  it('submit clears input after attempt', () => {
    const { useLessonStore } = require('../store/lessonStore');
    act(() => {
      useLessonStore.getState().appendDigit('5');
      useLessonStore.getState().submit(5);
    });
    expect(useLessonStore.getState().input).toBe('');
  });

  it('nextExercise advances index and resets feedback', () => {
    const { useLessonStore } = require('../store/lessonStore');
    act(() => useLessonStore.getState().nextExercise());
    const s = useLessonStore.getState();
    expect(s.exerciseIndex).toBe(1);
    expect(s.feedback).toBe('idle');
  });

  it('resetLesson clears all state', () => {
    const { useLessonStore } = require('../store/lessonStore');
    act(() => {
      useLessonStore.getState().appendDigit('9');
      useLessonStore.getState().submit(5);
      useLessonStore.getState().nextExercise();
      useLessonStore.getState().resetLesson();
    });
    const s = useLessonStore.getState();
    expect(s.input).toBe('');
    expect(s.exerciseIndex).toBe(0);
    expect(s.errorCount).toBe(0);
    expect(s.feedback).toBe('idle');
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd mobile
npx jest __tests__/lessonStore.test.ts --no-coverage 2>&1 | tail -5
```

Expected: FAIL — "Cannot find module '../store/lessonStore'"

- [ ] **Step 3: Implement the store**

Create `mobile/store/lessonStore.ts`:
```typescript
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd mobile
npx jest __tests__/lessonStore.test.ts --no-coverage 2>&1 | tail -5
```

Expected: PASS — all 9 tests green

- [ ] **Step 5: Run all tests**

```bash
cd mobile
npx jest --no-coverage 2>&1 | tail -10
```

Expected: 19 tests passing total.

- [ ] **Step 6: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/store/lessonStore.ts mobile/__tests__/lessonStore.test.ts
git commit -m "feat: add lesson store with tests"
```

---

### Task 6: Shared UI Components

**Files:**
- Create: `mobile/components/ProgressBar.tsx`
- Create: `mobile/components/StarRating.tsx`
- Create: `mobile/components/NumericKeyboard.tsx`

- [ ] **Step 1: ProgressBar**

Create `mobile/components/ProgressBar.tsx`:
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface Props {
  fill: number; // 0.0 to 1.0
}

export default function ProgressBar({ fill }: Props) {
  const clampedFill = Math.min(1, Math.max(0, fill));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clampedFill * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});
```

- [ ] **Step 2: StarRating**

Create `mobile/components/StarRating.tsx`:
```typescript
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { FONT, SIZES } from '../constants/theme';

interface Props {
  stars: number;  // 1, 2, or 3
  animate?: boolean;
  size?: number;
}

export default function StarRating({ stars, animate = false, size = 40 }: Props) {
  const anims = [useRef(new Animated.Value(0)), useRef(new Animated.Value(0)), useRef(new Animated.Value(0))];

  useEffect(() => {
    if (!animate) {
      anims.forEach((a) => a.current.setValue(1));
      return;
    }
    Animated.stagger(
      200,
      anims.slice(0, stars).map((a) =>
        Animated.spring(a.current, { toValue: 1, useNativeDriver: true, tension: 100, friction: 5 })
      )
    ).start();
  }, [stars, animate]);

  return (
    <View style={styles.row}>
      {[0, 1, 2].map((i) => (
        <Animated.Text
          key={i}
          style={[
            styles.star,
            { fontSize: size },
            animate && {
              transform: [{ scale: anims[i].current }],
              opacity: anims[i].current,
            },
          ]}
        >
          {i < stars ? '⭐' : '☆'}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.padding,
  },
  star: {
    fontWeight: FONT.weightBold,
  },
});
```

- [ ] **Step 3: NumericKeyboard**

Create `mobile/components/NumericKeyboard.tsx`:
```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../constants/theme';

interface Props {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onOk: () => void;
  disabled?: boolean;
}

const ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['⌫', '0', 'OK'],
];

export default function NumericKeyboard({ onDigit, onBackspace, onOk, disabled }: Props) {
  const handleKey = (key: string) => {
    if (disabled) return;
    if (key === '⌫') return onBackspace();
    if (key === 'OK') return onOk();
    onDigit(key);
  };

  return (
    <View style={styles.container}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => handleKey(key)}
              style={({ pressed }) => [
                styles.key,
                key === 'OK' && styles.keyOk,
                pressed && styles.keyPressed,
                disabled && styles.keyDisabled,
              ]}
            >
              <Text style={[styles.keyText, key === 'OK' && styles.keyOkText]}>
                {key}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  key: {
    width: SIZES.keySize,
    height: SIZES.keySize,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.keyBackground,
    borderWidth: 1,
    borderColor: COLORS.keyBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyOk: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    width: SIZES.keySize,
  },
  keyPressed: {
    opacity: 0.6,
  },
  keyDisabled: {
    opacity: 0.4,
  },
  keyText: {
    fontSize: FONT.sizeMD,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  keyOkText: {
    color: '#FFFFFF',
  },
});
```

- [ ] **Step 4: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/components/ProgressBar.tsx mobile/components/StarRating.tsx mobile/components/NumericKeyboard.tsx
git commit -m "feat: add ProgressBar, StarRating, NumericKeyboard components"
```

---

### Task 7: Root Layout & Navigation Shell

**Files:**
- Modify: `mobile/app/_layout.tsx`

- [ ] **Step 1: Replace default _layout.tsx**

Replace the contents of `mobile/app/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      />
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/app/_layout.tsx
git commit -m "feat: configure root layout and navigation"
```

---

### Task 8: Home Screen (Chapter Grid)

**Files:**
- Create: `mobile/components/ChapterCard.tsx`
- Modify: `mobile/app/index.tsx`

- [ ] **Step 1: ChapterCard component**

Create `mobile/components/ChapterCard.tsx`:
```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../constants/theme';
import ProgressBar from './ProgressBar';

interface Props {
  title: string;
  completed: number;
  total: number;
  locked: boolean;
  onPress: () => void;
}

export default function ChapterCard({ title, completed, total, locked, onPress }: Props) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={({ pressed }) => [styles.card, locked && styles.cardLocked, pressed && !locked && styles.cardPressed]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, locked && styles.textLocked]} numberOfLines={2}>
          {locked ? '🔒 ' : ''}{title}
        </Text>
      </View>
      <View style={styles.footer}>
        <ProgressBar fill={total > 0 ? completed / total : 0} />
        <Text style={[styles.progress, locked && styles.textLocked]}>
          {completed}/{total} уроков
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.paddingLG,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  cardLocked: {
    backgroundColor: '#F5F5F5',
  },
  cardPressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT.sizeMD,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  textLocked: {
    color: COLORS.locked,
  },
  footer: {
    gap: 6,
  },
  progress: {
    fontSize: FONT.sizeXS,
    color: COLORS.textSecondary,
  },
});
```

- [ ] **Step 2: Home screen**

Replace `mobile/app/index.tsx`:
```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chapters } from '../data';
import { useProgressStore } from '../store/progressStore';
import ChapterCard from '../components/ChapterCard';
import { COLORS, FONT, SIZES } from '../constants/theme';

export default function HomeScreen() {
  const { getChapterProgress, isLessonCompleted } = useProgressStore();

  const isChapterUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    const prev = chapters[index - 1];
    return prev.lessons.every((l) => isLessonCompleted(l.id));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>ПАЧИ</Text>
        <Text style={styles.subtitle}>Математика 1 класс</Text>
        <View style={styles.headerButtons}>
          <Pressable onPress={() => router.push('/progress')} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>📊</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/settings')} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>⚙️</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {chapters.map((chapter, index) => {
          const lessonIds = chapter.lessons.map((l) => l.id);
          const { completed, total } = getChapterProgress(lessonIds);
          const locked = !isChapterUnlocked(index);
          return (
            <ChapterCard
              key={chapter.id}
              title={chapter.title}
              completed={completed}
              total={total}
              locked={locked}
              onPress={() => router.push(`/chapter/${chapter.id}`)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SIZES.paddingLG,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.paddingLG,
  },
  title: {
    fontSize: FONT.sizeXL,
    fontWeight: FONT.weightBold,
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT.sizeSM,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerButtons: {
    position: 'absolute',
    right: SIZES.paddingLG,
    top: SIZES.padding,
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerBtnText: { fontSize: 20 },
  list: {
    paddingHorizontal: SIZES.paddingLG,
    paddingBottom: SIZES.paddingLG,
  },
});
```

- [ ] **Step 3: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/components/ChapterCard.tsx mobile/app/index.tsx
git commit -m "feat: add home screen with chapter grid"
```

---

### Task 9: Chapter Screen (Lesson List)

**Files:**
- Create: `mobile/components/LessonItem.tsx`
- Create: `mobile/app/chapter/[id].tsx`

- [ ] **Step 1: LessonItem component**

Create `mobile/components/LessonItem.tsx`:
```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../constants/theme';

interface Props {
  title: string;
  stars: number;  // 0 = not done, 1-3 = done
  locked: boolean;
  onPress: () => void;
}

export default function LessonItem({ title, stars, locked, onPress }: Props) {
  const starsDisplay = locked ? '🔒' : stars > 0 ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : '☆☆☆';

  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={({ pressed }) => [styles.item, locked && styles.itemLocked, pressed && !locked && styles.itemPressed]}
    >
      <Text style={[styles.title, locked && styles.textLocked]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.stars}>{starsDisplay}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.paddingLG,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemLocked: {
    backgroundColor: '#F5F5F5',
  },
  itemPressed: {
    opacity: 0.8,
  },
  title: {
    flex: 1,
    fontSize: FONT.sizeSM,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  textLocked: {
    color: COLORS.locked,
  },
  stars: {
    fontSize: 18,
  },
});
```

- [ ] **Step 2: Chapter screen**

Create `mobile/app/chapter/[id].tsx`:
```typescript
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChapterById } from '../../data';
import { useProgressStore } from '../../store/progressStore';
import LessonItem from '../../components/LessonItem';
import { COLORS, FONT, SIZES } from '../../constants/theme';

export default function ChapterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chapter = getChapterById(id);
  const { isLessonCompleted, getLessonStars } = useProgressStore();

  if (!chapter) return null;

  const isLessonUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    return isLessonCompleted(chapter.lessons[index - 1].id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Назад</Text>
        </Pressable>
        <Text style={styles.title}>{chapter.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {chapter.lessons.map((lesson, index) => (
          <LessonItem
            key={lesson.id}
            title={lesson.title}
            stars={getLessonStars(lesson.id)}
            locked={!isLessonUnlocked(index)}
            onPress={() => router.push(`/lesson/${lesson.id}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SIZES.paddingLG,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.paddingLG,
    gap: 8,
  },
  backBtn: { alignSelf: 'flex-start' },
  backText: {
    fontSize: FONT.sizeSM,
    color: COLORS.primary,
    fontWeight: FONT.weightBold,
  },
  title: {
    fontSize: FONT.sizeLG,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  list: {
    paddingHorizontal: SIZES.paddingLG,
    paddingBottom: SIZES.paddingLG,
  },
});
```

- [ ] **Step 3: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/components/LessonItem.tsx mobile/app/chapter/
git commit -m "feat: add chapter screen with lesson list"
```

---

### Task 10: Exercise Components

**Files:**
- Create: `mobile/components/ExerciseArithmetic.tsx`
- Create: `mobile/components/ExerciseWordProblem.tsx`
- Create: `mobile/components/ExerciseCounting.tsx`

- [ ] **Step 1: ExerciseArithmetic**

Create `mobile/components/ExerciseArithmetic.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArithmeticExercise } from '../types';
import { COLORS, FONT, SIZES } from '../constants/theme';

interface Props {
  exercise: ArithmeticExercise;
  input: string;
  feedback: 'idle' | 'correct' | 'wrong';
  correctAnswer?: number;
}

export default function ExerciseArithmetic({ exercise, input, feedback, correctAnswer }: Props) {
  const questionDisplay = exercise.question.replace('?', input || '_');
  const borderColor =
    feedback === 'correct' ? COLORS.success : feedback === 'wrong' ? COLORS.error : COLORS.border;

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{questionDisplay}</Text>
      {feedback === 'wrong' && correctAnswer !== undefined && (
        <Text style={styles.hint}>Правильный ответ: {correctAnswer}</Text>
      )}
      <View style={[styles.inputBox, { borderColor }]}>
        <Text style={[styles.inputText, !input && styles.inputPlaceholder]}>
          {input || '?'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SIZES.paddingLG },
  question: {
    fontSize: 48,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  inputBox: {
    width: 100,
    height: 80,
    borderRadius: SIZES.radius,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  inputText: {
    fontSize: 48,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  inputPlaceholder: { color: COLORS.textSecondary },
  hint: {
    fontSize: FONT.sizeSM,
    color: COLORS.error,
    fontWeight: FONT.weightBold,
  },
});
```

- [ ] **Step 2: ExerciseWordProblem**

Create `mobile/components/ExerciseWordProblem.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WordProblemExercise } from '../types';
import { COLORS, FONT, SIZES } from '../constants/theme';

interface Props {
  exercise: WordProblemExercise;
  input: string;
  feedback: 'idle' | 'correct' | 'wrong';
  correctAnswer?: number;
}

export default function ExerciseWordProblem({ exercise, input, feedback, correctAnswer }: Props) {
  const borderColor =
    feedback === 'correct' ? COLORS.success : feedback === 'wrong' ? COLORS.error : COLORS.border;

  return (
    <View style={styles.container}>
      <View style={styles.textBox}>
        <Text style={styles.problemText}>{exercise.text}</Text>
      </View>
      {feedback === 'wrong' && correctAnswer !== undefined && (
        <Text style={styles.hint}>Правильный ответ: {correctAnswer}</Text>
      )}
      <View style={[styles.inputBox, { borderColor }]}>
        <Text style={[styles.inputText, !input && styles.inputPlaceholder]}>
          {input || '?'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SIZES.paddingLG, paddingHorizontal: SIZES.paddingLG },
  textBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.paddingLG,
  },
  problemText: {
    fontSize: FONT.sizeMD,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  inputBox: {
    width: 100,
    height: 80,
    borderRadius: SIZES.radius,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  inputText: {
    fontSize: 48,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  inputPlaceholder: { color: COLORS.textSecondary },
  hint: {
    fontSize: FONT.sizeSM,
    color: COLORS.error,
    fontWeight: FONT.weightBold,
  },
});
```

- [ ] **Step 3: ExerciseCounting**

Create `mobile/components/ExerciseCounting.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CountingExercise } from '../types';
import { COLORS, FONT, SIZES } from '../constants/theme';

interface Props {
  exercise: CountingExercise;
  input: string;
  feedback: 'idle' | 'correct' | 'wrong';
  correctAnswer?: number;
}

export default function ExerciseCounting({ exercise, input, feedback, correctAnswer }: Props) {
  const borderColor =
    feedback === 'correct' ? COLORS.success : feedback === 'wrong' ? COLORS.error : COLORS.border;

  const icons = Array.from({ length: exercise.count }, (_, i) => i);

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{exercise.text}</Text>
      <View style={styles.iconGrid}>
        {icons.map((i) => (
          <Text key={i} style={styles.icon}>{exercise.icon}</Text>
        ))}
      </View>
      {feedback === 'wrong' && correctAnswer !== undefined && (
        <Text style={styles.hint}>Правильный ответ: {correctAnswer}</Text>
      )}
      <View style={[styles.inputBox, { borderColor }]}>
        <Text style={[styles.inputText, !input && styles.inputPlaceholder]}>
          {input || '?'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SIZES.paddingLG, paddingHorizontal: SIZES.padding },
  questionText: {
    fontSize: FONT.sizeMD,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 280,
  },
  icon: { fontSize: 40 },
  inputBox: {
    width: 100,
    height: 80,
    borderRadius: SIZES.radius,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  inputText: {
    fontSize: 48,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  inputPlaceholder: { color: COLORS.textSecondary },
  hint: {
    fontSize: FONT.sizeSM,
    color: COLORS.error,
    fontWeight: FONT.weightBold,
  },
});
```

- [ ] **Step 4: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/components/Exercise*.tsx
git commit -m "feat: add exercise display components (arithmetic, word, counting)"
```

---

### Task 11: Lesson Screen

**Files:**
- Create: `mobile/app/lesson/[id].tsx`

- [ ] **Step 1: Create lesson screen**

Create `mobile/app/lesson/[id].tsx`:
```typescript
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById } from '../../data';
import { useLessonStore } from '../../store/lessonStore';
import { useProgressStore } from '../../store/progressStore';
import { calcStars } from '../../store/progressStore';
import NumericKeyboard from '../../components/NumericKeyboard';
import ExerciseArithmetic from '../../components/ExerciseArithmetic';
import ExerciseWordProblem from '../../components/ExerciseWordProblem';
import ExerciseCounting from '../../components/ExerciseCounting';
import { COLORS, FONT, SIZES } from '../../constants/theme';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const result = getLessonById(id);
  const { exerciseIndex, errorCount, input, feedback, appendDigit, backspace, submit, nextExercise, resetLesson } = useLessonStore();
  const { saveLesson } = useProgressStore();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    resetLesson();
  }, [id]);

  if (!result) return null;
  const { lesson } = result;
  const exercises = lesson.exercises;
  const isDone = exerciseIndex >= exercises.length;

  useEffect(() => {
    if (isDone) {
      const stars = calcStars(errorCount);
      saveLesson(lesson.id, stars);
      router.replace({ pathname: '/result', params: { lessonId: lesson.id, stars, lessonTitle: lesson.title } });
    }
  }, [isDone]);

  useEffect(() => {
    if (feedback === 'wrong') {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => nextExercise(), 1200);
      });
    } else if (feedback === 'correct') {
      setTimeout(() => nextExercise(), 600);
    }
  }, [feedback]);

  if (isDone) return null;

  const exercise = exercises[exerciseIndex];
  const progress = exerciseIndex / exercises.length;

  const handleOk = () => {
    if (!input) return;
    submit(exercise.answer);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => { resetLesson(); router.back(); }}>
          <Text style={styles.backText}>← Выход</Text>
        </Pressable>
        <Text style={styles.counter}>{exerciseIndex + 1} / {exercises.length}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Animated.View style={[styles.exerciseArea, { transform: [{ translateX: shakeAnim }] }]}>
        {exercise.type === 'arithmetic' && (
          <ExerciseArithmetic exercise={exercise} input={input} feedback={feedback} correctAnswer={exercise.answer} />
        )}
        {exercise.type === 'word_problem' && (
          <ExerciseWordProblem exercise={exercise} input={input} feedback={feedback} correctAnswer={exercise.answer} />
        )}
        {exercise.type === 'counting' && (
          <ExerciseCounting exercise={exercise} input={input} feedback={feedback} correctAnswer={exercise.answer} />
        )}
      </Animated.View>

      <NumericKeyboard
        onDigit={appendDigit}
        onBackspace={backspace}
        onOk={handleOk}
        disabled={feedback !== 'idle'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLG,
    paddingVertical: SIZES.padding,
  },
  backText: { fontSize: FONT.sizeSM, color: COLORS.primary, fontWeight: FONT.weightBold },
  counter: { fontSize: FONT.sizeSM, color: COLORS.textSecondary, fontWeight: FONT.weightBold },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.paddingLG,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  exerciseArea: { flex: 1 },
});
```

- [ ] **Step 2: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/app/lesson/
git commit -m "feat: add lesson screen with exercise flow"
```

---

### Task 12: Result Screen

**Files:**
- Create: `mobile/app/result.tsx`

- [ ] **Step 1: Create result screen**

Create `mobile/app/result.tsx`:
```typescript
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import StarRating from '../components/StarRating';
import { COLORS, FONT, SIZES } from '../constants/theme';

export default function ResultScreen() {
  const { lessonId, stars, lessonTitle } = useLocalSearchParams<{
    lessonId: string;
    stars: string;
    lessonTitle: string;
  }>();

  const starsNum = parseInt(stars, 10) || 1;

  const messages: Record<number, string> = {
    3: 'Отлично! Без единой ошибки! 🎉',
    2: 'Хорошо! Почти без ошибок! 👍',
    1: 'Молодец, что дошёл до конца! Попробуй ещё раз 💪',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Урок завершён!</Text>
        <Text style={styles.lessonName}>{lessonTitle}</Text>

        <StarRating stars={starsNum} animate size={56} />

        <Text style={styles.message}>{messages[starsNum]}</Text>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => router.replace(`/lesson/${lessonId}`)}
          >
            <Text style={styles.btnSecondaryText}>Ещё раз</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.btnPrimaryText}>На главную</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingLG,
    gap: SIZES.paddingLG,
  },
  title: {
    fontSize: FONT.sizeXL,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  lessonName: {
    fontSize: FONT.sizeSM,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT.sizeMD,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SIZES.padding,
  },
  btn: {
    flex: 1,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnSecondary: { backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.primary },
  btnPrimaryText: { fontSize: FONT.sizeSM, fontWeight: FONT.weightBold, color: '#FFFFFF' },
  btnSecondaryText: { fontSize: FONT.sizeSM, fontWeight: FONT.weightBold, color: COLORS.primary },
});
```

- [ ] **Step 2: Commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/app/result.tsx
git commit -m "feat: add result screen with animated stars"
```

---

### Task 13: Progress & Settings Screens

**Files:**
- Create: `mobile/app/progress.tsx`
- Create: `mobile/app/settings.tsx`

- [ ] **Step 1: Progress screen**

Create `mobile/app/progress.tsx`:
```typescript
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chapters } from '../data';
import { useProgressStore } from '../store/progressStore';
import StarRating from '../components/StarRating';
import { COLORS, FONT, SIZES } from '../constants/theme';

export default function ProgressScreen() {
  const { getLessonStars, isLessonCompleted, getChapterProgress } = useProgressStore();

  const totalLessons = chapters.reduce((sum, c) => sum + c.lessons.length, 0);
  const completedLessons = chapters.reduce(
    (sum, c) => sum + c.lessons.filter((l) => isLessonCompleted(l.id)).length,
    0
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Назад</Text>
        </Pressable>
        <Text style={styles.title}>Мой прогресс</Text>
        <Text style={styles.summary}>{completedLessons} из {totalLessons} уроков пройдено</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {chapters.map((chapter) => {
          const lessonIds = chapter.lessons.map((l) => l.id);
          const { completed, total } = getChapterProgress(lessonIds);
          return (
            <View key={chapter.id} style={styles.chapter}>
              <Text style={styles.chapterTitle}>{chapter.title}</Text>
              <Text style={styles.chapterProgress}>{completed}/{total} уроков</Text>
              {chapter.lessons.map((lesson) => {
                const s = getLessonStars(lesson.id);
                return (
                  <View key={lesson.id} style={styles.lessonRow}>
                    <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
                    {s > 0 ? (
                      <StarRating stars={s} size={16} />
                    ) : (
                      <Text style={styles.notDone}>не пройден</Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SIZES.paddingLG,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.paddingLG,
    gap: 6,
  },
  back: { fontSize: FONT.sizeSM, color: COLORS.primary, fontWeight: FONT.weightBold },
  title: { fontSize: FONT.sizeLG, fontWeight: FONT.weightBold, color: COLORS.textPrimary },
  summary: { fontSize: FONT.sizeXS, color: COLORS.textSecondary },
  list: { paddingHorizontal: SIZES.paddingLG, paddingBottom: SIZES.paddingLG, gap: 16 },
  chapter: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.paddingLG,
    gap: 10,
    elevation: 2,
  },
  chapterTitle: { fontSize: FONT.sizeSM, fontWeight: FONT.weightBold, color: COLORS.textPrimary },
  chapterProgress: { fontSize: FONT.sizeXS, color: COLORS.textSecondary },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lessonTitle: { flex: 1, fontSize: FONT.sizeXS, color: COLORS.textPrimary, marginRight: 8 },
  notDone: { fontSize: FONT.sizeXS, color: COLORS.textSecondary },
});
```

- [ ] **Step 2: Settings screen**

Create `mobile/app/settings.tsx`:
```typescript
import React from 'react';
import { View, Text, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgressStore } from '../store/progressStore';
import { COLORS, FONT, SIZES } from '../constants/theme';

export default function SettingsScreen() {
  const { progress } = useProgressStore();

  const handleReset = () => {
    Alert.alert(
      'Сбросить прогресс?',
      'Весь прогресс будет удалён. Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: () => useProgressStore.setState({ progress: {} }),
        },
      ]
    );
  };

  const totalDone = Object.keys(progress).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Назад</Text>
        </Pressable>
        <Text style={styles.title}>Настройки</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Прогресс</Text>
        <Text style={styles.info}>Пройдено уроков: {totalDone}</Text>
        <Pressable style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>Сбросить прогресс</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О приложении</Text>
        <Text style={styles.info}>ПАЧИ — Математика 1 класс</Text>
        <Text style={styles.info}>Версия 1.0.0</Text>
        <Text style={styles.info}>Основано на учебнике 1956 года</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SIZES.paddingLG,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.paddingLG,
    gap: 6,
  },
  back: { fontSize: FONT.sizeSM, color: COLORS.primary, fontWeight: FONT.weightBold },
  title: { fontSize: FONT.sizeLG, fontWeight: FONT.weightBold, color: COLORS.textPrimary },
  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.paddingLG,
    marginBottom: 12,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.paddingLG,
    gap: 10,
    elevation: 1,
  },
  sectionTitle: { fontSize: FONT.sizeSM, fontWeight: FONT.weightBold, color: COLORS.textPrimary },
  info: { fontSize: FONT.sizeXS, color: COLORS.textSecondary },
  resetBtn: {
    backgroundColor: '#FFEBEE',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: 4,
  },
  resetText: { fontSize: FONT.sizeSM, color: COLORS.error, fontWeight: FONT.weightBold },
});
```

- [ ] **Step 3: Final test run**

```bash
cd mobile
npx jest --no-coverage 2>&1 | tail -10
```

Expected: All tests passing.

- [ ] **Step 4: Final commit**

```bash
cd /Users/deniskukobin/pachi
git add mobile/app/progress.tsx mobile/app/settings.tsx
git commit -m "feat: add progress and settings screens"
git push origin main
```

---

## Done ✅

After Task 13, the app is complete and runnable. To test on a device:

```bash
cd mobile
npx expo start
```

Scan the QR code with the **Expo Go** app on an Android phone.

To build for RuStore:
```bash
npx eas build --platform android --profile production
```

This generates an `.aab` file ready for upload to РуСтор.
