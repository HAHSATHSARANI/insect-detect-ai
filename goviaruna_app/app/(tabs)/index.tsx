import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">{t('tabs.home')}</ThemedText>
      <ThemedText>This will be the main home screen</ThemedText>
    </ThemedView>
  );
}
