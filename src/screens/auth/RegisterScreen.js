import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Modal as RNModal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../store/slices/authSlice";
import GradientBackground, {
  gradientPresets,
} from "../../components/layout/GradientBackground";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  commonStyles,
} from "../../theme";
import { useForm } from "../../hooks/useForm";

// Import avatars
import avatar1 from "../../assets/avatars/avatar1.png";
import avatar2 from "../../assets/avatars/avatar2.png";
import avatar3 from "../../assets/avatars/avatar3.png";
import avatar4 from "../../assets/avatars/avatar4.png";
import avatar5 from "../../assets/avatars/avatar5.png";
import avatar6 from "../../assets/avatars/avatar6.png";

const avatarOptions = [
  { id: "avatar1", image: avatar1 },
  { id: "avatar2", image: avatar2 },
  { id: "avatar3", image: avatar3 },
  { id: "avatar4", image: avatar4 },
  { id: "avatar5", image: avatar5 },
  { id: "avatar6", image: avatar6 },
];

import FamilyIcon from '../../assets/images/Family.png';
import UserIcon from '../../assets/images/User.png';

const roleOptions = [
  { id: "admin", name: "Create Family (Admin)", icon: FamilyIcon },
  { id: "user", name: "Join Family (User)", icon: UserIcon },
];

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  
  // Modal states
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showFamilyNameModal, setShowFamilyNameModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [showGeneratedCodeModal, setShowGeneratedCodeModal] = useState(false);
  
  // Form states
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [generatedInviteCode, setGeneratedInviteCode] = useState("");
  const [showFamilyRoles, setShowFamilyRoles] = useState(false);

  // Validation function
  const validateRegistration = (values) => {
    const errors = {};

    if (!values.username?.trim()) {
      errors.username = "Username is required";
    } else if (values.username.trim().length < 2) {
      errors.username = "Username should have at least 2 symbols";
    } else if (values.username.trim().length > 15) {
      errors.username = "Username can't be more than 15 symbols";
    }

    if (!values.age?.trim()) {
      errors.age = "Age is required";
    } else {
      const ageValue = parseInt(values.age);
      if (isNaN(ageValue) || ageValue < 5 || ageValue > 100) {
        errors.age = "Age must be between 5 and 100";
      }
    }

    if (!values.avatar) {
      errors.avatar = "Please choose an avatar";
    }

    if (!values.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!values.password?.trim()) {
      errors.password = "Password is required";
    } else if (values.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (values.password.length > 25) {
      errors.password = "Password must not exceed 25 characters";
    }

    if (!values.role) {
      errors.role = "Please choose your role";
    }

    return errors;
  };

  const {
    values,
    errors,
    handleChange,
    validateForm,
    setFieldValue,
    submitError,
    setSubmitError,
  } = useForm(
    { username: "", age: "", avatar: "", email: "", password: "", role: "" },
    validateRegistration
  );

  const handleAvatarSelect = (avatarId) => {
    setFieldValue("avatar", avatarId);
    setShowAvatarModal(false);
  };

  const handleRoleSelect = (roleId) => {
    setFieldValue("role", roleId);
    setShowRoleModal(false);
    setShowFamilyRoles(false);

    if (roleId === "admin") {
      // Показуємо модальне вікно створення сім'ї
      setShowGeneratedCodeModal(true);
    } else if (roleId === "user") {
      setShowInviteCodeModal(true);
    }
  };

  const generateInviteCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleCreateInviteCode = () => {
    if (!familyName.trim()) {
      Alert.alert("Error", "Please enter a family name");
      return;
    }
    
    // Генеруємо новий код
    const code = generateInviteCode();
    setGeneratedInviteCode(code);
  };

  const handleInviteCodeSubmit = () => {
    if (!inviteCode.trim() || inviteCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-character invite code");
      return;
    }

    setShowInviteCodeModal(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const registrationData = {
        username: values.username,
        email: values.email,
        password: values.password,
        age: values.age,
        avatar: values.avatar,
        role: values.role,
      };

      if (values.role === "admin") {
        registrationData.familyName = familyName;
        registrationData.inviteCode = generatedInviteCode;
      } else if (values.role === "user") {
        registrationData.inviteCode = inviteCode;
      }

      await dispatch(registerUser(registrationData)).unwrap();
      navigation.navigate("Dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError(error || "Registration failed. Please try again.");
    }
  };

  return (
    <GradientBackground colors={gradientPresets.register}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                  source={require("../../assets/images/Logo2.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.form}>
                <Input
                  testID="username-input"
                  placeholder="Username"
                  value={values.username}
                  onChangeText={(value) => handleChange("username", value)}
                  editable={!isLoading}
                  error={errors.username}
                />

                <Input
                  testID="age-input"
                  placeholder="Age"
                  value={values.age}
                  onChangeText={(value) => handleChange("age", value)}
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
                      <Text style={styles.avatarSelectorTextSelected}>
                        Avatar selected
                      </Text>
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
                    <Text style={styles.avatarSelectorText}>
                      Choose your avatar...
                    </Text>
                  )}
                </TouchableOpacity>
                {errors.avatar && (
                  <Text style={styles.error}>{errors.avatar}</Text>
                )}

                <TouchableOpacity
                  testID="role-selector"
                  style={styles.roleSelector}
                  onPress={() => setShowRoleModal(true)}
                  disabled={isLoading}
                >
                  {values.role ? (
                    <View style={styles.roleSelectorContent}>
                      <View style={styles.roleIconContainer}>
                        <Image
                          source={roleOptions.find((r) => r.id === values.role)?.icon}
                          style={styles.roleIconImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.roleSelectorTextSelected}>
                          {roleOptions.find((r) => r.id === values.role)?.name}
                        </Text>
                      </View>
                      <Text style={styles.dropdownArrow}>▼</Text>
                    </View>
                  ) : (
                    <View style={styles.roleSelectorContent}>
                      <Text style={styles.roleSelectorText}>
                        Choose your role...
                      </Text>
                      <Text style={styles.dropdownArrow}>▼</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {errors.role && <Text style={styles.error}>{errors.role}</Text>}

                <Input
                  testID="email-input"
                  placeholder="E-mail"
                  value={values.email}
                  onChangeText={(value) => handleChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  error={errors.email}
                />

                <Input
                  testID="password-input"
                  placeholder="Password"
                  value={values.password}
                  onChangeText={(value) => handleChange("password", value)}
                  secureTextEntry
                  editable={!isLoading}
                  error={errors.password}
                />

                {submitError && (
                  <Text style={styles.submitError}>{submitError}</Text>
                )}

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

        {/* Avatar Modal */}
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
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.avatarImageContainer,
                      values.avatar === item.id && styles.selectedAvatarContainer,
                    ]}
                    onPress={() => handleAvatarSelect(item.id)}
                  >
                    <Image source={item.image} style={styles.avatarImage} />
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

        {/* Role Selection Modal */}
        <RNModal
          visible={showRoleModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRoleModal(false)}
        >
          <View style={styles.roleModalOverlay}>
            <View style={styles.roleModalContent}>
              <Text style={styles.roleModalTitle}>Choose your role</Text>
              
              <View style={styles.roleModalButtons}>
                <TouchableOpacity 
                  style={styles.adminButton}
                  onPress={() => handleRoleSelect('admin')}
                >
                  <Image source={FamilyIcon} style={styles.roleButtonIcon} />
                  <Text style={styles.adminButtonText}>Create Family (Admin)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.userButton}
                  onPress={() => setShowFamilyRoles(!showFamilyRoles)}
                >
                  <Image source={UserIcon} style={styles.roleButtonIcon} />
                  <Text style={styles.userButtonText}>Join Family (User)</Text>
                  <Text style={styles.userDropdownArrow}>▼</Text>
                  
                  {showFamilyRoles && (
                    <View style={styles.userDropdownMenu}>
                      {['Father', 'Mother', 'Daughter', 'Son', 'Grandma', 'Grandpa'].map((role, index) => (
                        <TouchableOpacity 
                          key={index} 
                          onPress={() => handleRoleSelect('user')}
                          style={styles.userDropdownItem}
                        >
                          <Text style={styles.userDropdownText}>{role}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.roleModalCancelButton}
                onPress={() => setShowRoleModal(false)}
              >
                <Text style={styles.roleModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <Text style={styles.roleModalFooter}>family planner</Text>
            </View>
          </View>
        </RNModal>

        {/* Create Family Modal - все в одному вікні */}
        <RNModal
          visible={showGeneratedCodeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowGeneratedCodeModal(false)}
        >
          <View style={styles.codeModalOverlay}>
            <View style={styles.codeModalContent}>
              <Text style={styles.codeModalTitle}>Create Family</Text>
              
              <Text style={styles.codeModalLabel}>family name</Text>
              <TextInput
                style={styles.codeModalInput}
                placeholder="Create Family Name"
                value={familyName}
                onChangeText={setFamilyName}
              />
              
              <TouchableOpacity 
                style={styles.codeModalCreateButton}
                onPress={handleCreateInviteCode}
              >
                <Text style={styles.codeModalCreateButtonText}>Create invite code</Text>
              </TouchableOpacity>
              
              {generatedInviteCode ? (
                <>
                  <Text style={styles.codeModalInviteLabel}>invite code</Text>
                  <View style={styles.codeModalInviteRow}>
                    <View style={styles.codeModalInviteCodeContainer}>
                      <Text style={styles.codeModalInviteDisplay}>{generatedInviteCode}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.codeModalCopyButton}
                      onPress={() => Alert.alert('Copied!', `Code ${generatedInviteCode} copied to clipboard`)}
                    >
                      <Text style={styles.codeModalCopyText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.codeModalOkButton}
                    onPress={() => setShowGeneratedCodeModal(false)}
                  >
                    <Text style={styles.codeModalOkText}>OK</Text>
                  </TouchableOpacity>
                </>
              ) : null}
          
            </View>
          </View>
        </RNModal>

        {/* Invite Code Modal */}
        <Modal
          visible={showInviteCodeModal}
          title="Join Family"
          onClose={() => setShowInviteCodeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Enter invite code:</Text>
            <Input
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="6-character code"
              maxLength={6}
              autoCapitalize="characters"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowInviteCodeModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Join"
                onPress={handleInviteCodeSubmit}
                variant="secondary"
                style={styles.modalButton}
              />
            </View>
          </View>
        </Modal>
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
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    padding: spacing.lg,
    alignItems: "center",
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    width: 150,
    height: 150,
  },
  form: {
    width: "100%",
    marginVertical: spacing.lg,
  },
  avatarSelector: {
    width: "100%",
    height: 50,
    borderRadius: borderRadius.round,
    backgroundColor: "white",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    ...commonStyles.shadow.light,
    marginBottom: spacing.md,
  },
  avatarSelectorContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarSelectorText: {
    fontSize: typography.fontSizes.md,
    color: "#aaa",
    fontStyle: "italic",
  },
  avatarSelectorTextSelected: {
    fontSize: typography.fontSizes.md,
    color: colors.text.dark,
  },
  avatarPreviewContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  avatarPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  roleSelector: {
    width: "100%",
    height: 50,
    borderRadius: borderRadius.round,
    backgroundColor: "white",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    ...commonStyles.shadow.light,
    marginBottom: spacing.md,
  },
  roleSelectorContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleSelectorText: {
    fontSize: typography.fontSizes.md,
    color: "#aaa",
    fontStyle: "italic",
  },
  roleSelectorTextSelected: {
    fontSize: typography.fontSizes.md,
    color: colors.text.dark,
  },
  dropdownArrow: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  roleIconImage: {
    width: 24,
    height: 24,
    marginRight: spacing.sm,
  },
  error: {
    color: colors.status.error,
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: colors.background.register[0],
    marginTop: spacing.md,
  },
  submitError: {
    color: colors.status.error,
    fontSize: typography.fontSizes.sm,
    textAlign: "center",
    marginVertical: spacing.sm,
  },
  footerTextContainer: {
    marginTop: spacing.xl,
    width: "100%",
    alignItems: "center",
  },
  footerText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wide,
  },
  avatarModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  avatarModal: {
    backgroundColor: "white",
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.normal,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  avatarImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 35,
    margin: 7,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  selectedAvatarContainer: {
    borderColor: colors.text.primary,
    ...commonStyles.shadow.medium,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cancelButton: {
    backgroundColor: colors.accent,
    marginTop: spacing.md,
  },
  modalContent: {
    width: "100%",
    alignItems: "center",
  },
  modalLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text.dark,
    marginBottom: spacing.md,
  },
  modalInput: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  // Стилі для модальних вікон
  roleModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  roleModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  roleModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#01578F',
    marginBottom: 25,
    textAlign: 'center',
  },
  roleModalButtons: {
    width: '100%',
    marginBottom: 25,
  },
  adminButton: {
    backgroundColor: '#B986F8',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  userButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  adminButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userButtonText: {
    color: '#01578F',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  userDropdownArrow: {
    fontSize: 14,
    color: '#01578F',
    marginLeft: 10,
  },
  userDropdownMenu: {
    position: 'absolute',
    top: 55,
    right: 15,
    backgroundColor: '#B986F8',
    borderRadius: 12,
    padding: 8,
    minWidth: 90,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  userDropdownItem: {
    paddingVertical: 4,
  },
  userDropdownText: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
  },
  roleModalCancelButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  roleModalCancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  roleModalFooter: {
    fontSize: 14,
    color: '#645270',
  },
  
  // Стилі для модалу коду
  codeModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  codeModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  codeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#01578F',
    marginBottom: 15,
    textAlign: 'center',
  },
  codeModalLabel: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  codeModalInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: '100%',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  codeModalCreateButton: {
    backgroundColor: '#77E278',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  codeModalCreateButtonText: {
    color: '#01578F',
    fontSize: 14,
    fontWeight: '600',
  },
  codeModalInviteLabel: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  codeModalInviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    gap: 10,
  },
  codeModalInviteCodeContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  codeModalInviteDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#01578F',
    letterSpacing: 2,
  },
  codeModalCopyButton: {
    backgroundColor: '#FFE380',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  codeModalCopyText: {
    color: '#01578F',
    fontSize: 12,
    fontWeight: '600',
  },
  codeModalOkLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  codeModalOkButton: {
    backgroundColor: '#D4FC79',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  codeModalOkText: {
    color: '#01578F',
    fontSize: 14,
    fontWeight: '600',
  },
  codeModalFooter: {
    fontSize: 14,
    color: '#645270',
  },
});

export default RegisterScreen;