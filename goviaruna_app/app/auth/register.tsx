import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons'; 

const REGISTER_CONTENT = {
  title: 'ලියාපදිංචි වන්න',
  subtitle: 'කරුණාකර ලියාපදිංචි වීමට විස්තර ඇතුළත් කරන්න',
  name: 'නම',
  district: 'දිස්ත්‍රික්කය',
  landSize: 'බිම් ප්‍රමාණය (පර්චස්)*',
  email: 'විද්‍යුත් තැපෑල',
  password: 'මුරපදය',
  confirmPassword: 'මුරපදය තහවුරු කරන්න',
  registerButton: 'ලියාපදිංචි වන්න',
  loginPrompt: 'දැනටමත් ගිණුමක් තිබේද? ',
  loginLink: 'ඇතුල් වන්න',
};

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [landSize, setLandSize] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleRegister = () => {
    // Navigate to login screen after registration as requested
    router.push('/auth/login');
  };

  const handleLogin = () => {
    router.push('/auth/login');
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
            <Text style={styles.title}>{REGISTER_CONTENT.title}</Text>
            <Text style={styles.subtitle}>{REGISTER_CONTENT.subtitle}</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder={REGISTER_CONTENT.name}
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder={REGISTER_CONTENT.district}
              placeholderTextColor="#999"
              value={district}
              onChangeText={setDistrict}
            />
            <TextInput
              style={styles.input}
              placeholder={REGISTER_CONTENT.landSize}
              placeholderTextColor="#999"
              value={landSize}
              onChangeText={setLandSize}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={REGISTER_CONTENT.email}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder={REGISTER_CONTENT.password}
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
            <TextInput
              style={styles.input}
              placeholder={REGISTER_CONTENT.confirmPassword}
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{REGISTER_CONTENT.registerButton}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{REGISTER_CONTENT.loginPrompt}</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>{REGISTER_CONTENT.loginLink}</Text>
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
    marginBottom: 15,
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
  registerButton: {
    backgroundColor: '#3A8A55',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  buttonText: {
    ...Fonts.styles.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...Fonts.styles.regular,
    fontSize: 15,
    color: '#666666',
  },
  loginLink: {
    ...Fonts.styles.semiBold,
    fontSize: 15,
    color: '#3A8A55',
  },
});
