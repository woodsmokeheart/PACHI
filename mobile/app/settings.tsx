import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgressStore } from '../store/progressStore';
import { COLORS, FONT, SIZES } from '../constants/theme';

export default function SettingsScreen() {
  const { progress } = useProgressStore();

  const handleReset = () => {
    Alert.alert(
      'Сбросить прогресс?',
      'Весь прогресс будет удалён. Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: () => useProgressStore.setState({ progress: {} }),
        },
      ]
    );
  };

  const totalDone = Object.keys(progress).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Назад</Text>
        </Pressable>
        <Text style={styles.title}>Настройки</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Прогресс</Text>
        <Text style={styles.info}>Пройдено уроков: {totalDone}</Text>
        <Pressable style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>Сбросить прогресс</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О приложении</Text>
        <Text style={styles.info}>ПАЧИ — Математика 1 класс</Text>
        <Text style={styles.info}>Версия 1.0.0</Text>
        <Text style={styles.info}>Основано на учебнике 1956 года</Text>
      </View>
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
  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.paddingLG,
    marginBottom: 12,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.paddingLG,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: FONT.sizeSM,
    fontWeight: FONT.weightBold,
    color: COLORS.textPrimary,
  },
  info: {
    fontSize: FONT.sizeXS,
    color: COLORS.textSecondary,
  },
  resetBtn: {
    backgroundColor: '#FFEBEE',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: 4,
  },
  resetText: {
    fontSize: FONT.sizeSM,
    color: COLORS.error,
    fontWeight: FONT.weightBold,
  },
});
