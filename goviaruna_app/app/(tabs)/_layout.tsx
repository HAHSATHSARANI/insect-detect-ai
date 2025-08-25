import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ACTIVE_COLOR = '#FFFFFF';
const INACTIVE_COLOR = '#9E9E9E';
const TAB_BAR_BACKGROUND = '#212121';
const ACTIVE_BACKGROUND = '#3A8A55';

const CustomTabIcon = ({ name, focused }: { name: React.ComponentProps<typeof Feather>['name'], focused: boolean }) => {
  return (
    <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
      <Feather name={name} size={24} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <CustomTabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <CustomTabIcon name="search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          tabBarIcon: ({ focused }) => <CustomTabIcon name="plus-square" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <CustomTabIcon name="user" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TAB_BAR_BACKGROUND,
    borderTopWidth: 0,
    height: 90,
    paddingBottom: 10, // Adjusted for consistent vertical alignment
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 58,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: ACTIVE_BACKGROUND,
  },
});
