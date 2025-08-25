import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';

export default function VerifyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerify = () => {
    // TODO: Implement actual verification logic
    router.push('/(tabs)');
  };

  const handleResendCode = () => {
    // TODO: Implement resend code logic
    console.log('Resending verification code...');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#2D5016', '#4A7C23']}
        style={styles.background}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText style={styles.title} type="title">
                {t('auth.verifyAccount')}
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                We've sent a verification code to your email address
              </ThemedText>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Verification Code Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.verificationCode')}
                  placeholderTextColor="#666"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textAlign="center"
                  maxLength={6}
                />
              </View>

              {/* Verify Button */}
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleVerify}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.buttonText} type="defaultSemiBold">
                  {t('auth.verify')}
                </ThemedText>
              </TouchableOpacity>

              {/* Resend Code */}
              <View style={styles.resendContainer}>
                <ThemedText style={styles.resendText}>
                  Didn't receive the code?{' '}
                </ThemedText>
                <TouchableOpacity onPress={handleResendCode}>
                  <ThemedText style={styles.resendLink}>
                    {t('auth.resendCode')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5016',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#E8F5E8',
    fontSize: 16,
  },
  resendLink: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
