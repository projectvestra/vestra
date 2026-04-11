import { Platform } from 'react-native';

export const ui = {
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  type: {
    title: 24,
    section: 17,
    body: 15,
    caption: 12,
    eyebrow: 11,
  },
  motion: {
    pressScale: 0.985,
    quick: 140,
    normal: 220,
  },
  shadow: {
    card: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.035,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 1 },
      default: {},
    }),
    elevated: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.055,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
};