import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { colors } from '../../theme';

/**
 * Gradient background component
 * @param {node} children - Content to display
 * @param {object} style - Additional styles
 * @param {array} colors - Gradient colors
 * @param {object} start - Start position {x, y}
 * @param {object} end - End position {x, y}
 */
const GradientBackground = ({ 
  children, 
  style, 
  colors: customColors, 
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 }
}) => {
  // Use custom colors or fall back to default
  const gradientColors = customColors || colors.background.light;
  
  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.gradient, style]}
      start={start}
      end={end}
    >
      {children}
    </LinearGradient>
  );
};

export const gradientPresets = {
  welcome: colors.background.light,
  login: colors.background.login,
  register: colors.background.register,
  dashboard: colors.background.dashboard,
  addTask: colors.background.addTask,
  calendar: colors.background.calendar,
  completedTasks: colors.background.completedTasks,
  forgotPassword: colors.background.forgotPassword
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default GradientBackground;