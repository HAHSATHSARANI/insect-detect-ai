import React from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { t, ready } = useTranslation();
  const router = useRouter();

  // Fallback text if translation is not ready
  const getText = (key: string, fallback: string) => {
    return ready ? t(key) : fallback;
  };

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background with gradient overlay */}
      <LinearGradient
        colors={['#2D5016', '#4A7C23', '#2D5016']}
        style={styles.background}
      >
        {/* Main content */}
        <View style={styles.content}>
          {/* Insect illustration area */}
          <View style={styles.illustrationContainer}>
            {/* This would be replaced with the actual mantis/insect illustration */}
            <View style={styles.insectPlaceholder}>
              {/* Placeholder for the mantis illustration */}
              <View style={styles.mantisBody} />
              <View style={styles.mantisHead} />
              <View style={styles.mantisArm1} />
              <View style={styles.mantisArm2} />
            </View>
            
            {/* Rice plant elements */}
            <View style={styles.ricePlants}>
              <View style={styles.ricePlant1} />
              <View style={styles.ricePlant2} />
            </View>
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <ThemedText style={styles.title} type="title">
              {getText('welcome.title', 'ගොවි අරුණ')}
            </ThemedText>
            <ThemedText style={styles.subtitle} type="subtitle">
              {getText('welcome.subtitle', 'ශ්‍රී ලංකාවේ වී කෙතෙන් හදනා ගන්නා')}
            </ThemedText>
          </View>
        </View>

        {/* Bottom button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText} type="defaultSemiBold">
              {getText('welcome.button', 'ඉදිරියට යන්න')}
            </ThemedText>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  insectPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Simplified mantis illustration using basic shapes
  mantisBody: {
    width: 60,
    height: 120,
    backgroundColor: '#7CB342',
    borderRadius: 30,
    position: 'relative',
  },
  mantisHead: {
    width: 40,
    height: 40,
    backgroundColor: '#8BC34A',
    borderRadius: 20,
    position: 'absolute',
    top: -20,
  },
  mantisArm1: {
    width: 80,
    height: 8,
    backgroundColor: '#7CB342',
    borderRadius: 4,
    position: 'absolute',
    top: 20,
    left: -40,
    transform: [{ rotate: '45deg' }],
  },
  mantisArm2: {
    width: 80,
    height: 8,
    backgroundColor: '#7CB342',
    borderRadius: 4,
    position: 'absolute',
    top: 20,
    right: -40,
    transform: [{ rotate: '-45deg' }],
  },
  ricePlants: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ricePlant1: {
    width: 60,
    height: 100,
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    opacity: 0.7,
  },
  ricePlant2: {
    width: 50,
    height: 80,
    backgroundColor: '#66BB6A',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    opacity: 0.6,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
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
    fontWeight: '600',
    color: '#2D5016',
  },
});
