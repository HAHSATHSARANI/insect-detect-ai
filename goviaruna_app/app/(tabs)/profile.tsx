import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">{t('tabs.profile')}</ThemedText>
      <ThemedText>This will be the profile screen</ThemedText>
    </ThemedView>
  );
}
