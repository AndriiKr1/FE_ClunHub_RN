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
import { TouchableOpacity } from 'react-native';


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
// Role options - simplified
const roleOptions = [
  { id: "admin", name: "Create Family (Admin)", icon: FamilyIcon },
  { id: "user", name: "Join Family (User)", icon: UserIcon },
];

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showFamilyNameModal, setShowFamilyNameModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [showGeneratedCodeModal, setShowGeneratedCodeModal] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [generatedInviteCode, setGeneratedInviteCode] = useState("");

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
    } else if (
      !/^[A-Za-z0-9!@#$%^&*()_+[\]{};':"\\|,.<>/?-]+$/.test(values.password)
    ) {
      errors.password = "Only Latin letters, numbers and symbols are allowed";
    } else if (
      !/[a-z]/.test(values.password) ||
      !/[A-Z]/.test(values.password) ||
      !/[0-9]/.test(values.password) ||
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(values.password)
    ) {
      errors.password =
        "Password must include uppercase, lowercase, number and special character";
    }

    if (!values.role) {
      errors.role = "Please choose your role";
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

    // Show appropriate modal based on role
    if (roleId === "admin") {
      setShowFamilyNameModal(true);
    } else if (roleId === "user") {
      setShowInviteCodeModal(true);
    }
  };

  const generateInviteCode = () => {
    // Generate a random 6-character code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleFamilyNameSubmit = () => {
    if (!familyName.trim()) {
      Alert.alert("Error", "Please enter a family name");
      return;
    }

    // Generate invite code
    const code = generateInviteCode();
    setGeneratedInviteCode(code);
    setShowFamilyNameModal(false);
    setShowGeneratedCodeModal(true);
  };

  const handleInviteCodeSubmit = () => {
    if (!inviteCode.trim() || inviteCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-character invite code");
      return;
    }

    // Close modal and proceed with registration
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

      // Add family-specific data based on role
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

      if (typeof error === "string" && error.includes("already exists")) {
        setSubmitError("User with this email already exists");
      } else if (
        typeof error === "string" &&
        error.includes("Validation failed")
      ) {
        setSubmitError(error);
      } else {
        setSubmitError(error || "Registration failed. Please try again.");
      }
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
                      <Text style={styles.avatarSelectorText}>
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

                {/* Role Selector */}
                <TouchableOpacity
                  testID="role-selector"
                  style={styles.roleSelector}
                  onPress={() => setShowRoleModal(true)}
                  disabled={isLoading}
                >
                  {values.role ? (
                    <View style={styles.roleSelectorContent}>
                   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Image
    source={roleOptions.find((r) => r.id === values.role)?.icon}
    style={styles.roleIconImage}
    resizeMode="contain"
  />
  <Text style={styles.roleSelectorText}>
    {roleOptions.find((r) => r.id === values.role)?.name}
  </Text>
</View>

                      <Text style={styles.dropdownArrow}>▼</Text>
                    </View>
                  ) : (
                    <View style={styles.roleSelectorContent}>
                      <Text style={styles.roleSelectorPlaceholder}>
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
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.avatarImageContainer,
                      values.avatar === item.id &&
                        styles.selectedAvatarContainer,
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

        {/* Role modal */}
        <RNModal
          visible={showRoleModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRoleModal(false)}
        >
          <View style={styles.roleModalOverlay}>
            <View style={styles.roleModal}>
              <Text style={styles.modalTitle}>Choose your role</Text>
              <View style={styles.roleList}>
                {roleOptions.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    testID={`role-option-${role.id}`}
                    style={[
                      styles.roleOption,
                      values.role === role.id && styles.selectedRoleOption,
                    ]}
                    onPress={() => handleRoleSelect(role.id)}
                  >
                    <Image source={role.icon} style={styles.roleIconImage} resizeMode="contain" />
                    <Text
                      style={[
                        styles.roleName,
                        values.role === role.id && styles.selectedRoleName,
                      ]}
                    >
                      {role.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button
                testID="role-cancel-btn"
                title="Cancel"
                onPress={() => setShowRoleModal(false)}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          </View>
        </RNModal>

        {/* Family Name Modal (for Admin) */}
        <Modal
          visible={showFamilyNameModal}
          title="Create Family"
          onClose={() => setShowFamilyNameModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Enter family name:</Text>
            <Input
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="Family name"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowFamilyNameModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="OK"
                onPress={handleFamilyNameSubmit}
                variant="secondary"
                style={styles.modalButton}
              />
            </View>
          </View>
        </Modal>

        {/* Generated Invite Code Modal */}
        <Modal
          visible={showGeneratedCodeModal}
          title="Family Created!"
          onClose={() => setShowGeneratedCodeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Your family invite code:</Text>
            <View style={styles.inviteCodeBox}>
              <Text style={styles.inviteCodeText}>{generatedInviteCode}</Text>
            </View>
            <Text style={styles.modalHint}>
              Share this code with family members to let them join
            </Text>
            <Button
              title="Continue"
              onPress={() => setShowGeneratedCodeModal(false)}
              variant="secondary"
              style={styles.continueButton}
            />
          </View>
        </Modal>

        {/* Enter Invite Code Modal (for User) */}
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
  roleSelectorText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.dark,
  },
  roleSelectorPlaceholder: {
    fontSize: typography.fontSizes.md,
    color: "#aaa",
    fontStyle: "italic",
  },
  dropdownArrow: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
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
  roleModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  roleModal: {
    backgroundColor: "white",
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
  },
  roleList: {
    width: "100%",
    marginVertical: spacing.sm,
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.xs,
    backgroundColor: "#f5f5f5",
  },
  selectedRoleOption: {
    backgroundColor: colors.accent,
    ...commonStyles.shadow.light,
  },
  roleIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  roleName: {
    fontSize: typography.fontSizes.md,
    color: colors.text.dark,
  },
  selectedRoleName: {
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
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
  inviteCodeBox: {
    backgroundColor: "#f0f0f0",
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  inviteCodeText: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    letterSpacing: 4,
  },
  modalHint: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  continueButton: {
    width: "100%",
  },
  roleIconImage: {
  width: 24,
  height: 24,
  marginRight: spacing.md,
},
});

export default RegisterScreen;
