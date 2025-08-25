import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';

const { width, height } = Dimensions.get('window');

const ONBOARDING_CONTENT = {
  title: 'කෘමීන් දැනගන්න, විශ්වාසයෙන් වැඩෙන්න',
  subtitle: 'පළිබෝධකයන් කලින් හඳුනාගෙන, විසඳුම් සොයා ගෙන, ඔබේ අස්වැන්න පහසුවෙන් ආරක්ෂා කරගන්න.',
  skip: 'මඟ හරින්න',
  next: 'ඊළඟ',
};

export default function OnboardingScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/language');
  };

  const handleSkip = () => {
    router.push('/language');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.topContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButtonContainer}>
          <Text style={styles.skipButton}>{ONBOARDING_CONTENT.skip}</Text>
        </TouchableOpacity>

        <Image 
          source={require('@/assets/images/onboarding_1.png')}
          style={styles.checkImage}
        />
        <Image 
          source={require('@/assets/images/onboarding_2.png')}
          style={styles.mainImage}
        />
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{ONBOARDING_CONTENT.title}</Text>
          <Text style={styles.subtitleText}>{ONBOARDING_CONTENT.subtitle}</Text>
        </View>

        <View style={styles.indicatorContainer}>
          <View style={styles.activeIndicator} />
        </View>

        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{ONBOARDING_CONTENT.next}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3A8A55', // Match the green from the screenshot
  },
  topContainer: {
    flex: 0.55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  skipButton: {
    ...Fonts.styles.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  mainImage: {
    width: width * 0.62, // Made the image smaller
    height: width * 0.62, // Made the image smaller
    resizeMode: 'contain',
    marginTop: 100, // Moved the image down
  },
  checkImage: {
    position: 'absolute',
    top: '25%', // Moved the image higher
    right: '15%',
    width: 70, // Made the image larger
    height: 70, // Made the image larger
    resizeMode: 'contain',
    opacity: 0.8,
  },
  bottomContainer: {
    flex: 0.45,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    ...Fonts.styles.bold,
    fontSize: 26,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 36,
  },
  subtitleText: {
    ...Fonts.styles.regular,
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  indicatorContainer: {
    marginBottom: 20,
  },
  activeIndicator: {
    width: 25,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3A8A55',
  },
  nextButton: {
    backgroundColor: '#3A8A55',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    ...Fonts.styles.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
});
