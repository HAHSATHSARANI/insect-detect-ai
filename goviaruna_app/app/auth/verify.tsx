import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';
import { AntDesign } from '@expo/vector-icons';

const VERIFY_CONTENT = {
  title: 'සත්‍යාපන කේතය ඇතුළත් කරන්න',
  subtitle: 'අපි Knightowl@gmail.com වෙත කේතය යවා ඇත.',
  resendPrompt: 'කේතයක් ලැබුණේ නැද්ද? ',
  resendLink: 'නැවත යැවීමට ක්ලික් කරන්න.',
  cancelButton: 'Cancel',
  verifyButton: 'Verify',
  or: 'හෝ',
  googleButton: 'Google සමඟ ලියාපදිංචි වන්න',
};

export default function VerifyScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleVerify = () => {
    // TODO: Implement actual verification logic
    router.push('/(tabs)');
  };

  const handleResendCode = () => {
    // TODO: Implement resend code logic
    console.log('Resending verification code...');
  };
  
  const handleInputChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
            <Text style={styles.title}>{VERIFY_CONTENT.title}</Text>
            <Text style={styles.subtitle}>{VERIFY_CONTENT.subtitle}</Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(text) => handleInputChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                value={digit}
              />
            ))}
          </View>
          
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>{VERIFY_CONTENT.resendPrompt}</Text>
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendLink}>{VERIFY_CONTENT.resendLink}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>{VERIFY_CONTENT.cancelButton}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.verifyButton]}
              onPress={handleVerify}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{VERIFY_CONTENT.verifyButton}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>{VERIFY_CONTENT.or}</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity 
            style={styles.googleButton}
            activeOpacity={0.8}
          >
            <Image source={require('@/assets/images/google.png')} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>{VERIFY_CONTENT.googleButton}</Text>
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...Fonts.styles.regular,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    ...Fonts.styles.bold,
    width: 60,
    height: 60,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    fontSize: 24,
    color: '#3A8A55',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#D3EAD5',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    ...Fonts.styles.regular,
    fontSize: 14,
    color: '#666666',
  },
  resendLink: {
    ...Fonts.styles.semiBold,
    fontSize: 14,
    color: '#3A8A55',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginRight: 10,
  },
  verifyButton: {
    backgroundColor: '#3A8A55',
    marginLeft: 10,
  },
  buttonText: {
    ...Fonts.styles.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#333333',
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
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  googleIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
  },
  googleButtonText: {
    ...Fonts.styles.semiBold,
    fontSize: 16,
    color: '#444444',
  },
});
