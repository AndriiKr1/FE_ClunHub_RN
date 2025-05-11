import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../store/slices/authSlice';
import Modal from '../common/Modal';
import { colors, spacing, typography, borderRadius, commonStyles } from '../../theme';

// Import avatars
import avatar1 from '../../assets/avatars/avatar1.png';
import avatar2 from '../../assets/avatars/avatar2.png';
import avatar3 from '../../assets/avatars/avatar3.png';
import avatar4 from '../../assets/avatars/avatar4.png';
import avatar5 from '../../assets/avatars/avatar5.png';
import avatar6 from '../../assets/avatars/avatar6.png';

const avatarMap = {
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
};

const ProfileHeader = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  
  const username = user?.username || '';
  const age = user?.age || '';
  const avatarId = user?.avatarId || 'avatar1';
  const selectedAvatar = avatarMap[avatarId] || avatar1;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    // navigation.navigate('Welcome');
    setShowLogoutConfirm(false);
  };

  return (
    <View style={styles.profileHeader}>
      {user ? (
        <>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogoutClick}
          >
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>
          
          <Image 
            source={selectedAvatar} 
            style={styles.avatar} 
          />
          
          <View style={styles.userInfo}>
            <View style={styles.inputDisabled}>
              <Text style={styles.userInfoText}>{username}</Text>
            </View>
            <View style={styles.inputDisabled}>
              <Text style={styles.userInfoText}>{age}</Text>
            </View>
          </View>
          
          {/* Logout confirmation modal */}
          <Modal
            visible={showLogoutConfirm}
            title="Confirm logout"
            message="Are you sure you want to log out?"
            onClose={() => setShowLogoutConfirm(false)}
            actions={[
              { 
                title: 'Yes', 
                onPress: confirmLogout, 
                variant: 'secondary',
                style: styles.yesButton
              },
              { 
                title: 'No', 
                onPress: () => setShowLogoutConfirm(false), 
                variant: 'danger'
              }
            ]}
          />
        </>
      ) : (
        <View style={styles.noUserInfo}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
    width: '100%',
    maxWidth: 320,
    height: 150,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginRight: -8,
  },
  userInfo: {
    flexDirection: 'column',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    width: 170,
  },
  inputDisabled: {
    backgroundColor: 'white',
    borderRadius: borderRadius.large,
    padding: spacing.xs,
    height: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...commonStyles.shadow.light,
  },
  userInfoText: {
    fontSize: typography.fontSizes.md,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  logoutButton: {
    position: 'absolute',
    top: 10, 
    right: 0,
    width: 120,
    height: 40,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.accent,
    ...commonStyles.shadow.light,
  },
  logoutButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.sm,
  },
  noUserInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.accent,
  },
  loginButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.sm,
  },
  yesButton: {
    backgroundColor: colors.status.success,
  },
});

export default ProfileHeader;