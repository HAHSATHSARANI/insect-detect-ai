import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLLECTION_CONTENT = {
  title: 'එකතුව',
  emptyTitle: 'ඔබට එකතුවක් නැත.',
  emptySubtitle: 'ඔබේ කෘමියා එකතු කරන්න',
  addButton: 'කෘමියා එකතු කරන්න',
  deleteConfirmTitle: 'එකතුව මකන්න',
  deleteConfirmMessage: 'ඔබට මෙම එකතුව මැකීමට අවශ්‍ය බව විශ්වාසද?',
  deleteSuccess: 'එකතුව මකා දමන ලදී',
  cancel: 'අවලංගු කරන්න',
  delete: 'මකන්න',
};

export default function CollectionScreen() {
  const router = useRouter();
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
      COLLECTION_CONTENT.deleteConfirmTitle,
      COLLECTION_CONTENT.deleteConfirmMessage,
      [
        { text: COLLECTION_CONTENT.cancel, style: 'cancel' },
        { 
          text: COLLECTION_CONTENT.delete, 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.collections.delete(id);
              // Optimistic update or refresh
              setCollections(prev => prev.filter(c => c.id !== id));
              Alert.alert('සාර්ථකයි', COLLECTION_CONTENT.deleteSuccess);
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('දෝෂයකි', 'එකතුව මැකීම අසාර්ථක විය');
            }
          }
        }
      ]
    );
  };

  const renderCollectionItem = ({ item }: { item: any }) => {
    const date = item.date ? new Date(item.date) : new Date(item.createdAt);
    const dateString = date.toLocaleDateString('si-LK', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Feather name="folder" size={24} color="#3A8A55" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDate}>{dateString}</Text>
            <Text style={styles.cardItemsCount}>{item.items?.length || 0} කෘමීන්</Text>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleEdit(item.id)}
          >
            <Feather name="edit-2" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { marginLeft: 15 }]} 
            onPress={() => handleDelete(item.id)}
          >
            <Feather name="trash-2" size={18} color="#FF5252" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{COLLECTION_CONTENT.title}</Text>
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
          <Text style={styles.emptyTitle}>{COLLECTION_CONTENT.emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{COLLECTION_CONTENT.emptySubtitle}</Text>
          
          <TouchableOpacity 
            style={styles.addButton} 
            activeOpacity={0.8}
            onPress={() => router.push('/collection/create')}
          >
            <Feather name="plus-circle" size={22} color="#3A8A55" />
            <Text style={styles.addButtonText}>{COLLECTION_CONTENT.addButton}</Text>
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
    ...Fonts.styles.bold,
    fontSize: 22,
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
    ...Fonts.styles.semiBold,
    fontSize: 16,
    color: '#222',
    marginBottom: 4,
  },
  cardDate: {
    ...Fonts.styles.regular,
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  cardItemsCount: {
    ...Fonts.styles.medium,
    fontSize: 12,
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
    ...Fonts.styles.semiBold,
    fontSize: 22,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    ...Fonts.styles.regular,
    fontSize: 16,
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
    ...Fonts.styles.semiBold,
    fontSize: 16,
    color: '#3A8A55',
    marginLeft: 12,
  },
});
