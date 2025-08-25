import React from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { t, ready } = useTranslation();
  const router = useRouter();

  // Fallback text if translation is not ready
  const getText = (key: string, fallback: string) => {
    return ready ? t(key) : fallback;
  };

  // Get the actual text that will be displayed
  const titleText = getText('welcome.title', 'ගොවි අරුණ');
  const subtitleText = getText('welcome.subtitle', 'ශ්‍රී ලංකාවේ වී කෘමීන් හඳුනා ගන්න');

  // Debug: Log the texts and fonts
  console.log('Title text:', titleText);
  console.log('Title font should be: AbhayaLibre-Regular');
  console.log('Subtitle text:', subtitleText);
  console.log('Subtitle font should be: AbhayaLibre-SemiBold');

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background image */}
      <ImageBackground
        source={require('@/assets/images/Welcome screen.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Overlay for better text readability */}
        <View style={styles.overlay}>
          {/* Main content */}
          <View style={styles.content}>
            {/* Text content */}
            <View style={styles.textContainer}>
              <Text style={styles.titleWithFont}>
                {titleText}
              </Text>
              <Text style={styles.subtitleWithFont}>
                {subtitleText}
              </Text>
            </View>
          </View>

          {/* Bottom button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {getText('welcome.button', 'ඉදිරියට යන්න')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darker overlay for better text readability
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 25, // Reduced padding to bring text lower
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20, // Reduced margin to bring text closer to button
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  titleWithFont: {
    fontSize: 42,
    fontFamily: 'AbhayaLibre-Bold',
    fontWeight: 'normal',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    paddingHorizontal: 20,
  },
  subtitleWithFont: {
    fontSize: 18,
    fontFamily: 'AbhayaLibre-Regular',
    fontWeight: 'normal',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
    paddingHorizontal: 15,
    opacity: 0.95,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 25,
    alignItems: 'center',
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
    fontFamily: 'AbhayaLibre-SemiBold',
    fontWeight: 'normal',
    color: '#2D5016',
    letterSpacing: 0.5,
  },
});
