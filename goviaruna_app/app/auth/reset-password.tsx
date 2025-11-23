import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';
import { BackButton } from '@/components/BackButton';

const RESET_PASSWORD_CONTENT = {
  title: 'මුරපදය යළි පිහිටුවන්න',
  subtitle: 'ඔබගේ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න, එවිට ඔබගේ මුරපදය නැවත සැකසීමට අපි ඔබට සත්‍යාපන කේතයක් එවන්නෙමු.',
  inputPlaceholder: 'දුරකථන අංකය',
  submitButton: 'ඉදිරිපත් කරන්න',
  backToLogin: 'නැවත පිවිසීමට',
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    // Navigate to the next step of the reset password flow
    router.push('/auth/reset-password-2');
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
            <Text style={styles.title}>{RESET_PASSWORD_CONTENT.title}</Text>
            <Text style={styles.subtitle}>{RESET_PASSWORD_CONTENT.subtitle}</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder={RESET_PASSWORD_CONTENT.inputPlaceholder}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
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

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
    marginBottom: 25,
  },
  submitButton: {
    backgroundColor: '#3A8A55',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
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
