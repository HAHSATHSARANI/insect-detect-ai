import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t, ready } = useTranslation();

  // Fallback labels if translation is not ready
  const getTitle = (key: string, fallback: string) => {
    return ready ? t(key) : fallback;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4A7C23',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: getTitle('tabs.home', 'Home'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: getTitle('tabs.collection', 'Collection'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: getTitle('tabs.search', 'Search'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: getTitle('tabs.profile', 'Profile'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
