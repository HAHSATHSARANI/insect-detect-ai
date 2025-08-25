import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLLECTION_CONTENT = {
  title: 'එකතුව',
  emptyTitle: 'ඔබට එකතුවක් නැත.',
  emptySubtitle: 'ඔබේ කෘමියා එකතු කරන්න',
  addButton: 'කෘමියා එකතු කරන්න',
};

export default function CollectionScreen() {
  const router = useRouter();
  // For now, we are only building the empty state.
  const insects: any[] = [];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{COLLECTION_CONTENT.title}</Text>
      </View>
      
      {insects.length === 0 ? (
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
        <View>
          {/* // TODO: Implement the list for when insects are present */}
          <Text>Insect collection list will go here.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean white background
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
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
