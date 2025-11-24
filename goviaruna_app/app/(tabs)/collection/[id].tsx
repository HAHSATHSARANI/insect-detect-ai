import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fonts, getFontStyle } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import { api, API_URL } from '@/services/api';
import { useTranslation } from 'react-i18next';

export default function CollectionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollection();
  }, [id]);

  const loadCollection = async () => {
    try {
      const data = await api.collections.getCollection(id as string);
      setCollection(data);
    } catch (error) {
      console.error('Error loading collection:', error);
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: any) => {
    // Navigate to insect details, passing the saved data
    // We construct the image URI from the file ID if it's stored that way
    let imageUri = item.imageUrl;
    if (item.imageUrl && !item.imageUrl.startsWith('http') && !item.imageUrl.startsWith('file')) {
         // Assume it's a file ID served by our backend
         imageUri = `${API_URL}/api/insects/image/${item.imageUrl}`;
    }

    router.push({
      pathname: '/insect-details',
      params: { 
        savedData: JSON.stringify(item),
        imageUri: imageUri // Pass this so the image can be displayed
      }
    });
  };

  const handleDeleteItem = (index: number) => {
      Alert.alert(
          t('collection.delete'),
          t('collection.delete_confirm_message'),
          [
              { text: t('common.cancel'), style: 'cancel' },
              { 
                  text: t('common.delete'), 
                  style: 'destructive',
                  onPress: async () => {
                      try {
                          await api.collections.removeItem(id as string, index);
                          loadCollection(); // Reload
                      } catch (error) {
                          Alert.alert(t('common.error'), t('common.error'));
                      }
                  }
              }
          ]
      );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A8A55" />
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.container}>
        <Text style={[styles.emptyText, getFontStyle('regular', 16, lang)]}>Collection not found</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: any, index: number }) => {
      let imageUrl = item.imageUrl;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('file')) {
          imageUrl = `${API_URL}/api/insects/image/${imageUrl}`;
      }

      return (
        <TouchableOpacity style={styles.itemCard} onPress={() => handleItemPress(item)}>
          <Image source={{ uri: imageUrl }} style={styles.itemImage} />
          <View style={styles.itemContent}>
            <Text style={[styles.itemName, getFontStyle('semiBold', 16, lang)]}>{item.insectName}</Text>
            <Text style={[styles.scientificName, getFontStyle('regular', 12, lang)]}>{item.scientificName}</Text>
            <Text style={[styles.category, getFontStyle('medium', 12, lang)]}>{item.category}</Text>
          </View>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteItem(index)}>
              <Feather name="trash-2" size={20} color="#FF5252" />
          </TouchableOpacity>
        </TouchableOpacity>
      );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, getFontStyle('bold', 20, lang)]}>{collection.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={collection.items}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, getFontStyle('regular', 16, lang)]}>{t('collection.empty_subtitle')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 20, color: '#222' },
  backButton: { padding: 5 },
  listContent: { padding: 20 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
  itemContent: { flex: 1 },
  itemName: { fontSize: 16, color: '#333' },
  scientificName: { fontSize: 12, color: '#666' },
  category: { fontSize: 12, color: '#3A8A55', marginTop: 2 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#888', textAlign: 'center' },
  deleteButton: { padding: 10 },
});

