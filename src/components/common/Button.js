import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, spacing, commonStyles } from '../../theme';

/**
 * Reusable Button component
 * @param {string} title - Button text
 * @param {function} onPress - Function to call when button is pressed
 * @param {string} variant - 'primary', 'secondary', 'accent', 'danger', or 'outline'
 * @param {string} size - 'small', 'medium', or 'large'
 * @param {boolean} disabled - Whether button is disabled
 * @param {object} style - Additional styles for the button
 * @param {object} textStyle - Additional styles for the button text
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        commonStyles.shadow.medium,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Variants
  primary: {
    backgroundColor: colors.background.login[0],
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  danger: {
    backgroundColor: colors.status.error,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  // Sizes
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  // Text styles
  text: {
    fontWeight: typography.fontWeights.medium,
    letterSpacing: typography.letterSpacing.wide,
  },
  primaryText: {
    color: colors.text.primary,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  accentText: {
    color: colors.text.primary,
  },
  dangerText: {
    color: colors.text.light,
  },
  outlineText: {
    color: colors.text.primary,
  },
  // Text sizes
  smallText: {
    fontSize: typography.fontSizes.sm,
  },
  mediumText: {
    fontSize: typography.fontSizes.md,
  },
  largeText: {
    fontSize: typography.fontSizes.lg,
  },
  // Disabled state
  disabled: {
    opacity: 0.6,
  },
});

export default Button;