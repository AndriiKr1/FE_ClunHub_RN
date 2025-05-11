
import { View, Text, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import GradientBackground, { gradientPresets } from '../../components/layout/GradientBackground';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors, spacing, typography } from '../../theme';
import { useForm } from '../../hooks/useForm';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  // Validation function
  const validateLogin = (values) => {
    const errors = {};
    
    if (!values.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!values.password?.trim()) {
      errors.password = 'Password required';
    }
    
    return errors;
  };
  
  // Use custom form hook
  const { 
    values, 
    errors, 
    handleChange, 
    validateForm, 
    setSubmitError,
    submitError 
  } = useForm({ email: '', password: '' }, validateLogin);
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await dispatch(loginUser(values)).unwrap();
      
      if (result && result.token) {
        navigation.navigate('Dashboard');
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error === 'user_not_found') {
        setSubmitError('User not found. Please check your email.');
      } else if (error === 'invalid_credentials' || 
                 (typeof error === 'string' && error.includes('Invalid email or password'))) {
        setSubmitError('Incorrect email or password. Please try again.');
      } else if (error === 'server_unreachable' || 
                 (typeof error === 'string' && error.includes('server'))) {
        setSubmitError('Server is temporarily unavailable. Please try again later.');
      } else {
        setSubmitError('Login failed. Please check your credentials and try again.');
      }
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <GradientBackground colors={gradientPresets.login}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.loginContainer}>
            <View style={styles.content}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/images/Logo2.png')} 
                  style={styles.logo}
                  resizeMode="contain" 
                />
              </View>

              {/* Login Form */}
              <View style={styles.form}>
                <Input
                  testID="email-input"
                  placeholder="E-mail"
                  value={values.email}
                  onChangeText={(value) => handleChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  error={errors.email}
                />

                <Input
                  testID="password-input"
                  placeholder="Password"
                  value={values.password}
                  onChangeText={(value) => handleChange('password', value)}
                  secureTextEntry
                  editable={!isLoading}
                  error={errors.password}
                />
                
                {/* Forgot Password */}
                <View style={styles.forgotPasswordContainer}>
                  <Text 
                    style={styles.forgotPassword}
                    onPress={handleForgotPassword}
                  >
                    I forgot my password
                  </Text>
                </View>

                {submitError ? (
                  <Text style={styles.submitError}>{submitError}</Text>
                ) : null}

                <Button
                  testID="login-btn"
                  title={isLoading ? "Logging in..." : "Log in"}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  variant="primary"
                  style={styles.submitButton}
                />
              </View>

              {/* Footer Text */}
              <View style={styles.footerTextContainer}>
                <Text style={styles.footerText}>family planner</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    alignItems: 'center',
    paddingTop: 70
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 150,
    height: 150,
  },
  form: {
    width: '100%',
    marginVertical: spacing.lg,
  },
  forgotPasswordContainer: {
    alignItems: 'flex',
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    color: colors.text.dark,
    fontSize: typography.fontSizes.md,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: colors.background.login[0],
    marginTop: spacing.md,
  },
  submitError: {
    width: '100%',
    color: colors.status.error,
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  footerTextContainer: {
    marginTop: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wide,
  },
});

export default LoginScreen;