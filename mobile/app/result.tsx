import React from 'react';
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
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
    width: '100%',
  },
  btn: {
    flex: 1,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnSecondary: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  btnPrimaryText: {
    fontSize: FONT.sizeSM,
    fontWeight: FONT.weightBold,
    color: '#FFFFFF',
  },
  btnSecondaryText: {
    fontSize: FONT.sizeSM,
    fontWeight: FONT.weightBold,
    color: COLORS.primary,
  },
});
