import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BackButtonProps {
  color?: string;
  style?: ViewStyle;
}

export const BackButton = ({ color = '#222', style }: BackButtonProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity 
      onPress={() => router.back()} 
      style={[
        styles.container, 
        { top: insets.top + 10 },
        style
      ]}
      activeOpacity={0.7}
    >
      <Feather name="arrow-left" size={24} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    zIndex: 999,
    padding: 8,
  },
});

