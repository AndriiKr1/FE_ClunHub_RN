import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  Modal as RNModal, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  StyleSheet
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import GradientBackground, { gradientPresets } from '../../components/layout/GradientBackground';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors, spacing, typography, borderRadius, commonStyles } from '../../theme';
import { useForm } from '../../hooks/useForm';
import TouchableOpacity from 'react-native/Libraries/Components/Touchable/TouchableOpacity';

// Import avatars
import avatar1 from '../../assets/avatars/avatar1.png';
import avatar2 from '../../assets/avatars/avatar2.png';
import avatar3 from '../../assets/avatars/avatar3.png';
import avatar4 from '../../assets/avatars/avatar4.png';
import avatar5 from '../../assets/avatars/avatar5.png';
import avatar6 from '../../assets/avatars/avatar6.png';

const avatarOptions = [
  { id: 'avatar1', image: avatar1 },
  { id: 'avatar2', image: avatar2 },
  { id: 'avatar3', image: avatar3 },
  { id: 'avatar4', image: avatar4 },
  { id: 'avatar5', image: avatar5 },
  { id: 'avatar6', image: avatar6 },
];

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Validation function
  const validateRegistration = (values) => {
    const errors = {};
    
    if (!values.username?.trim()) {
      errors.username = 'Username is required';
    } else if (values.username.trim().length < 2) {
      errors.username = 'Username should have at least 2 symbols';
    } else if (values.username.trim().length > 15) {
      errors.username = "Username can't be more than 15 symbols";
    }
    
    if (!values.age?.trim()) {
      errors.age = 'Age is required';
    } else {
      const ageValue = parseInt(values.age);
      if (isNaN(ageValue) || ageValue < 5 || ageValue > 100) {
        errors.age = 'Age must be between 5 and 100';
      }
    }
    
    if (!values.avatar) {
      errors.avatar = 'Please choose an avatar';
    }
    
    if (!values.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!values.password?.trim()) {
      errors.password = 'Password is required';
    } else if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (values.password.length > 25) {
      errors.password = 'Password must not exceed 25 characters';
    } else if (!/^[A-Za-z0-9!@#$%^&*()_+[\]{};':"\\|,.<>/?-]+$/.test(values.password)) {
      errors.password = 'Only Latin letters, numbers and symbols are allowed';
    } else if (
      !/[a-z]/.test(values.password) ||
      !/[A-Z]/.test(values.password) ||
      !/[0-9]/.test(values.password) ||
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(values.password)
    ) {
      errors.password = 'Password must include uppercase, lowercase, number and special character';
    }
    
    return errors;
  };
  
  // Use custom form hook
  const { 
    values, 
    errors, 
    handleChange, 
    validateForm, 
    setFieldValue,
    submitError,
    setSubmitError
  } = useForm(
    { username: '', age: '', avatar: '', email: '', password: '' }, 
    validateRegistration
  );
  
  const handleAvatarSelect = (avatarId) => {
    setFieldValue('avatar', avatarId);
    setShowAvatarModal(false);
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      await dispatch(registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
        age: values.age,
        avatar: values.avatar,
      })).unwrap();
      
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (typeof error === 'string' && error.includes('already exists')) {
        setSubmitError('User with this email already exists');
      } else if (typeof error === 'string' && error.includes('Validation failed')) {
        setSubmitError(error);
      } else {
        setSubmitError(error || 'Registration failed. Please try again.');
      }
    }
  };
  
  return (
    <GradientBackground colors={gradientPresets.register}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.registerContainer}>
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/images/Logo2.png')} 
                  style={styles.logo} 
                  resizeMode="contain"
                />
              </View>
              
              <View style={styles.form}>
                <Input
                  testID="username-input"
                  placeholder="Username"
                  value={values.username}
                  onChangeText={(value) => handleChange('username', value)}
                  editable={!isLoading}
                  error={errors.username}
                />
                
                <Input
                  testID="age-input"
                  placeholder="Age"
                  value={values.age}
                  onChangeText={(value) => handleChange('age', value)}
                  keyboardType="number-pad"
                  editable={!isLoading}
                  error={errors.age}
                />
                
                <TouchableOpacity
                  testID="avatar-selector"
                  style={styles.avatarSelector}
                  onPress={() => setShowAvatarModal(true)}
                  disabled={isLoading}
                >
                  {values.avatar ? (
                    <View style={styles.avatarSelectorContent}>
                      <Text style={styles.avatarSelectorText}>Avatar selected</Text>
                      <View style={styles.avatarPreviewContainer}>
                        <Image
                          source={
                            avatarOptions.find((a) => a.id === values.avatar)
                              ?.image
                          }
                          style={styles.avatarPreview}
                        />
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.avatarSelectorText}>Choose your avatar...</Text>
                  )}
                </TouchableOpacity>
                {errors.avatar && (
                  <Text style={styles.error}>{errors.avatar}</Text>
                )}
                
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
                
                {submitError ? (
                  <Text style={styles.submitError}>{submitError}</Text>
                ) : null}
                
                <Button
                  testID="register-submit-btn"
                  title={isLoading ? "Creating..." : "Create Account"}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  variant="secondary"
                  style={styles.submitButton}
                />
              </View>
              
              <View style={styles.footerTextContainer}>
                <Text style={styles.footerText}>family planner</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Avatar modal */}
        <RNModal
          visible={showAvatarModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAvatarModal(false)}
        >
          <View style={styles.avatarModalOverlay}>
            <View style={styles.avatarModal}>
              <Text style={styles.modalTitle}>Choose your avatar</Text>
              <FlatList
                data={avatarOptions}
                numColumns={3}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.avatarImageContainer,
                      values.avatar === item.id && styles.selectedAvatarContainer
                    ]}
                    onPress={() => handleAvatarSelect(item.id)}
                  >
                    <Image
                      source={item.image}
                      style={styles.avatarImage}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.avatarGrid}
              />
              <Button
                testID="avatar-cancel-btn"
                title="Cancel"
                onPress={() => setShowAvatarModal(false)}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          </View>
        </RNModal>
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
  registerContainer: {
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
  avatarSelector: {
    width: '100%',
    height: 50,
    borderRadius: borderRadius.round,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    ...commonStyles.shadow.light,
    marginBottom: spacing.md,
  },
  avatarSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarSelectorText: {
    fontSize: typography.fontSizes.md,
    color: '#aaa',
    fontStyle: 'italic',
  },
  avatarPreviewContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  error: {
    color: colors.status.error,
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: colors.background.register[0],
    marginTop: spacing.md,
  },
  submitError: {
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
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wide,
  },
  avatarModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  avatarModal: {
    backgroundColor: 'white',
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.normal,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  avatarImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 35,
    margin: 7,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedAvatarContainer: {
    borderColor: colors.text.primary,
    ...commonStyles.shadow.medium,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cancelButton: {
    backgroundColor: colors.accent,
    marginTop: spacing.md,
  },
});

export default RegisterScreen;