/**
 * Global font configuration for the Goviaruna app
 * Uses AbhayaLibre font family for consistent typography
 */

export const Fonts = {
  // Font families
  regular: 'AbhayaLibre-Regular',
  medium: 'AbhayaLibre-Medium',
  semiBold: 'AbhayaLibre-SemiBold',
  bold: 'AbhayaLibre-Bold',
  extraBold: 'AbhayaLibre-ExtraBold',
  
  // Font sizes
  sizes: {
    small: 14,
    regular: 16,
    medium: 18,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
    title: 42,
  },
  
  // Common text styles
  styles: {
    regular: {
      fontFamily: 'AbhayaLibre-Regular',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'AbhayaLibre-Medium',
      fontWeight: 'normal' as const,
    },
    semiBold: {
      fontFamily: 'AbhayaLibre-SemiBold',
      fontWeight: 'normal' as const,
    },
    bold: {
      fontFamily: 'AbhayaLibre-Bold',
      fontWeight: 'normal' as const,
    },
    extraBold: {
      fontFamily: 'AbhayaLibre-ExtraBold',
      fontWeight: 'normal' as const,
    },
  }
};

/**
 * Get font style based on weight
 * @param weight Font weight
 * @param fontSize Optional font size
 * @returns Font style object
 */
export const getFontStyle = (
  weight: 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold' = 'regular',
  fontSize?: number
) => ({
  ...Fonts.styles[weight],
  ...(fontSize && { fontSize }),
});

/**
 * Common text style presets
 */
export const TextStyles = {
  title: {
    ...Fonts.styles.bold,
    fontSize: Fonts.sizes.title,
  },
  subtitle: {
    ...Fonts.styles.semiBold,
    fontSize: Fonts.sizes.large,
  },
  heading: {
    ...Fonts.styles.semiBold,
    fontSize: Fonts.sizes.xlarge,
  },
  body: {
    ...Fonts.styles.regular,
    fontSize: Fonts.sizes.regular,
  },
  caption: {
    ...Fonts.styles.regular,
    fontSize: Fonts.sizes.small,
  },
  button: {
    ...Fonts.styles.semiBold,
    fontSize: Fonts.sizes.medium,
  },
};
