import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const Navigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkToken = async () => {
      try {
        await AsyncStorage.getItem('token');
      } catch (error) {
        console.error('Failed to check authentication status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkToken();
  }, []);
  
  if (isLoading) {
    // Could add a splash screen component here
    return null;
  }
  
  return (
    <NavigationContainer>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default Navigation;