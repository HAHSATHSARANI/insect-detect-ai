/**
 * Utility functions for handling Sinhala fonts and text detection
 */

// Sinhala Unicode range: U+0D80–U+0DFF
const SINHALA_UNICODE_RANGE = /[\u0D80-\u0DFF]/;

/**
 * Check if text contains Sinhala characters
 * @param text - The text to check
 * @returns true if text contains Sinhala characters
 */
export const containsSinhala = (text: string): boolean => {
  if (!text) return false;
  return SINHALA_UNICODE_RANGE.test(text);
};

/**
 * Get appropriate font family based on text content and weight
 * @param text - The text content
 * @param weight - Font weight ('normal', 'medium', 'semibold', 'bold', 'extrabold')
 * @param forceAbhaya - Force Abhaya font even for mixed/English text
 * @returns Font family name
 */
export const getFontFamily = (text: string, weight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' = 'normal', forceAbhaya: boolean = false): string | undefined => {
  // If text contains Sinhala characters OR if we want to force Abhaya font
  if (containsSinhala(text) || forceAbhaya) {
    switch (weight) {
      case 'medium':
        return 'AbhayaLibre-Medium';
      case 'semibold':
        return 'AbhayaLibre-SemiBold';
      case 'bold':
        return 'AbhayaLibre-Bold';
      case 'extrabold':
        return 'AbhayaLibre-ExtraBold';
      default:
        return 'AbhayaLibre-Regular';
    }
  }
  
  // Default system fonts for English text
  return undefined; // Let React Native use default system font
};

/**
 * Get font style object for React Native components
 * @param text - The text content
 * @param weight - Font weight
 * @param forceAbhaya - Force Abhaya font even for mixed/English text
 * @returns Style object with fontFamily
 */
export const getFontStyle = (text: string, weight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' = 'normal', forceAbhaya: boolean = false) => {
  const fontFamily = getFontFamily(text, weight, forceAbhaya);
  return fontFamily ? { fontFamily } : {};
};
