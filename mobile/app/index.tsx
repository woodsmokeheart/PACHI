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
        <View>
          <Text style={styles.title}>ПАЧИ</Text>
          <Text style={styles.subtitle}>Математика 1 класс</Text>
        </View>
        <View style={styles.headerButtons}>
          <Pressable onPress={() => router.push('/progress')} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>📊</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/settings')} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>⚙️</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
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
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: FONT.sizeXS,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerButtons: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerBtnText: {
    fontSize: 20,
  },
  list: {
    paddingHorizontal: SIZES.paddingLG,
    paddingBottom: SIZES.paddingLG,
  },
});
