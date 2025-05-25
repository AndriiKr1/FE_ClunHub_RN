import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Image, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset, resetPassword, clearPasswordResetState, verifyResetCode } from '../../store/slices/authSlice';
import GradientBackground, { gradientPresets } from '../../components/layout/GradientBackground';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors, spacing, typography, borderRadius, commonStyles } from '../../theme';
import { useForm } from '../../hooks/useForm';
import { TouchableOpacity } from 'react-native';


const ForgotPasswordScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, passwordReset } = useSelector((state) => state.auth);

  const [step, setStep] = useState('email'); // "email", "code", "password"
  const [code, setCode] = useState('');
  const [remainingTime, setRemainingTime] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const codeInputRefs = useRef([]);
  if (codeInputRefs.current.length !== 6) {
    codeInputRefs.current = Array(6).fill().map(() => React.createRef());
  }

  // Use form hook for email step
  const emailForm = useForm({ email: '' }, (values) => {
    const errors = {};
    if (!values.email?.trim()) {
      errors.email = 'Please enter an email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    return errors;
  });

  // Use form hook for password step
  const passwordForm = useForm(
    { newPassword: '', repeatPassword: '' },
    (values) => {
      const errors = {};
      
      // Password validation
      if (!values.newPassword) {
        errors.newPassword = 'Password is required';
      } else if (values.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      } else if (values.newPassword.length > 25) {
        errors.newPassword = 'Password must not exceed 25 characters';
      } else if (!/^[A-Za-z0-9!@#$%^&*()_+[\]{};':"\\|,.<>/?-]+$/.test(values.newPassword)) {
        errors.newPassword = 'Only Latin letters, numbers and symbols are allowed';
      } else if (
        !/[a-z]/.test(values.newPassword) ||
        !/[A-Z]/.test(values.newPassword) ||
        !/[0-9]/.test(values.newPassword) ||
        !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(values.newPassword)
      ) {
        errors.newPassword = 'Password must include uppercase, lowercase, number and special character';
      }
      
      // Password match validation
      if (values.newPassword !== values.repeatPassword) {
        errors.repeatPassword = 'Passwords do not match';
      }
      
      return errors;
    }
  );

  useEffect(() => {
    return () => {
      dispatch(clearPasswordResetState());
    };
  }, [dispatch]);

  useEffect(() => {
    let intervalId;
    if (step === 'code' && remainingTime > 0) {
      intervalId = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [step, remainingTime]);

  useEffect(() => {
    if (passwordReset.error) {
      if (passwordReset.error === 'code_expired') {
        setIsCodeExpired(true);
        setCode('');
        emailForm.setSubmitError('The verification code has expired. Request a new code.');
      } else if (passwordReset.error === 'invalid_token') {
        emailForm.setSubmitError('The verification code you entered is incorrect.');
      } else {
        emailForm.setSubmitError(passwordReset.error);
      }
    }
  }, [passwordReset.error]);

  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => {
        if (codeInputRefs.current[0] && codeInputRefs.current[0].current) {
          codeInputRefs.current[0].current.focus();
        }
      }, 100);
    }
  }, [step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    // Update the code
    const newCode = code.split('');
    newCode[index] = value.slice(-1);
    setCode(newCode.join(''));
    
    emailForm.setSubmitError('');
    
    // Move to next input if value exists
    if (value && index < 5) {
      codeInputRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyPress = (index, e) => {
    // For React Native, keypress events work differently
    // This function would need to be adjusted for React Native
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1].current.focus();
    }
  };

  const handleResendLink = () => {
    if (!canResend && !isCodeExpired) return;
    setIsCodeExpired(false);
    setCanResend(false);
    setRemainingTime(120);
    setCode('');
    emailForm.setSubmitError('');
    dispatch(requestPasswordReset(emailForm.values.email));
  };

  const handleSubmit = async () => {
    emailForm.setSubmitError('');
    passwordForm.setSubmitError('');
  
    if (step === 'email') {
      if (!emailForm.validateForm()) {
        return;
      }
  
      try {
        setSuccessMessage('');
       
        await dispatch(requestPasswordReset(emailForm.values.email)).unwrap();
        setSuccessMessage('Reset code sent! Please check your email.');
        setTimeout(() => {
          setStep('code');
          setSuccessMessage('');
        }, 2000);

      } catch (error) {
        if (error && error.status === 404) {
          emailForm.setSubmitError('This email is not registered in our system.');
        } else {
          emailForm.setSubmitError('Failed to send reset code. Please try again.');
        }
      }
    } else if (step === 'code') {
      if (code.length !== 6) {
        emailForm.setSubmitError('Please enter a valid 6-digit code');
        return;
      }

      // Verify the code with the server
      try {
        await dispatch(verifyResetCode({ 
          email: emailForm.values.email, 
          token: code 
        })).unwrap();
        
        // Only proceed to the next step if verification succeeded
        setStep('password');
      } catch (error) {
        // Handle specific error types
        if (error === 'invalid_token') {
          emailForm.setSubmitError('The verification code you entered is incorrect.');
        } else if (error === 'code_expired') {
          setIsCodeExpired(true);
          emailForm.setSubmitError('The verification code has expired. Please request a new code.');
        } else if (error === 'code_not_found') {
          emailForm.setSubmitError('Invalid verification code. Please check and try again.');
        } else {
          emailForm.setSubmitError(error || 'Failed to verify code. Please try again.');
        }
      }
    } else if (step === 'password') {
      if (!passwordForm.validateForm()) {
        return;
      }
      
      try {
        await dispatch(
          resetPassword({
            token: code,
            newPassword: passwordForm.values.newPassword,
            confirmPassword: passwordForm.values.repeatPassword,
            email: emailForm.values.email
          })
        ).unwrap();
        
        setSuccessMessage('Password successfully reset!');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      } catch (error) {
        // Handle password reset errors
        passwordForm.setSubmitError(error || 'Failed to reset password');
      }
    }
  };

  const renderCodeInputs = () => {
    return Array(6).fill().map((_, index) => (
      <TextInput
        key={index}
        ref={codeInputRefs.current[index]}
        style={styles.codeInputBox}
        value={code[index] || ''}
        onChangeText={(value) => handleCodeChange(index, value)}
        onKeyPress={(e) => handleKeyPress(index, e)}
        maxLength={1}
        keyboardType="number-pad"
        editable={!isLoading}
      />
    ));
  };

  return (
    <GradientBackground colors={gradientPresets.forgotPassword}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.forgotPasswordContainer}>
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/images/Logo2.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={styles.title}>
                {step === 'email' 
                  ? 'Recover password' 
                  : step === 'code' 
                    ? 'Enter the code from the email' 
                    : 'Create a new password'}
              </Text>
              
              {successMessage ? (
                <View style={styles.successMessageContainer}>
                  <Text style={styles.successMessage}>{successMessage}</Text>
                </View>
              ) : null}
              
              <View style={styles.form}>
                {step === 'email' && (
                  <>
                    <Input
                      testID="email-input"
                      value={emailForm.values.email}
                      onChangeText={(value) => emailForm.handleChange('email', value)}
                      placeholder="Enter your e-mail"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                      error={emailForm.errors.email}
                    />
                    <Text style={styles.infoText}>
                      We'll send you a link with a password reset code that will be valid for 5 minutes
                    </Text>
                  </>
                )}
                
                {step === 'code' && (
                  <>
                    <View style={styles.codeInputContainer}>
                      {renderCodeInputs()}
                    </View>
                    <View style={styles.timerContainer}>
                      {isCodeExpired ? (
                        <></>
                      ) : remainingTime === 0 ? (
                        <Text style={styles.timerText}>You can request a new link</Text>
                      ) : (
                        <Text style={styles.timerText}>
                          Wait before resending: {formatTime(remainingTime)}
                        </Text>
                      )}
                      {(canResend || isCodeExpired) && (
                        <TouchableOpacity
                          testID="resend-link-btn"
                          onPress={handleResendLink}
                          style={styles.resendButton}
                          disabled={isLoading}
                        >
                          <Text style={styles.resendButtonText}>
                            {isLoading ? 'Sending...' : 'Send a new code'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
                
                {step === 'password' && (
                  <>
                    <Input
                      testID="new-password-input"
                      value={passwordForm.values.newPassword}
                      onChangeText={(value) => passwordForm.handleChange('newPassword', value)}
                      placeholder="Create new password"
                      secureTextEntry
                      editable={!isLoading}
                      error={passwordForm.errors.newPassword}
                    />
                    <Input
                      testID="repeat-password-input"
                      value={passwordForm.values.repeatPassword}
                      onChangeText={(value) => passwordForm.handleChange('repeatPassword', value)}
                      placeholder="Repeat your new password"
                      secureTextEntry
                      editable={!isLoading}
                      error={passwordForm.errors.repeatPassword}
                    />
                  </>
                )}
                
                {(step === 'email' && emailForm.submitError) || 
                 (step === 'code' && emailForm.submitError) || 
                 (step === 'password' && passwordForm.submitError) ? (
                  <Text style={styles.error}>
                    {step === 'password' ? passwordForm.submitError : emailForm.submitError}
                  </Text>
                ) : null}
                
                <Button 
                  testID="submit-btn" 
                  title={isLoading ? 'Submitting...' : step === 'email' ? 'Send reset code' : 'Next'}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  variant="primary"
                  style={styles.submitButton}
                />
              </View>
              
              {/* Back to login link */}
            {/*   <View style={styles.backToLoginContainer}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.backToLoginLink}>
                    Back to login
                  </Text>
                </TouchableOpacity>
              </View> */}
            </View>
            
            <View style={styles.footerTextContainer}>
              <Text style={styles.footerText}>family planner</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  forgotPasswordContainer: {
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
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.normal,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.text.dark,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  form: {
    width: '100%',
    marginVertical: spacing.lg,
  },
  infoText: {
    fontSize: typography.fontSizes.sm,
    color: '#010130',
    textAlign: 'center',
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
  },
  codeInputBox: {
    width: 45,
    height: 50,
    borderRadius: borderRadius.small,
    borderWidth: 2,
    borderColor: colors.border.medium,
    backgroundColor: 'white',
    fontSize: typography.fontSizes.xl,
    textAlign: 'center',
    color: colors.text.dark,
    ...commonStyles.shadow.light,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  timerText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.dark,
    marginBottom: spacing.xs,
  },
  resendButton: {
    marginTop: spacing.xs,
  },
  resendButtonText: {
    color: '#0066cc',
    textDecorationLine: 'underline',
    fontSize: typography.fontSizes.sm,
  },
  error: {
    color: colors.status.error,
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: typography.fontWeights.medium,
  },
  successMessageContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
    padding: spacing.sm,
    borderRadius: borderRadius.large,
    marginBottom: spacing.md,
    width: '100%',
    maxWidth: 350,
  },
  successMessage: {
    color: 'white',
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#F4D77A',
  },
  backToLoginContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  backToLoginLink: {
    color: colors.text.dark,
    fontSize: typography.fontSizes.sm,
  },
  footerTextContainer: {
    marginTop: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wide,
  },
});

export default ForgotPasswordScreen;