import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { getFontStyle } from '@/utils/fontUtils';

export interface SinhalaTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  [key: string]: any; // Allow other Text props
}

/**
 * Text component that automatically applies Sinhala fonts when needed
 */
export function SinhalaText({ 
  children, 
  style, 
  weight = 'normal',
  ...props 
}: SinhalaTextProps) {
  const textContent = typeof children === 'string' ? children : '';
  const fontStyle = getFontStyle(textContent, weight);
  
  return (
    <Text 
      style={[fontStyle, style]} 
      {...props}
    >
      {children}
    </Text>
  );
}
