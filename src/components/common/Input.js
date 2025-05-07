import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, spacing, commonStyles } from '../../theme';

/**
 * Reusable Input component
 * @param {string} value - Input value
 * @param {function} onChangeText - Function to call when text changes
 * @param {string} placeholder - Placeholder text
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {boolean} secureTextEntry - Whether input should hide text
 * @param {string} keyboardType - Keyboard type
 * @param {object} style - Additional styles for the input
 * @param {object} containerStyle - Additional styles for the container
 * @param {boolean} editable - Whether input is editable
 */
const Input = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  style,
  containerStyle,
  editable = true,
  ...rest
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    marginBottom: spacing.xs,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  input: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: 'white',
    fontSize: typography.fontSizes.md,
    color: colors.text.dark,
    ...commonStyles.shadow.light,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: colors.text.secondary,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
});

export default Input;