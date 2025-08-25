import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';

const LANG_CONTENT = {
  title: 'ගොවි අරුණ',
  subtitle: 'ඔබේ භාෂාව තෝරන්න',
  sinhala: 'සිංහල',
  english: 'English',
  startButton: 'ආරම්භ කරන්න',
};

export default function LanguageSelectionScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  const handleLanguageSelect = (language: string) => {
    setSelectedLang(language);
  };
  
  const handleStart = async () => {
    await i18n.changeLanguage(selectedLang);
    router.push('/(tabs)'); // Navigate to the main app tabs
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>{LANG_CONTENT.title}</Text>
        <Text style={styles.subtitle}>{LANG_CONTENT.subtitle}</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.languageButton, selectedLang === 'si' && styles.selectedButton]}
          onPress={() => handleLanguageSelect('si')}
          activeOpacity={0.8}
        >
          <Text style={[styles.languageText, selectedLang === 'si' && styles.selectedText]}>
            {LANG_CONTENT.sinhala}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.languageButton, selectedLang === 'en' && styles.selectedButton]}
          onPress={() => handleLanguageSelect('en')}
          activeOpacity={0.8}
        >
          <Text style={[styles.languageText, selectedLang === 'en' && styles.selectedText]}>
            {LANG_CONTENT.english}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={handleStart}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>{LANG_CONTENT.startButton}</Text>
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
    ...Fonts.styles.bold,
    fontSize: 36,
    color: '#222222',
    marginBottom: 12,
  },
  subtitle: {
    ...Fonts.styles.regular,
    fontSize: 18,
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
    ...Fonts.styles.semiBold,
    fontSize: 18,
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
    ...Fonts.styles.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
});
