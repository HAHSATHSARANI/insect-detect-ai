import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import i18n from '@/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    const checkI18nInit = () => {
      if (i18n.isInitialized) {
        setIsI18nInitialized(true);
      } else {
        // Wait a bit and check again
        setTimeout(checkI18nInit, 100);
      }
    };
    
    checkI18nInit();
  }, []);

  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}
