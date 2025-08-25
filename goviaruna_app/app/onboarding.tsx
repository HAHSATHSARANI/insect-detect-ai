import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, FlatList, ViewToken } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';

const { width, height } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  subtitle: string;
  illustration: string;
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Placeholder onboarding data - you can customize this based on your needs
  const onboardingData: OnboardingItem[] = [
    {
      id: '1',
      title: 'Detect Insects',
      subtitle: 'Identify harmful insects in your rice field using AI technology',
      illustration: 'detect'
    },
    {
      id: '2',
      title: 'Get Solutions',
      subtitle: 'Receive expert recommendations for pest control and crop protection',
      illustration: 'solutions'
    },
    {
      id: '3',
      title: 'Track Progress',
      subtitle: 'Monitor your field health and maintain records of treatments',
      illustration: 'track'
    }
  ];

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    router.push('/language');
  };

  const handleGetStarted = () => {
    router.push('/language');
  };

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  const renderOnboardingItem = ({ item, index }: { item: OnboardingItem; index: number }) => (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>
        {/* Placeholder illustration */}
        <View style={[styles.illustration, getIllustrationStyle(item.illustration)]} />
      </View>
      
      <View style={styles.textContainer}>
        <ThemedText style={styles.title}>{item.title}</ThemedText>
        <ThemedText style={styles.subtitle}>{item.subtitle}</ThemedText>
      </View>
    </View>
  );

  const getIllustrationStyle = (type: string) => {
    switch (type) {
      case 'detect':
        return { backgroundColor: '#4CAF50' };
      case 'solutions':
        return { backgroundColor: '#FF9800' };
      case 'track':
        return { backgroundColor: '#2196F3' };
      default:
        return { backgroundColor: '#9E9E9E' };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#2D5016', '#4A7C23']}
        style={styles.background}
      >
        {/* Header with Skip button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip}>
            <ThemedText style={styles.skipButton}>
              {t('onboarding.skip')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Onboarding slides */}
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderOnboardingItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        />

        {/* Page indicators */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator
              ]}
            />
          ))}
        </View>

        {/* Bottom button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1 
                ? t('onboarding.getStarted') 
                : t('onboarding.next')
              }
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  skipButton: {
    fontSize: 16,
    color: '#E8F5E8',
    opacity: 0.8,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  illustration: {
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
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
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  nextButton: {
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
