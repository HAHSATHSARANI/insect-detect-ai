import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';
import { Feather, AntDesign } from '@expo/vector-icons';

const LOGIN_CONTENT = {
  title: 'ඇතුල් වන්න',
  subtitle: 'සාදරයෙන් පිළිගනිමු! කරුණාකර ඔබගේ විස්තර ඇතුළත් කරන්න.',
  email: 'ඔබගේ විද්‍යුත් තැපෑල ඇතුළත් කරන්න',
  password: 'මුරපදය ඇතුළත් කරන්න',
  forgotPassword: 'මුරපදය අමතක වුණා ද?',
  loginButton: 'ඇතුල් වන්න',
  or: 'හෝ',
  googleButton: 'Google සමඟ ලියාපදිංචි වන්න',
  registerPrompt: 'තවම ලියාපදිංචි වී නැද්ද? ',
  registerLink: 'ගිණුමක් සාදන්න',
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = () => {
    // TODO: Implement actual login logic
    router.push('/(tabs)');
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
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{LOGIN_CONTENT.title}</Text>
            <Text style={styles.subtitle}>{LOGIN_CONTENT.subtitle}</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder={LOGIN_CONTENT.email}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder={LOGIN_CONTENT.password}
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
              <Text style={styles.forgotPasswordText}>{LOGIN_CONTENT.forgotPassword}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{LOGIN_CONTENT.loginButton}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>{LOGIN_CONTENT.or}</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity 
            style={styles.googleButton}
            activeOpacity={0.8}
          >
            <Image source={require('@/assets/images/google.png')} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>{LOGIN_CONTENT.googleButton}</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>{LOGIN_CONTENT.registerPrompt}</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>{LOGIN_CONTENT.registerLink}</Text>
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
