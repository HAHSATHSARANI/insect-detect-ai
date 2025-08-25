import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { getFontStyle } from '@/utils/fontUtils';
import { Fonts, TextStyles } from '@/constants/Fonts';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  forceAbhaya?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  forceAbhaya = false,
  children,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  // Get appropriate font for Sinhala text based on type
  const textContent = typeof children === 'string' ? children : '';
  let fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' = 'normal';
  
  switch (type) {
    case 'title':
      fontWeight = 'bold';
      break;
    case 'subtitle':
      fontWeight = 'semibold';
      break;
    case 'defaultSemiBold':
      fontWeight = 'semibold';
      break;
    case 'link':
      fontWeight = 'medium';
      break;
    default:
      fontWeight = 'normal';
  }
  
  // Use global font styles or Sinhala-specific fonts
  const fontStyle = forceAbhaya || getFontStyle(textContent, fontWeight, forceAbhaya).fontFamily
    ? getFontStyle(textContent, fontWeight, forceAbhaya)
    : Fonts.styles.regular; // Default to AbhayaLibre-Regular

  return (
    <Text
      style={[
        { color },
        fontStyle, // Apply AbhayaLibre font by default
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
