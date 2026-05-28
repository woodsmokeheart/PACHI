import { useLessonStore } from '../store/lessonStore';

beforeEach(() => {
  useLessonStore.getState().resetLesson();
});

describe('lessonStore', () => {
  it('starts with empty input and index 0', () => {
    const s = useLessonStore.getState();
    expect(s.input).toBe('');
    expect(s.exerciseIndex).toBe(0);
    expect(s.errorCount).toBe(0);
    expect(s.feedback).toBe('idle');
  });

  it('appendDigit adds digit to input', () => {
    useLessonStore.getState().appendDigit('3');
    expect(useLessonStore.getState().input).toBe('3');
  });

  it('appendDigit does not exceed 2 digits', () => {
    useLessonStore.getState().appendDigit('1');
    useLessonStore.getState().appendDigit('2');
    useLessonStore.getState().appendDigit('3');
    expect(useLessonStore.getState().input).toBe('12');
  });

  it('backspace removes last digit', () => {
    useLessonStore.getState().appendDigit('5');
    useLessonStore.getState().appendDigit('3');
    useLessonStore.getState().backspace();
    expect(useLessonStore.getState().input).toBe('5');
  });

  it('submit returns true and sets correct feedback on right answer', () => {
    useLessonStore.getState().appendDigit('5');
    const result = useLessonStore.getState().submit(5);
    expect(result).toBe(true);
    expect(useLessonStore.getState().feedback).toBe('correct');
    expect(useLessonStore.getState().errorCount).toBe(0);
  });

  it('submit returns false and increments errorCount on wrong answer', () => {
    useLessonStore.getState().appendDigit('3');
    const result = useLessonStore.getState().submit(5);
    expect(result).toBe(false);
    expect(useLessonStore.getState().feedback).toBe('wrong');
    expect(useLessonStore.getState().errorCount).toBe(1);
  });

  it('submit clears input after attempt', () => {
    useLessonStore.getState().appendDigit('5');
    useLessonStore.getState().submit(5);
    expect(useLessonStore.getState().input).toBe('');
  });

  it('nextExercise advances index and resets feedback', () => {
    useLessonStore.getState().nextExercise();
    const s = useLessonStore.getState();
    expect(s.exerciseIndex).toBe(1);
    expect(s.feedback).toBe('idle');
  });

  it('resetLesson clears all state', () => {
    useLessonStore.getState().appendDigit('9');
    useLessonStore.getState().submit(5);
    useLessonStore.getState().nextExercise();
    useLessonStore.getState().resetLesson();
    const s = useLessonStore.getState();
    expect(s.input).toBe('');
    expect(s.exerciseIndex).toBe(0);
    expect(s.errorCount).toBe(0);
    expect(s.feedback).toBe('idle');
  });
});
