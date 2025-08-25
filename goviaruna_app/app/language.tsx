import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';

const { width, height } = Dimensions.get('window');

export default function LanguageSelectionScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const handleLanguageSelect = async (language: string) => {
    await i18n.changeLanguage(language);
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#2D5016', '#4A7C23']}
        style={styles.background}
      >
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title}>
              {t('language.selectLanguage')}
            </ThemedText>
          </View>

          {/* Language options */}
          <View style={styles.languageContainer}>
            {/* Sinhala Option */}
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => handleLanguageSelect('si')}
              activeOpacity={0.8}
            >
              <View style={styles.languageContent}>
                <ThemedText style={styles.languageText}>
                  සිංහල
                </ThemedText>
                <ThemedText style={styles.languageSubtext}>
                  Sinhala
                </ThemedText>
              </View>
            </TouchableOpacity>

            {/* English Option */}
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.8}
            >
              <View style={styles.languageContent}>
                <ThemedText style={styles.languageText}>
                  English
                </ThemedText>
                <ThemedText style={styles.languageSubtext}>
                  English
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* App logo/illustration */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <ThemedText style={styles.logoText}>
                ගොවි අරුණ
              </ThemedText>
            </View>
          </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  titleContainer: {
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  languageContainer: {
    width: '100%',
    marginBottom: 60,
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  languageContent: {
    alignItems: 'center',
  },
  languageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 4,
  },
  languageSubtext: {
    fontSize: 16,
    color: '#4A7C23',
    opacity: 0.8,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    padding: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
