import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TextInput, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getFontStyle } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import InsectCard from '@/components/InsectCard';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, API_URL } from '@/services/api';

// Removed static INSECT_DATA


export default function HomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  const [user, setUser] = useState<any>(null);
  const [featuredInsects, setFeaturedInsects] = useState<any[]>([]);

  const CONTACT_ITEMS = [
    { icon: 'mail', title: 'Mail', subtitle: 'info@agrimin.gov.lk', key: '1', type: 'email' },
    { icon: 'phone-call', title: 'Whatsapp No 1', subtitle: '+94 812 388 331', key: '2', type: 'phone' },
    { icon: 'phone-call', title: 'Whatsapp No 2', subtitle: '+94 812 388 332', key: '3', type: 'phone' },
    { icon: 'phone-call', title: 'Whatsapp No 3', subtitle: '+94 812 388 334', key: '4', type: 'phone' },
  ];

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const storedUser = JSON.parse(userJson);
        setUser(storedUser);

        // Try to fetch fresh data, but don't fail if it doesn't work
        try {
          const freshUser = await api.auth.getUser(storedUser.id);
          setUser(freshUser);
        } catch (error) {
          console.log('Could not fetch fresh user data, using stored data');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadRandomInsects = async () => {
    try {
      const insects = await api.insects.getRandom();
      // console.log('DEBUG: Random insects fetched:', JSON.stringify(insects, null, 2)); // DEBUG PRINT

      const mappedInsects = insects.map((insect: any) => {
        let imageSource = require('@/assets/images/insect_1.png');
        if (insect.images && insect.images.length > 0) {
          // Use first image from DB
          const imageId = insect.images[0];
          if (typeof imageId === 'string') {
            imageSource = { uri: `${API_URL}/api/insects/image/${imageId}` };
          }
        }

        return {
          id: insect.id,
          title: insect.name,
          subtitle: insect.scientificName,
          tag: insect.category === 'Non-Harmful' ? 'Beneficial' : insect.category,
          image: imageSource,
          fullData: insect
        };
      });
      setFeaturedInsects(mappedInsects);
    } catch (error) {
      console.error('Error loading random insects:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadRandomInsects();
    }, [])
  );

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        router.push({
          pathname: '/insect-details',
          params: { imageUri: result.assets[0].uri }
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), 'Failed to select image');
    }
  };

  const handleContactPress = async (item: any) => {
    try {
      if (item.type === 'email') {
        await Linking.openURL(`mailto:${item.subtitle}`);
      } else if (item.type === 'phone') {
        await Linking.openURL(`tel:${item.subtitle}`);
      }
    } catch (error) {
      console.error('Error opening contact:', error);
      Alert.alert(t('common.error'), 'Could not open contact');
    }
  };

  const handleMapPress = async () => {
    try {
      // Open Google Maps with search for agriculture offices in Sri Lanka
      const query = 'Agriculture Office Sri Lanka';
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening map:', error);
      Alert.alert(t('common.error'), 'Could not open map');
    }
  };


  const getProfileImageUrl = () => {
    if (user?.localImageUri) {
      // Use local image if available (for offline functionality)
      return { uri: user.localImageUri };
    }
    if (user?.imageUrl && !user.imageUrl.startsWith('local_')) {
      return { uri: `${API_URL}/api/app/auth/image/${user.imageUrl}` };
    }
    // Use a generated avatar with user's name
    return { uri: `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3A8A55&color=fff&size=48` };
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={getProfileImageUrl()} style={styles.avatar} />
          <View>
            <Text style={[styles.welcomeText, getFontStyle('regular', 16, lang)]}>{t('home.welcome')} 👋</Text>
            <Text style={[styles.userName, getFontStyle('bold', 20, 'en')]}>{user?.name || 'User'}</Text>
          </View>
          <Text style={[styles.headerTitle, getFontStyle('bold', 22, lang)]}>{t('welcome.title')}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={22} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder={t('home.searchPlaceholder')}
            style={[styles.searchInput, getFontStyle('regular', 16, lang)]}
            placeholderTextColor="#888"
          />
        </View>

        {/* Action Cards */}
        <View style={styles.actionCardContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/camera')}>
            <Feather name="camera" size={28} color="#3A8A55" />
            <Text style={[styles.actionText, getFontStyle('semiBold', 14, lang)]}>{t('home.detectAction')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={pickImage}>
            <Feather name="folder-plus" size={28} color="#3A8A55" />
            <Text style={[styles.actionText, getFontStyle('semiBold', 14, lang)]}>{t('home.uploadAction')}</Text>
          </TouchableOpacity>
        </View>

        {/* Common Insects Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, getFontStyle('bold', 20, lang)]}>{t('home.commonInsectsTitle')}</Text>
          <Text style={[styles.sectionSubtitle, getFontStyle('regular', 14, lang)]}>{t('home.commonInsectsSubtitle')}</Text>
          <FlatList
            data={featuredInsects}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <InsectCard
                imageSource={item.image}
                title={item.title}
                subtitle={item.subtitle}
                tag={item.tag as 'Harmful' | 'Beneficial'}
                onPress={() => {
                  router.push({
                    pathname: '/insect-details',
                    params: {
                      savedData: JSON.stringify({ insectData: item.fullData })
                    }
                  });
                }}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={{ marginTop: 15 }}
            ListEmptyComponent={
              <Text style={{ marginLeft: 20, marginTop: 20, color: '#888' }}>Loading...</Text>
            }
          />
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, getFontStyle('bold', 20, lang)]}>{t('home.contactTitle')}</Text>
          {CONTACT_ITEMS.map(item => (
            <TouchableOpacity key={item.key} style={styles.contactItem} onPress={() => handleContactPress(item)}>
              <View style={styles.contactIconContainer}>
                <Feather name={item.icon as any} size={24} color="#3A8A55" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={[styles.contactTitle, getFontStyle('semiBold', 16, 'en')]}>{item.title}</Text>
                <Text style={[styles.contactSubtitle, getFontStyle('regular', 14, 'en')]}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={24} color="#BDBDBD" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Map Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, getFontStyle('bold', 20, lang)]}>{t('home.mapTitle')}</Text>
          <TouchableOpacity onPress={handleMapPress} activeOpacity={0.8}>
            <Image source={require('@/assets/images/sample_map.png')} style={styles.mapImage} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  welcomeText: {
    color: '#666',
  },
  userName: {
    color: '#222',
  },
  headerTitle: {
    color: '#222',
    position: 'absolute',
    right: 20,
    top: 75,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 55,
    fontSize: 16,
  },
  actionCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
  },
  actionCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  actionText: {
    color: '#3A8A55',
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#222',
  },
  sectionSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
  },
  contactIconContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    color: '#333',
  },
  contactSubtitle: {
    color: '#888',
  },
  mapImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginTop: 15,
    marginBottom: 40,
  },
});
