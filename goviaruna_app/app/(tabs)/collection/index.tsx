import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Fonts, getFontStyle } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function CollectionScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCollections = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        const data = await api.collections.getUserCollections(user.id);
        // Sort by date descending (newest first)
        const sortedData = data.sort((a: any, b: any) => {
           const dateA = new Date(a.date || a.createdAt).getTime();
           const dateB = new Date(b.date || b.createdAt).getTime();
           return dateB - dateA;
        });
        setCollections(sortedData);
      }
    } catch (error) {
      console.error('Fetch collections error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchCollections();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCollections();
  }, []);

  const handleEdit = (id: string) => {
    router.push({ pathname: '/collection/create', params: { id } });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('collection.delete_confirm_title'),
      t('collection.delete_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.collections.delete(id);
              // Optimistic update or refresh
              setCollections(prev => prev.filter(c => c.id !== id));
              Alert.alert(t('common.success'), t('collection.delete_success'));
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert(t('common.error'), t('collection.delete_fail'));
            }
          }
        }
      ]
    );
  };

  const renderCollectionItem = ({ item }: { item: any }) => {
    const date = item.date ? new Date(item.date) : new Date(item.createdAt);
    const dateString = date.toLocaleDateString(i18n.language === 'si' ? 'si-LK' : 'en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/collection/${item.id}`)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Feather name="folder" size={24} color="#3A8A55" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, getFontStyle('semiBold', 16, lang)]}>{item.name}</Text>
            <Text style={[styles.cardDate, getFontStyle('regular', 12, lang)]}>{dateString}</Text>
            <Text style={[styles.cardItemsCount, getFontStyle('medium', 12, lang)]}>{item.items?.length || 0} කෘමීන්</Text>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={(e) => {
              e.stopPropagation();
              handleEdit(item.id);
            }}
          >
            <Feather name="edit-2" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { marginLeft: 15 }]} 
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
          >
            <Feather name="trash-2" size={18} color="#FF5252" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, getFontStyle('bold', 22, lang)]}>{t('collection.title')}</Text>
        {collections.length > 0 && (
           <TouchableOpacity onPress={() => router.push('/collection/create')}>
             <Feather name="plus" size={24} color="#3A8A55" />
           </TouchableOpacity>
        )}
      </View>
      
      {collections.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('@/assets/images/empty_collection.png')}
            style={styles.emptyImage}
          />
          <Text style={[styles.emptyTitle, getFontStyle('semiBold', 22, lang)]}>{t('collection.empty_title')}</Text>
          <Text style={[styles.emptySubtitle, getFontStyle('regular', 16, lang)]}>{t('collection.empty_subtitle')}</Text>
          
          <TouchableOpacity 
            style={styles.addButton} 
            activeOpacity={0.8}
            onPress={() => router.push('/collection/create')}
          >
            <Feather name="plus-circle" size={22} color="#3A8A55" />
            <Text style={[styles.addButtonText, getFontStyle('semiBold', 16, lang)]}>{t('collection.add_insect')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={collections}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3A8A55']} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    color: '#222222',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#222',
    marginBottom: 4,
  },
  cardDate: {
    color: '#888',
    marginBottom: 2,
  },
  cardItemsCount: {
    color: '#3A8A55',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
  },
  emptyImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 35,
  },
  emptyTitle: {
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#888888',
    textAlign: 'center',
    marginBottom: 35,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 30,
  },
  addButtonText: {
    color: '#3A8A55',
    marginLeft: 12,
  },
});
