import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { getFontStyle } from '@/constants/Fonts';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export type InsectCardProps = {
  imageSource: any;
  title: string;
  subtitle: string;
  tag: 'Harmful' | 'Beneficial';
  onPress?: () => void;
};

const InsectCard: React.FC<InsectCardProps> = ({ imageSource, title, subtitle, tag, onPress }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  const isHarmful = tag === 'Harmful';
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/insect-details');
    }
  };

  const translatedTag = isHarmful ? t('insect_details.harmful') : t('insect_details.beneficial');

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handlePress} activeOpacity={0.8}>
      <Image source={imageSource} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={[styles.title, getFontStyle('semiBold', 16, lang)]}>{title}</Text>
        <Text style={[styles.subtitle, getFontStyle('regular', 12, 'en')]}>{subtitle}</Text>
        <View style={[styles.tagContainer, isHarmful ? styles.harmfulTag : styles.beneficialTag]}>
          <Text style={[
            styles.tagText, 
            isHarmful ? styles.harmfulText : styles.beneficialText,
            getFontStyle('medium', 12, lang)
          ]}>
            {translatedTag}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 15,
    shadowColor: '#4A4A4A', // Softened shadow color
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06, // Greatly reduced opacity for a subtle effect
    shadowRadius: 12, // Increased radius for a more diffused shadow
    elevation: 0, // Lowered elevation for Android
    borderWidth: 1,
    borderColor: '#F0F0F0', // Added a subtle border
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  textContainer: {
    padding: 12,
  },
  title: {
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888888',
    marginBottom: 8,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  harmfulTag: {
    backgroundColor: '#FEE2E2', // Light red
  },
  beneficialTag: {
    backgroundColor: '#D1FAE5', // Light green
  },
  tagText: {
    // Font handled dynamically
  },
  harmfulText: {
    color: '#EF4444', // Red
  },
  beneficialText: {
    color: '#059669', // Green
  },
});

export default InsectCard;
