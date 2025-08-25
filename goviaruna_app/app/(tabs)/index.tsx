import React from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import InsectCard from '@/components/InsectCard';

const HOME_CONTENT = {
  welcome: 'ආයුබෝවන්',
  userName: 'නදී',
  title: 'ගොවි අරුණ',
  searchPlaceholder: 'සොයන්න',
  detectAction: 'කැමරාවෙන් හදුනාගන්න',
  uploadAction: 'ගොනුවකින් එකතු කරන්න',
  commonInsectsTitle: 'වඩාත් සුලබ කෘමීන්',
  commonInsectsSubtitle: 'ශ්‍රී ලංකාවේ බහුලවම වාර්තා වන කෘමීන්',
  contactTitle: 'හදිසි ඇමතුම්',
  contactItems: [
    { icon: 'voicemail', title: 'Voice mail', subtitle: 'Send Voice Mail', key: '1' },
    { icon: 'mail', title: 'Mail', subtitle: 'Example@gmail.com', key: '2' },
    { icon: 'phone-call', title: 'whatsapp / Viber/ Skype', subtitle: '070 220 1920', key: '3' },
  ],
  mapTitle: 'ගොවිජන සේවා මධ්‍යස්ථාන',
};

const INSECT_DATA = [
  { id: '1', image: require('@/assets/images/insect_1.png'), title: 'ලේඩි බග් මකුණා', subtitle: 'Pilea Peperomioides', tag: 'Beneficial' },
  { id: '2', image: require('@/assets/images/insect_2.png'), title: 'තණකොළ පෙත්තා', subtitle: 'Pilea Peperomioides', tag: 'Harmful' },
  { id: '3', image: require('@/assets/images/insect_1.png'), title: 'ලේඩි බග් මකුණා', subtitle: 'Pilea Peperomioides', tag: 'Beneficial' },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.avatar} />
          <View>
            <Text style={styles.welcomeText}>{HOME_CONTENT.welcome} 👋</Text>
            <Text style={styles.userName}>{HOME_CONTENT.userName}</Text>
          </View>
          <Text style={styles.headerTitle}>{HOME_CONTENT.title}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={22} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder={HOME_CONTENT.searchPlaceholder}
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
        </View>

        {/* Action Cards */}
        <View style={styles.actionCardContainer}>
          <TouchableOpacity style={styles.actionCard}>
            <Feather name="camera" size={28} color="#3A8A55" />
            <Text style={styles.actionText}>{HOME_CONTENT.detectAction}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Feather name="folder-plus" size={28} color="#3A8A55" />
            <Text style={styles.actionText}>{HOME_CONTENT.uploadAction}</Text>
          </TouchableOpacity>
        </View>

        {/* Common Insects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{HOME_CONTENT.commonInsectsTitle}</Text>
          <Text style={styles.sectionSubtitle}>{HOME_CONTENT.commonInsectsSubtitle}</Text>
          <FlatList
            data={INSECT_DATA}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <InsectCard
                imageSource={item.image}
                title={item.title}
                subtitle={item.subtitle}
                tag={item.tag as 'Harmful' | 'Beneficial'}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={{ marginTop: 15 }}
          />
        </View>
        
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{HOME_CONTENT.contactTitle}</Text>
          {HOME_CONTENT.contactItems.map(item => (
            <TouchableOpacity key={item.key} style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Feather name={item.icon as any} size={24} color="#3A8A55" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactTitle}>{item.title}</Text>
                <Text style={styles.contactSubtitle}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={24} color="#BDBDBD" />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Map Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{HOME_CONTENT.mapTitle}</Text>
           <Image source={require('@/assets/images/sample_map.png')} style={styles.mapImage} />
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
    ...Fonts.styles.regular,
    fontSize: 16,
    color: '#666',
  },
  userName: {
    ...Fonts.styles.bold,
    fontSize: 20,
    color: '#222',
  },
  headerTitle: {
    ...Fonts.styles.bold,
    fontSize: 22,
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
    ...Fonts.styles.regular,
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
    ...Fonts.styles.semiBold,
    fontSize: 14,
    color: '#3A8A55',
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...Fonts.styles.bold,
    fontSize: 20,
    color: '#222',
  },
  sectionSubtitle: {
    ...Fonts.styles.regular,
    fontSize: 14,
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
    ...Fonts.styles.semiBold,
    fontSize: 16,
    color: '#333',
  },
  contactSubtitle: {
    ...Fonts.styles.regular,
    fontSize: 14,
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
