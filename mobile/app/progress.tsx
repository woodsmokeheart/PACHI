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
        <Text style={styles.summary}>
          {completedLessons} из {totalLessons} уроков пройдено
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {chapters.map((chapter) => {
          const lessonIds = chapter.lessons.map((l) => l.id);
          const { completed, total } = getChapterProgress(lessonIds);
          return (
            <View key={chapter.id} style={styles.chapter}>
              <Text style={styles.chapterTitle}>{chapter.title}</Text>
              <Text style={styles.chapterProgress}>
                {completed}/{total} уроков
              </Text>
              {chapter.lessons.map((lesson) => {
                const s = getLessonStars(lesson.id);
                return (
                  <View key={lesson.id} style={styles.lessonRow}>
                    <Text style={styles.lessonTitle} numberOfLines={1}>
                      {lesson.title}
                    </Text>
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
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.paddingLG,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.paddingLG,
    gap: 6,
  },
  back: {
    fontSize: FONT.sizeSM,
    color: COLORS.primary,
    fontWeight: FONT.weightBold,
  },
  title: {
    fontSize: FONT.sizeLG,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  summary: {
    fontSize: FONT.sizeXS,
    color: COLORS.textSecondary,
  },
  list: {
    paddingHorizontal: SIZES.paddingLG,
    paddingBottom: SIZES.paddingLG,
    gap: 16,
  },
  chapter: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.paddingLG,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  chapterTitle: {
    fontSize: FONT.sizeSM,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  chapterProgress: {
    fontSize: FONT.sizeXS,
    color: COLORS.textSecondary,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lessonTitle: {
    flex: 1,
    fontSize: FONT.sizeXS,
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  notDone: {
    fontSize: FONT.sizeXS,
    color: COLORS.textSecondary,
  },
});
