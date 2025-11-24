import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { Fonts, getFontStyle } from '@/constants/Fonts';
import { BackButton } from '@/components/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LanguageSelectionScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  useEffect(() => {
    setSelectedLang(i18n.language);
  }, [i18n.language]);

  const handleLanguageSelect = (language: string) => {
    setSelectedLang(language);
  };
  
  const handleStart = async () => {
    await i18n.changeLanguage(selectedLang);
    await AsyncStorage.setItem('language', selectedLang);
    router.replace('/(tabs)'); // Navigate to the main app tabs
  };

  const currentLang = selectedLang as 'si' | 'en';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <BackButton />
      
      <View style={styles.header}>
        <Text style={[styles.title, getFontStyle('bold', 36, currentLang)]}>{t('language.title')}</Text>
        <Text style={[styles.subtitle, getFontStyle('regular', 18, currentLang)]}>{t('language.subtitle')}</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.languageButton, selectedLang === 'si' && styles.selectedButton]}
          onPress={() => handleLanguageSelect('si')}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.languageText, 
            selectedLang === 'si' && styles.selectedText,
            getFontStyle('semiBold', 18, 'si')
          ]}>
            {t('language.sinhala')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.languageButton, selectedLang === 'en' && styles.selectedButton]}
          onPress={() => handleLanguageSelect('en')}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.languageText, 
            selectedLang === 'en' && styles.selectedText,
            getFontStyle('semiBold', 18, 'en')
          ]}>
            {t('language.english')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={handleStart}
        activeOpacity={0.8}
      >
        <Text style={[styles.startButtonText, getFontStyle('semiBold', 18, currentLang)]}>
          {t('language.start')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    color: '#222222',
    marginBottom: 12,
  },
  subtitle: {
    color: '#666666',
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 40,
  },
  languageButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedButton: {
    borderColor: '#3A8A55',
    backgroundColor: '#E8F5E9',
  },
  languageText: {
    color: '#333333',
  },
  selectedText: {
    color: '#3A8A55',
  },
  startButton: {
    backgroundColor: '#3A8A55',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
  },
  startButtonText: {
    color: '#FFFFFF',
  },
});
