import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, spacing, commonStyles } from '../../theme';
import Button from './Button';

/**
 * Reusable Modal component
 * @param {boolean} visible - Whether modal is visible
 * @param {function} onClose - Function to call when modal is closed
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {array} actions - Array of action objects with title and onPress
 * @param {node} children - Modal content
 */
const Modal = ({
  visible,
  onClose,
  title,
  message,
  actions = [],
  children,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {title && <Text style={styles.title}>{title}</Text>}
          {message && <Text style={styles.message}>{message}</Text>}
          {children}
          
          {actions.length > 0 && (
            <View style={styles.actionContainer}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  title={action.title}
                  onPress={action.onPress}
                  variant={action.variant || 'primary'}
                  style={[styles.actionButton, action.style]}
                />
              ))}
            </View>
          )}
          
          {!actions.length && !children && (
            <Button
              title="OK"
              onPress={onClose}
              variant="secondary"
              style={styles.defaultButton}
            />
          )}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 350,
    alignItems: 'center',
    ...commonStyles.shadow.strong,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSizes.md,
    marginBottom: spacing.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    minWidth: 80,
  },
  defaultButton: {
    marginTop: spacing.md,
  },
});

export default Modal;