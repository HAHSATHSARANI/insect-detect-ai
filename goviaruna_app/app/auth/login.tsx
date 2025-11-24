import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Text, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts, getFontStyle } from '@/constants/Fonts';
import { BackButton } from '@/components/BackButton';
import { Feather, AntDesign } from '@expo/vector-icons';
import { api } from '@/services/api';
import { useTranslation } from 'react-i18next';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  
  const [email, setEmail] = useState('mihin@gmail.com');
  const [password, setPassword] = useState('mihin1234');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.enterDetails'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.auth.login({
        email: email.toLowerCase().trim(),
        password
      });
      
      // Store user info
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      await AsyncStorage.setItem('token', result.token);
      
      console.log('Login success:', result);
      
      // Navigate to tabs
      router.replace('/(tabs)'); 
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = () => {
    router.push('/auth/register');
  };
  
  const handleForgotPassword = () => {
    router.push('/auth/reset-password');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <BackButton />
      <KeyboardAvoidingView  
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, getFontStyle('bold', 32, lang)]}>{t('auth.login')}</Text>
            <Text style={[styles.subtitle, getFontStyle('regular', 16, lang)]}>{t('auth.enterDetails')}</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, getFontStyle('regular', 16, lang)]}
              placeholder={t('auth.email')}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.inputPassword, getFontStyle('regular', 16, lang)]}
                placeholder={t('auth.password')}
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                 <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={22} color="#888" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
              <Text style={[styles.forgotPasswordText, getFontStyle('semiBold', 14, lang)]}>{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.buttonText, getFontStyle('semiBold', 18, lang)]}>{t('auth.login')}</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={[styles.orText, getFontStyle('regular', 14, lang)]}>{t('auth.or')}</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity 
            style={styles.googleButton}
            activeOpacity={0.8}
          >
            <Image source={require('@/assets/images/google.png')} style={styles.googleIcon} />
            <Text style={[styles.googleButtonText, getFontStyle('semiBold', 16, lang)]}>{t('auth.signupGoogle')}</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, getFontStyle('regular', 15, lang)]}>{t('auth.notRegistered')}</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={[styles.registerLink, getFontStyle('semiBold', 15, lang)]}>{t('auth.createAccount')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  title: {
    ...Fonts.styles.bold,
    fontSize: 32,
    color: '#222222',
    marginBottom: 8,
  },
  subtitle: {
    ...Fonts.styles.regular,
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    ...Fonts.styles.regular,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    marginBottom: 10,
  },
  inputPassword: {
    ...Fonts.styles.regular,
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 15,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    ...Fonts.styles.semiBold,
    fontSize: 14,
    color: '#3A8A55',
  },
  loginButton: {
    backgroundColor: '#3A8A55',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    ...Fonts.styles.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAEAEA',
  },
  orText: {
    ...Fonts.styles.regular,
    marginHorizontal: 15,
    fontSize: 14,
    color: '#AAAAAA',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 25, // Increased for more rounded corners
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  googleIcon: {
    width: 30, // Increased size
    height: 30, // Increased size
    marginRight: 12,
  },
  googleButtonText: {
    ...Fonts.styles.semiBold,
    fontSize: 16,
    color: '#444444',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  registerText: {
    ...Fonts.styles.regular,
    fontSize: 15,
    color: '#666666',
  },
  registerLink: {
    ...Fonts.styles.semiBold,
    fontSize: 15,
    color: '#3A8A55',
  },
});
