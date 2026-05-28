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
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
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
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.paddingLG,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.paddingLG,
    gap: 8,
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
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
