import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from 'react-i18next';

export default function CollectionScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">{t('tabs.collection')}</ThemedText>
      <ThemedText>This will be the collection screen</ThemedText>
    </ThemedView>
  );
}
