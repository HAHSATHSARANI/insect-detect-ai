import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';

const RESET_PASSWORD_CONTENT = {
  title: 'මුරපදය යළි පිහිටුවන්න',
  subtitle: 'ආරක්ෂක අවශ්‍යතා සපුරාලන නව මුරපදයක් ඇතුළත් කරන්න',
  newPassword: 'නව මුරපදය',
  confirmNewPassword: 'නව මුරපදයක් සකසන්න',
  submitButton: 'මුරපදය යළි පිහිටුවන්න',
  backToLogin: 'නැවත පිවිසීමට',
};

export default function ResetPasswordScreen2() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleResetPassword = () => {
    // TODO: Implement actual password update logic
    router.push('/auth/login'); // Navigate to login on success
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{RESET_PASSWORD_CONTENT.title}</Text>
            <Text style={styles.subtitle}>{RESET_PASSWORD_CONTENT.subtitle}</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder={RESET_PASSWORD_CONTENT.newPassword}
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder={RESET_PASSWORD_CONTENT.confirmNewPassword}
              placeholderTextColor="#999"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleResetPassword}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{RESET_PASSWORD_CONTENT.submitButton}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.backButton}>
            <Text style={styles.backButtonText}>{RESET_PASSWORD_CONTENT.backToLogin}</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...Fonts.styles.bold,
    fontSize: 28,
    color: '#222222',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    ...Fonts.styles.regular,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    ...Fonts.styles.regular,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#3A8A55',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    ...Fonts.styles.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  backButton: {
    alignSelf: 'center',
  },
  backButtonText: {
    ...Fonts.styles.semiBold,
    fontSize: 15,
    color: '#3A8A55',
    textDecorationLine: 'underline',
  },
});
