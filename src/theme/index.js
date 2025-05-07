import { colors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography } from './typography';

export { colors, spacing, borderRadius, typography };

// Common styles that can be shared across components
export const commonStyles = {
  shadow: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3
    },
    strong: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5
    }
  },
  
  container: {
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    safeArea: {
      flex: 1,
      paddingHorizontal: spacing.md
    }
  }
};