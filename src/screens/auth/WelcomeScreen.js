import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import GradientBackground, { gradientPresets } from '../../components/layout/GradientBackground';
import Button from '../../components/common/Button';
import { colors, spacing, typography } from '../../theme';

const WelcomeScreen = ({ navigation }) => {
  const handleCreatePlanner = () => {
    navigation.navigate('Register');
  };

  const handleExistingAccount = () => {
    navigation.navigate('Login');
  };

  return (
    <GradientBackground colors={gradientPresets.welcome}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/Logo2.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Button
              title="I want to create my account"
              onPress={handleCreatePlanner}
              variant="primary"
              style={styles.button}
            />
            
            <Button
              title="I already have my account"
              onPress={handleExistingAccount}
              variant="primary"
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>family planner</Text>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  logo: {
    width: 150,
    height: 150,
  },
  buttonsContainer: {
    width: '90%',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  button: {
    backgroundColor: 'white',
    marginBottom: spacing.lg,
    width: '100%',
  },
  footerContainer: {
    marginTop: 'auto',
    marginBottom: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wide,
  },
});

export default WelcomeScreen;