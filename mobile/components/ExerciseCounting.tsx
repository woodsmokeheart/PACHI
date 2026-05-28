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
    feedback === 'correct'
      ? COLORS.success
      : feedback === 'wrong'
      ? COLORS.error
      : COLORS.border;

  const icons = Array.from({ length: exercise.count });

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{exercise.text}</Text>
      <View style={styles.iconGrid}>
        {icons.map((_, i) => (
          <Text key={i} style={styles.icon}>
            {exercise.icon}
          </Text>
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.paddingLG,
    paddingHorizontal: SIZES.padding,
  },
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
  icon: {
    fontSize: 40,
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
  inputPlaceholder: {
    color: COLORS.textSecondary,
  },
  hint: {
    fontSize: FONT.sizeSM,
    color: COLORS.error,
    fontWeight: FONT.weightBold,
  },
});
