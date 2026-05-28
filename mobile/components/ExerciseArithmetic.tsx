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
    feedback === 'correct'
      ? COLORS.success
      : feedback === 'wrong'
      ? COLORS.error
      : COLORS.border;

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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.paddingLG,
  },
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
  inputPlaceholder: {
    color: COLORS.textSecondary,
  },
  hint: {
    fontSize: FONT.sizeSM,
    color: COLORS.error,
    fontWeight: FONT.weightBold,
  },
});
