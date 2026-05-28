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
  const {
    exerciseIndex,
    errorCount,
    input,
    feedback,
    appendDigit,
    backspace,
    submit,
    nextExercise,
    resetLesson,
  } = useLessonStore();
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
      router.replace({
        pathname: '/result',
        params: { lessonId: lesson.id, stars: String(stars), lessonTitle: lesson.title },
      });
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
        <Pressable
          onPress={() => {
            resetLesson();
            router.back();
          }}
        >
          <Text style={styles.backText}>← Выход</Text>
        </Pressable>
        <Text style={styles.counter}>
          {exerciseIndex + 1} / {exercises.length}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Animated.View
        style={[styles.exerciseArea, { transform: [{ translateX: shakeAnim }] }]}
      >
        {exercise.type === 'arithmetic' && (
          <ExerciseArithmetic
            exercise={exercise}
            input={input}
            feedback={feedback}
            correctAnswer={exercise.answer}
          />
        )}
        {exercise.type === 'word_problem' && (
          <ExerciseWordProblem
            exercise={exercise}
            input={input}
            feedback={feedback}
            correctAnswer={exercise.answer}
          />
        )}
        {exercise.type === 'counting' && (
          <ExerciseCounting
            exercise={exercise}
            input={input}
            feedback={feedback}
            correctAnswer={exercise.answer}
          />
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
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLG,
    paddingVertical: SIZES.padding,
  },
  backText: {
    fontSize: FONT.sizeSM,
    color: COLORS.primary,
    fontWeight: FONT.weightBold,
  },
  counter: {
    fontSize: FONT.sizeSM,
    color: COLORS.textSecondary,
    fontWeight: FONT.weightBold,
  },
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
  exerciseArea: {
    flex: 1,
  },
});
