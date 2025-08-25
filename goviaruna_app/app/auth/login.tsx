import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Implement actual login logic
    router.push('/(tabs)');
  };

  const handleForgotPassword = () => {
    router.push('/auth/reset-password');
  };

  const handleRegister = () => {
    router.push('/auth/register');
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
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <ThemedText style={styles.title}>
                {t('auth.login')}
              </ThemedText>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.email')}
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.password')}
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <ThemedText style={styles.forgotPasswordText}>
                  {t('auth.forgotPassword')}
                </ThemedText>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.buttonText}>
                  {t('auth.login')}
                </ThemedText>
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <ThemedText style={styles.registerText}>
                  Don't have an account?{' '}
                </ThemedText>
                <TouchableOpacity onPress={handleRegister}>
                  <ThemedText style={styles.registerLink}>
                    {t('auth.register')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#E8F5E8',
    fontSize: 14,
    opacity: 0.8,
  },
  loginButton: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#E8F5E8',
    fontSize: 16,
  },
  registerLink: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
