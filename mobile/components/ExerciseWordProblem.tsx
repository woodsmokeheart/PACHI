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
    feedback === 'correct'
      ? COLORS.success
      : feedback === 'wrong'
      ? COLORS.error
      : COLORS.border;

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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.paddingLG,
    paddingHorizontal: SIZES.paddingLG,
  },
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
  inputPlaceholder: {
    color: COLORS.textSecondary,
  },
  hint: {
    fontSize: FONT.sizeSM,
    color: COLORS.error,
    fontWeight: FONT.weightBold,
  },
});
