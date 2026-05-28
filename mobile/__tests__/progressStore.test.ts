import { useProgressStore, calcStars } from '../store/progressStore';

beforeEach(() => {
  useProgressStore.setState({ progress: {} });
});

describe('progressStore', () => {
  it('initially has no progress', () => {
    expect(useProgressStore.getState().progress).toEqual({});
  });

  it('saves lesson with correct stars', () => {
    useProgressStore.getState().saveLesson('ch1_l1', 3);
    expect(useProgressStore.getState().progress['ch1_l1']).toEqual({
      completed: true,
      stars: 3,
      attempts: 1,
    });
  });

  it('keeps best stars on repeated attempts', () => {
    useProgressStore.getState().saveLesson('ch1_l1', 3);
    useProgressStore.getState().saveLesson('ch1_l1', 1);
    expect(useProgressStore.getState().progress['ch1_l1'].stars).toBe(3);
  });

  it('increments attempts', () => {
    useProgressStore.getState().saveLesson('ch1_l1', 2);
    useProgressStore.getState().saveLesson('ch1_l1', 3);
    expect(useProgressStore.getState().progress['ch1_l1'].attempts).toBe(2);
  });

  it('reports lesson as completed after save', () => {
    useProgressStore.getState().saveLesson('ch1_l1', 1);
    expect(useProgressStore.getState().isLessonCompleted('ch1_l1')).toBe(true);
  });

  it('reports lesson as not completed before save', () => {
    expect(useProgressStore.getState().isLessonCompleted('ch1_l1')).toBe(false);
  });

  it('calculates chapter progress correctly', () => {
    useProgressStore.getState().saveLesson('ch1_l1', 3);
    useProgressStore.getState().saveLesson('ch1_l2', 2);
    const result = useProgressStore.getState().getChapterProgress(['ch1_l1', 'ch1_l2', 'ch1_l3']);
    expect(result).toEqual({ completed: 2, total: 3 });
  });
});

describe('calcStars', () => {
  it('returns 3 for 0 errors', () => expect(calcStars(0)).toBe(3));
  it('returns 2 for 1 error', () => expect(calcStars(1)).toBe(2));
  it('returns 2 for 2 errors', () => expect(calcStars(2)).toBe(2));
  it('returns 1 for 3 errors', () => expect(calcStars(3)).toBe(1));
  it('returns 1 for many errors', () => expect(calcStars(10)).toBe(1));
});
