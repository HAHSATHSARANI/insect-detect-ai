import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { Fonts } from '@/constants/Fonts';

export type InsectCardProps = {
  imageSource: any;
  title: string;
  subtitle: string;
  tag: 'Harmful' | 'Beneficial';
  onPress?: () => void;
};

const InsectCard: React.FC<InsectCardProps> = ({ imageSource, title, subtitle, tag, onPress }) => {
  const isHarmful = tag === 'Harmful';

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.8}>
      <Image source={imageSource} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={[styles.tagContainer, isHarmful ? styles.harmfulTag : styles.beneficialTag]}>
          <Text style={[styles.tagText, isHarmful ? styles.harmfulText : styles.beneficialText]}>
            {tag}
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
    ...Fonts.styles.semiBold,
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    ...Fonts.styles.regular,
    fontSize: 12,
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
    ...Fonts.styles.medium,
    fontSize: 12,
  },
  harmfulText: {
    color: '#EF4444', // Red
  },
  beneficialText: {
    color: '#059669', // Green
  },
});

export default InsectCard;
